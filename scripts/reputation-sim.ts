/**
 * Reputation Calibration Simulator
 * Run: pnpm rep:sim or npm run rep:sim
 * Output: stdout report + ./reports/reputation-sim-YYYYMMDD-HHMM.json
 */

import * as fs from "fs";
import * as path from "path";
import type { ReputationEventType, CollectorTier } from "@prisma/client";
import {
  computePointsForEvent,
  computeConditionQuality,
  determineTier,
  SCORE_WEIGHTS,
  DAILY_POSITIVE_CAP,
  type SimEvent,
  type UserForTrust,
  type UserForTier,
  type AuctionForCondition,
} from "../lib/reputation-core";

// --- Seeded RNG (mulberry32) ---
function createSeededRng(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- In-memory data model ---
type SimUser = {
  id: string;
  emailVerified: Date | null;
  createdAt: Date;
  reputationScore: number;
  collectorTier: CollectorTier;
  completedSalesCount: number;
  completedPurchasesCount: number;
  disputesLostCount: number;
  uniqueCounterpartyCount: number;
};

type SimAuction = {
  id: string;
  salePriceCents: number;
  sellerId: string;
  buyerId: string | null;
  conditionGrade: string | null;
  conditionSummary: string | null;
  imperfections: unknown[];
  damageImages: { id: string }[];
};

// --- Simulation engine ---
class SimEngine {
  users: Map<string, SimUser> = new Map();
  events: SimEvent[] = [];
  auctions: Map<string, SimAuction> = new Map();
  dailyCapActivations: number = 0;

  createUser(
    id: string,
    opts: {
      createdAt?: Date;
      emailVerified?: boolean;
      reputationScore?: number;
      completedSalesCount?: number;
      completedPurchasesCount?: number;
      disputesLostCount?: number;
    } = {}
  ): SimUser {
    const createdAt = opts.createdAt ?? new Date();
    const user: SimUser = {
      id,
      emailVerified: opts.emailVerified ? createdAt : null,
      createdAt,
      reputationScore: opts.reputationScore ?? 0,
      collectorTier: "NEW",
      completedSalesCount: opts.completedSalesCount ?? 0,
      completedPurchasesCount: opts.completedPurchasesCount ?? 0,
      disputesLostCount: opts.disputesLostCount ?? 0,
      uniqueCounterpartyCount: 0,
    };
    this.users.set(id, user);
    return user;
  }

  createAuction(
    id: string,
    salePriceCents: number,
    sellerId: string,
    buyerId: string | null,
    condition?: Partial<AuctionForCondition>
  ): SimAuction {
    const a: SimAuction = {
      id,
      salePriceCents,
      sellerId,
      buyerId,
      conditionGrade: condition?.conditionGrade ?? null,
      conditionSummary: condition?.conditionSummary ?? null,
      imperfections: Array.isArray(condition?.imperfections)
        ? (condition.imperfections as unknown[])
        : [],
      damageImages: condition?.damageImages ?? [],
    };
    this.auctions.set(id, a);
    return a;
  }

  getUserEvents(userId: string): SimEvent[] {
    return this.events.filter((e) => e.userId === userId);
  }

  applyEvent(
    userId: string,
    type: ReputationEventType,
    asOfDate: Date,
    opts: { basePoints?: number; meta?: Record<string, unknown>; salePriceCents?: number } = {}
  ): { points: number; applied: boolean } {
    const user = this.users.get(userId);
    if (!user) return { points: 0, applied: false };

    const userForTrust: UserForTrust = {
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
    const existing = this.getUserEvents(userId);
    const { points, shouldApply } = computePointsForEvent(
      userId,
      userForTrust,
      { type, ...opts },
      existing,
      asOfDate,
      user.reputationScore
    );

    if (!shouldApply) return { points: 0, applied: false };

    // Track daily cap activation
    if (points > 0 && existing.length > 0) {
      const todayStart = new Date(asOfDate);
      todayStart.setUTCHours(0, 0, 0, 0);
      const todayPositive = existing
        .filter((e) => e.points > 0 && e.createdAt >= todayStart)
        .reduce((s, e) => s + e.points, 0);
      if (todayPositive >= DAILY_POSITIVE_CAP) this.dailyCapActivations++;
    }

    this.events.push({
      userId,
      type,
      points,
      basePoints: opts.basePoints ?? SCORE_WEIGHTS[type],
      meta: opts.meta,
      createdAt: asOfDate,
    });

    user.reputationScore += points;
    if (type === "SALE_COMPLETED") user.completedSalesCount++;
    if (type === "PURCHASE_COMPLETED") user.completedPurchasesCount++;
    if (type === "DISPUTE_LOST") user.disputesLostCount++;
    const counterpartyId = opts.meta?.counterpartyId as string | undefined;
    if (
      (type === "SALE_COMPLETED" || type === "PURCHASE_COMPLETED") &&
      counterpartyId
    ) {
      const priorExists = this.events.some(
        (e) =>
          e.userId === userId &&
          (e.type === "SALE_COMPLETED" || e.type === "PURCHASE_COMPLETED") &&
          (e.meta?.counterpartyId as string) === counterpartyId
      );
      if (!priorExists) user.uniqueCounterpartyCount++;
    }
    user.collectorTier = determineTier(user, asOfDate);

    return { points, applied: true };
  }

  /** Simulate a completed sale: PAYMENT_VERIFIED x2, PURCHASE_COMPLETED, SALE_COMPLETED, optional CONDITION_REPORT_QUALITY */
  simulateSale(
    auctionId: string,
    sellerId: string,
    buyerId: string,
    asOfDate: Date,
    conditionQuality?: number
  ): void {
    const auction = this.auctions.get(auctionId);
    const price = auction?.salePriceCents ?? 0;
    const metaBuyer = { auctionId, counterpartyId: sellerId };
    const metaSeller = { auctionId, counterpartyId: buyerId };

    this.applyEvent(sellerId, "PAYMENT_VERIFIED", asOfDate, {
      salePriceCents: price,
      meta: metaSeller,
    });
    this.applyEvent(buyerId, "PAYMENT_VERIFIED", asOfDate, {
      salePriceCents: price,
      meta: metaBuyer,
    });
    this.applyEvent(buyerId, "PURCHASE_COMPLETED", asOfDate, {
      salePriceCents: price,
      meta: metaBuyer,
    });
    this.applyEvent(sellerId, "SALE_COMPLETED", asOfDate, {
      salePriceCents: price,
      meta: metaSeller,
    });
    if (conditionQuality && conditionQuality > 0) {
      this.applyEvent(sellerId, "CONDITION_REPORT_QUALITY", asOfDate, {
        basePoints: conditionQuality,
        meta: metaSeller,
      });
    }
  }

  reset(): void {
    this.users.clear();
    this.events = [];
    this.auctions.clear();
    this.dailyCapActivations = 0;
  }
}

// --- Report types ---
type ScenarioReport = {
  scenarioId: number;
  scenarioName: string;
  tierCounts: Record<CollectorTier, number>;
  scoreStats: { min: number; median: number; p90: number; p99: number; max: number };
  avgPointsPerTransactionByPriceBand?: Record<string, number>;
  timeToTier?: Record<string, number>;
  penaltyImpact?: { before: number; after: number; delta: number };
  dailyCapActivations: number;
  gamingAttemptSuccess?: { reachedVerified: number; reachedElite: number; total: number };
  pairRepeatDampening?: string;
  valueMultiplierCapWarning?: boolean;
  takeaways: string[];
  users: { id: string; score: number; tier: CollectorTier; sales: number; purchases: number; disputesLost: number; uniqueCounterparties: number }[];
};

// --- Helpers ---
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const i = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, i)];
}

function runScenario(
  engine: SimEngine,
  name: string,
  scenarioId: number,
  run: () => Partial<ScenarioReport>
): ScenarioReport {
  engine.reset();
  const extra = run();
  const users = Array.from(engine.users.values());
  const scores = users.map((u) => u.reputationScore).sort((a, b) => a - b);
  const tierCounts: Record<CollectorTier, number> = {
    NEW: 0,
    VERIFIED: 0,
    ELITE: 0,
    APEX: 0,
  };
  for (const u of users) tierCounts[u.collectorTier]++;

  const report: ScenarioReport = {
    scenarioId,
    scenarioName: name,
    tierCounts,
    scoreStats: {
      min: scores[0] ?? 0,
      median: percentile(scores, 50),
      p90: percentile(scores, 90),
      p99: percentile(scores, 99),
      max: scores[scores.length - 1] ?? 0,
    },
    dailyCapActivations: engine.dailyCapActivations,
    takeaways: [],
    users: users.map((u) => ({
      id: u.id,
      score: u.reputationScore,
      tier: u.collectorTier,
      sales: u.completedSalesCount,
      purchases: u.completedPurchasesCount,
      disputesLost: u.disputesLostCount,
      uniqueCounterparties: u.uniqueCounterpartyCount,
    })),
  };
  if (extra) Object.assign(report, extra);
  return report;
}

// --- Scenarios ---
function scenario1(engine: SimEngine): ScenarioReport {
  const report = runScenario(engine, "New honest user, small volume", 1, () => {
    const base = new Date("2025-01-01");
    const buyer = engine.createUser("b1", { createdAt: base });
    const seller = engine.createUser("s1", { createdAt: base, emailVerified: true });
    const price = 100_000; // $1,000
    for (let i = 0; i < 5; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + Math.floor((i * 30) / 5));
      const aid = `a1-${i}`;
      engine.createAuction(aid, price, seller.id, buyer.id, {
        conditionGrade: i % 2 ? "EXCELLENT" : null,
        conditionSummary: i % 3 === 0 ? "x".repeat(200) : null,
        imperfections: i % 2 === 0 ? [{}] : [],
      });
      const a = engine.auctions.get(aid)!;
      const q = computeConditionQuality(a);
      engine.simulateSale(aid, seller.id, buyer.id, day, q);
    }
    return {};
  });
  if (report.dailyCapActivations > 0) {
    report.takeaways.push("WARNING: Daily cap triggered in Scenario 1 (new honest user).");
  }
  return report;
}

function scenario2(engine: SimEngine): ScenarioReport {
  const report = runScenario(engine, "Serious collector", 2, () => {
    const base = new Date("2025-01-01");
    const buyer = engine.createUser("b2", { createdAt: base, emailVerified: true });
    const seller = engine.createUser("s2", { createdAt: base, emailVerified: true });
    const price = 1_000_000; // $10,000
    for (let i = 0; i < 10; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + Math.floor((i * 90) / 10));
      const aid = `a2-${i}`;
      engine.createAuction(aid, price, seller.id, buyer.id);
      engine.simulateSale(aid, seller.id, buyer.id, day);
      engine.applyEvent(buyer.id, "POSITIVE_FEEDBACK", day, {
        salePriceCents: price,
        meta: { auctionId: aid, counterpartyId: seller.id },
      });
      engine.applyEvent(seller.id, "POSITIVE_FEEDBACK", day, {
        salePriceCents: price,
        meta: { auctionId: aid, counterpartyId: buyer.id },
      });
    }
    return {};
  });
  if (report.dailyCapActivations > 0) {
    report.takeaways.push("WARNING: Daily cap triggered in Scenario 2 (serious collector).");
  }
  return report;
}

function scenario3(engine: SimEngine): ScenarioReport {
  return runScenario(engine, "Power seller", 3, () => {
    const base = new Date("2025-01-01");
    const seller = engine.createUser("s3", { createdAt: base, emailVerified: true });
    const price = 2_500_000; // $25,000
    const buyers = Array.from({ length: 30 }, (_, i) =>
      engine.createUser(`b3-${i}`, { createdAt: base })
    );
    for (let i = 0; i < 30; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + Math.floor((i * 180) / 30));
      const aid = `a3-${i}`;
      const buyer = buyers[i];
      engine.createAuction(aid, price, seller.id, buyer.id);
      engine.simulateSale(aid, seller.id, buyer.id, day);
      const isNeg = i < Math.floor(30 * 0.05); // 5% negative
      engine.applyEvent(
        seller.id,
        isNeg ? "NEGATIVE_FEEDBACK" : "POSITIVE_FEEDBACK",
        day,
        { salePriceCents: price, meta: { auctionId: aid, counterpartyId: buyer.id } }
      );
    }
    return {};
  });
}

function scenario4(engine: SimEngine): ScenarioReport {
  let scoreBeforePenalties = 0;
  const report = runScenario(engine, "Dispute stress test", 4, () => {
    const base = new Date("2025-01-01");
    const user = engine.createUser("u4", { createdAt: base, emailVerified: true });
    const price = 800_000; // $8,000
    const buyers = Array.from({ length: 12 }, (_, i) =>
      engine.createUser(`b4-${i}`, { createdAt: base })
    );
    for (let i = 0; i < 12; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + i * 3);
      const aid = `a4-${i}`;
      engine.createAuction(aid, price, user.id, buyers[i].id);
      engine.simulateSale(aid, user.id, buyers[i].id, day);
    }
    scoreBeforePenalties = engine.users.get("u4")!.reputationScore;
    const penaltyDay = new Date(base);
    penaltyDay.setDate(penaltyDay.getDate() + 40);
    engine.applyEvent("u4", "DISPUTE_OPENED", penaltyDay, { meta: { auctionId: "a4-0" } });
    engine.applyEvent("u4", "DISPUTE_OPENED", penaltyDay, { meta: { auctionId: "a4-1" } });
    engine.applyEvent("u4", "DISPUTE_LOST", penaltyDay, { meta: { auctionId: "a4-0" } });
    engine.applyEvent("u4", "CHARGEBACK", penaltyDay, { meta: { auctionId: "a4-1" } });
    return {
      penaltyImpact: {
        before: scoreBeforePenalties,
        after: engine.users.get("u4")!.reputationScore,
        delta: engine.users.get("u4")!.reputationScore - scoreBeforePenalties,
      },
    };
  });
  return report;
}

function scenario5(engine: SimEngine): ScenarioReport {
  const report = runScenario(engine, "Sybil / new-account farming", 5, () => {
    const base = new Date("2025-01-01");
    const rng = createSeededRng(12345);
    const accounts = Array.from({ length: 10 }, (_, i) =>
      engine.createUser(`sybil-${i}`, {
        createdAt: base,
        emailVerified: true,
      })
    );
    let reachedVerified = 0;
    let reachedElite = 0;
    // All transactions within 14 days (accounts stay <14 days for most of the run)
    for (let t = 0; t < 14; t++) {
      const day = new Date(base);
      day.setDate(day.getDate() + t);
      for (let i = 0; i < 10; i++) {
        const acc = accounts[i];
        const partner = accounts[(i + 5) % 10];
        const price = 20000 + rng() * 30000; // $200–500
        const aid = `a5-${t}-${i}`;
        engine.createAuction(aid, price, acc.id, partner.id);
        engine.simulateSale(aid, acc.id, partner.id, day);
        engine.applyEvent(partner.id, "POSITIVE_FEEDBACK", day, {
          salePriceCents: price,
          meta: { auctionId: aid, counterpartyId: acc.id },
        });
        engine.applyEvent(acc.id, "POSITIVE_FEEDBACK", day, {
          salePriceCents: price,
          meta: { auctionId: aid, counterpartyId: partner.id },
        });
      }
    }
    for (const acc of accounts) {
      const u = engine.users.get(acc.id)!;
      if (u.collectorTier === "VERIFIED" || u.collectorTier === "ELITE" || u.collectorTier === "APEX")
        reachedVerified++;
      if (u.collectorTier === "ELITE" || u.collectorTier === "APEX") reachedElite++;
    }
    return {
      gamingAttemptSuccess: { reachedVerified, reachedElite, total: 10 },
    };
  });
  if (report.gamingAttemptSuccess?.reachedElite && report.gamingAttemptSuccess.reachedElite > 0) {
    report.takeaways.push(
      "HIGH SEVERITY: Scenario 5 allowed <14 day accounts to reach ELITE. Anti-abuse may need strengthening."
    );
  }
  return report;
}

function scenario6(engine: SimEngine): ScenarioReport {
  return runScenario(engine, "Pair-repeat wash trading", 6, () => {
    const base = new Date("2025-01-01");
    const buyer = engine.createUser("b6", { createdAt: base });
    const seller = engine.createUser("s6", { createdAt: base });
    const price = 100_000; // $1,000
    for (let i = 0; i < 20; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + Math.floor((i * 14) / 20));
      const aid = `a6-${i}`;
      engine.createAuction(aid, price, seller.id, buyer.id);
      engine.simulateSale(aid, seller.id, buyer.id, day);
    }
    const s6 = engine.users.get("s6")!;
    const b6 = engine.users.get("b6")!;
    return {
      pairRepeatDampening: `Pair dampening applied: seller score=${s6.reputationScore}, buyer score=${b6.reputationScore}. Transactions 3-5 at 50%, >5 at 10%.`,
    };
  });
}

function scenario7(engine: SimEngine): ScenarioReport {
  const warnings: string[] = [];
  return runScenario(engine, "High-dollar outlier", 7, () => {
    const base = new Date("2025-01-01");
    const seller = engine.createUser("s7", { createdAt: base, emailVerified: true });
    const buyers = [
      engine.createUser("b7-1", { createdAt: base }),
      engine.createUser("b7-2", { createdAt: base }),
    ];
    const price = 15_000_000; // $150,000
    for (let i = 0; i < 2; i++) {
      const day = new Date(base);
      day.setDate(day.getDate() + i * 7);
      const aid = `a7-${i}`;
      engine.createAuction(aid, price, seller.id, buyers[i].id);
      const before = engine.users.get("s7")!.reputationScore;
      engine.simulateSale(aid, seller.id, buyers[i].id, day);
      const after = engine.users.get("s7")!.reputationScore;
      const gain = after - before;
      if (gain > 120) {
        warnings.push(
          `WARNING: Single sale increased score by ${gain} points (>120). valueMultiplier cap may need review.`
        );
      }
    }
    return warnings.length > 0 ? { valueMultiplierCapWarning: true, takeaways: warnings } : {};
  });
}

function scenario8(engine: SimEngine): ScenarioReport {
  return runScenario(engine, "Mixed realistic marketplace", 8, () => {
    const base = new Date("2025-01-01");
    const rng = createSeededRng(99999);
    const userIds: string[] = [];
    for (let i = 0; i < 200; i++) {
      const id = `u8-${i}`;
      engine.createUser(id, {
        createdAt: base,
        emailVerified: rng() > 0.3,
      });
      userIds.push(id);
    }
    const sellers = userIds.slice(0, 120);
    const buyers = userIds.slice(0, 160);
    let txCount = 0;
    const priceBands: Record<string, { sum: number; count: number }> = {
      "1k-10k": { sum: 0, count: 0 },
      "10k-50k": { sum: 0, count: 0 },
      "50k-200k": { sum: 0, count: 0 },
    };
    for (let d = 0; d < 60; d++) {
      const day = new Date(base);
      day.setDate(day.getDate() + d);
      const nTx = Math.floor(5 + rng() * 15);
      for (let t = 0; t < nTx; t++) {
        const sellerId = sellers[Math.floor(rng() * sellers.length)];
        const buyerId = buyers[Math.floor(rng() * buyers.length)];
        if (sellerId === buyerId) continue;
        const roll = rng();
        let price: number;
        let band: string;
        if (roll < 0.5) {
          price = 100000 + rng() * 900000;
          band = "1k-10k";
        } else if (roll < 0.85) {
          price = 1000000 + rng() * 4000000;
          band = "10k-50k";
        } else {
          price = 5000000 + rng() * 15000000;
          band = "50k-200k";
        }
        const aid = `a8-${d}-${t}`;
        engine.createAuction(aid, price, sellerId, buyerId);
        const sellerBefore = engine.users.get(sellerId)!.reputationScore;
        const buyerBefore = engine.users.get(buyerId)!.reputationScore;
        engine.simulateSale(aid, sellerId, buyerId, day);
        const sellerAfter = engine.users.get(sellerId)!.reputationScore;
        const buyerAfter = engine.users.get(buyerId)!.reputationScore;
        const sellerGain = sellerAfter - sellerBefore;
        const buyerGain = buyerAfter - buyerBefore;
        priceBands[band].sum += sellerGain + buyerGain;
        priceBands[band].count += 2;
        txCount++;

        if (rng() < 0.08) {
          engine.applyEvent(sellerId, "NEGATIVE_FEEDBACK", day, {
            salePriceCents: price,
            meta: { auctionId: aid, counterpartyId: buyerId },
          });
        } else {
          engine.applyEvent(sellerId, "POSITIVE_FEEDBACK", day, {
            salePriceCents: price,
            meta: { auctionId: aid, counterpartyId: buyerId },
          });
        }
        if (rng() < 0.03) {
          engine.applyEvent(sellerId, "DISPUTE_OPENED", day, { meta: { auctionId: aid } });
        }
        if (rng() < 0.008) {
          engine.applyEvent(sellerId, "DISPUTE_LOST", day, { meta: { auctionId: aid } });
        }
        if (rng() < 0.002) {
          engine.applyEvent(sellerId, "CHARGEBACK", day, { meta: { auctionId: aid } });
        }
      }
    }
    const avgPointsPerTransactionByPriceBand: Record<string, number> = {};
    for (const [band, { sum, count }] of Object.entries(priceBands)) {
      avgPointsPerTransactionByPriceBand[band] =
        count > 0 ? Math.round((sum / count) * 100) / 100 : 0;
    }
    return { avgPointsPerTransactionByPriceBand };
  });
}

// --- Validation ---
function validateAndWarn(reports: ScenarioReport[]): void {
  for (const r of reports) {
    for (const u of r.users) {
      if (u.score < -500 || u.score > 1200) {
        console.warn(
          `WARNING: User ${u.id} in Scenario ${r.scenarioId} has score ${u.score} (outside -500..1200)`
        );
      }
    }
  }
}

// --- Console output ---
function printReport(reports: ScenarioReport[]): void {
  console.log("\n=== Carasta Reputation Calibration Simulator ===\n");
  for (const r of reports) {
    console.log(`--- Scenario ${r.scenarioId}: ${r.scenarioName} ---`);
    console.log(`Tier counts: NEW=${r.tierCounts.NEW} VERIFIED=${r.tierCounts.VERIFIED} ELITE=${r.tierCounts.ELITE} APEX=${r.tierCounts.APEX}`);
    console.log(
      `Scores: min=${r.scoreStats.min} median=${r.scoreStats.median} p90=${r.scoreStats.p90} p99=${r.scoreStats.p99} max=${r.scoreStats.max}`
    );
    if (r.avgPointsPerTransactionByPriceBand) {
      console.log("Avg points/transaction by price band:", r.avgPointsPerTransactionByPriceBand);
    }
    if (r.penaltyImpact) {
      console.log(`Penalty impact: before=${r.penaltyImpact.before} after=${r.penaltyImpact.after} delta=${r.penaltyImpact.delta}`);
    }
    if (r.dailyCapActivations > 0) {
      console.log(`Daily positive cap activations: ${r.dailyCapActivations}`);
    }
    if (r.gamingAttemptSuccess) {
      console.log(
        `Gaming attempt: ${r.gamingAttemptSuccess.reachedVerified}/10 reached VERIFIED, ${r.gamingAttemptSuccess.reachedElite}/10 reached ELITE`
      );
    }
    if (r.pairRepeatDampening) {
      console.log(r.pairRepeatDampening);
    }
    if (r.takeaways.length > 0) {
      for (const t of r.takeaways) console.log("  →", t);
    }
    console.log("");
  }
}

// --- Main ---
function main() {
  const engine = new SimEngine();
  const reports: ScenarioReport[] = [
    scenario1(engine),
    scenario2(engine),
    scenario3(engine),
    scenario4(engine),
    scenario5(engine),
    scenario6(engine),
    scenario7(engine),
    scenario8(engine),
  ];

  validateAndWarn(reports);
  printReport(reports);

  const outDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const now = new Date();
  const stamp =
    now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    "-" +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0");
  const outPath = path.join(outDir, `reputation-sim-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ reports, timestamp: now.toISOString() }, null, 2));
  console.log(`Report written to ${outPath}`);
}

main();
