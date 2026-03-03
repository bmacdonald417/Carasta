/**
 * Pure reputation logic for simulation. Mirrors lib/reputation.ts without Prisma.
 * Used by scripts/reputation-sim.ts. Production uses lib/reputation.ts.
 */

import type { ReputationEventType, CollectorTier } from "@prisma/client";

export const SCORE_WEIGHTS: Record<ReputationEventType, number> = {
  PAYMENT_VERIFIED: 10,
  DELIVERY_CONFIRMED: 10,
  PURCHASE_COMPLETED: 20,
  SALE_COMPLETED: 25,
  POSITIVE_FEEDBACK: 5,
  NEGATIVE_FEEDBACK: -10,
  CONDITION_REPORT_QUALITY: 0,
  DISPUTE_OPENED: -10,
  DISPUTE_LOST: -60,
  CHARGEBACK: -120,
  SELLER_CANCELLATION_AFTER_BID: -40,
  BUYER_NONPAYMENT: -50,
  POLICY_VIOLATION: -150,
  SOCIAL_HELPFUL_UPVOTE: 0,
  SOCIAL_SPAM_FLAG: 0,
};

export const DAILY_POSITIVE_CAP = 80;
export const MAX_POSITIVE_POINTS_PER_EVENT = 90;

/** Pair-repeat dampening: 1-2 tx = full, 3-5 = 50%, >5 = 10%. */
export function computePairDampeningFactor(pairCount30d: number): 1 | 0.5 | 0.1 {
  if (pairCount30d <= 2) return 1;
  if (pairCount30d <= 5) return 0.5;
  return 0.1;
}

const PAIR_DAMPENED_EVENT_TYPES: ReputationEventType[] = [
  "PAYMENT_VERIFIED",
  "PURCHASE_COMPLETED",
  "SALE_COMPLETED",
  "POSITIVE_FEEDBACK",
  "CONDITION_REPORT_QUALITY",
];

export type UserForTrust = {
  emailVerified: Date | null;
  createdAt: Date;
};

export type UserForTier = {
  reputationScore: number;
  completedSalesCount: number;
  completedPurchasesCount: number;
  disputesLostCount: number;
  uniqueCounterpartyCount: number;
  createdAt: Date;
};

export type AuctionForCondition = {
  conditionGrade: string | null;
  conditionSummary: string | null;
  imperfections: unknown;
  damageImages?: { id: string }[];
};

/** Diminishing returns: clamp(1 - (currentScore/1000)*0.6, 0.4, 1.0). Only for positive gains. */
export function scoreGainFactor(currentScore: number): number {
  const raw = 1 - (currentScore / 1000) * 0.6;
  return Math.max(0.4, Math.min(1, raw));
}

/** Low-value farming dampener: <$500 = 0.10, <$1000 = 0.25, else 1.0. Only for positive points. */
export function lowValueFarmingDampener(salePriceCents: number): number {
  if (salePriceCents < 50_000) return 0.1;
  if (salePriceCents < 100_000) return 0.25;
  return 1;
}

/** valueMultiplier: clamp(log10(salePriceCents/20000)+1, 0.7, 1.5) */
export function valueMultiplier(salePriceCents: number): number {
  if (salePriceCents <= 0) return 1;
  const raw = Math.log10(salePriceCents / 20000) + 1;
  return Math.max(0.7, Math.min(1.5, raw));
}

/** trustMultiplier: emailVerified +0.05, age>30 +0.10, age>180 +0.15. Cap 1.5. New accounts (<14 days): cap 1.0. */
export function trustMultiplier(
  user: UserForTrust,
  isPositive: boolean,
  asOfDate: Date = new Date()
): number {
  if (!isPositive) return 1;
  let m = 1;
  if (user.emailVerified) m += 0.05;
  const accountAgeDays =
    (asOfDate.getTime() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000);
  if (accountAgeDays > 180) m += 0.15;
  else if (accountAgeDays > 30) m += 0.1;
  if (accountAgeDays < 14) return Math.min(1, m);
  return Math.min(1.5, m);
}

/** computeConditionQuality: grade +2, summary>=200 +3, imperfections>=1 +3, damageImages>=3 +4. Cap +15. */
export function computeConditionQuality(auction: AuctionForCondition): number {
  let pts = 0;
  if (auction.conditionGrade) pts += 2;
  if (
    auction.conditionSummary &&
    typeof auction.conditionSummary === "string" &&
    auction.conditionSummary.length >= 200
  )
    pts += 3;
  const imp =
    Array.isArray(auction.imperfections) && auction.imperfections.length >= 1;
  if (imp) pts += 3;
  const di = auction.damageImages?.length ?? 0;
  if (di >= 3) pts += 4;
  return Math.min(15, pts);
}

/** determineTier: HARD gates for account age + tx count + counterparties. */
export function determineTier(
  user: UserForTier,
  asOfDate: Date = new Date()
): CollectorTier {
  const total = user.completedSalesCount + user.completedPurchasesCount;
  const disputeRate = total > 0 ? user.disputesLostCount / total : 0;
  const ucp = user.uniqueCounterpartyCount ?? 0;
  const accountAgeDays =
    (asOfDate.getTime() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000);

  if (
    user.reputationScore >= 750 &&
    total >= 30 &&
    disputeRate < 0.02 &&
    ucp >= 12 &&
    accountAgeDays >= 120
  )
    return "APEX";
  if (
    user.reputationScore >= 500 &&
    total >= 12 &&
    disputeRate < 0.03 &&
    ucp >= 6 &&
    accountAgeDays >= 60
  )
    return "ELITE";
  if (
    user.reputationScore >= 200 &&
    total >= 3 &&
    ucp >= 2 &&
    accountAgeDays >= 14
  )
    return "VERIFIED";
  return "NEW";
}

export type SimEvent = {
  userId: string;
  type: ReputationEventType;
  points: number;
  basePoints: number;
  meta?: Record<string, unknown>;
  createdAt: Date;
};

export type ComputeEventInput = {
  type: ReputationEventType;
  basePoints?: number;
  meta?: Record<string, unknown>;
  salePriceCents?: number;
};

/**
 * Pure compute: given user state and existing events, compute points for a new event.
 * Returns { points, shouldApply }. shouldApply=false if deduped (auctionId+type already exists).
 * currentScore: user's reputationScore before this event (for diminishing returns).
 */
export function computePointsForEvent(
  userId: string,
  user: UserForTrust,
  input: ComputeEventInput,
  existingEvents: SimEvent[],
  asOfDate: Date,
  currentScore: number = 0
): { points: number; shouldApply: boolean } {
  const { type, meta = {} } = input;
  const auctionId = meta.auctionId as string | undefined;

  if (auctionId) {
    const already = existingEvents.some(
      (e) => e.userId === userId && e.type === type && (e.meta?.auctionId as string) === auctionId
    );
    if (already) return { points: 0, shouldApply: false };
  }

  let basePoints = input.basePoints ?? SCORE_WEIGHTS[type];
  if (type === "CONDITION_REPORT_QUALITY" && input.basePoints != null) {
    basePoints = input.basePoints;
  }

  const isPositive = basePoints > 0;
  const salePriceCents = input.salePriceCents ?? 0;
  const valMult = salePriceCents > 0 ? valueMultiplier(salePriceCents) : 1;
  const trustMult = trustMultiplier(user, isPositive, asOfDate);
  let points = Math.round(basePoints * valMult * trustMult);
  if (isPositive && points < 0) points = 0;
  if (!isPositive && points > 0) points = -Math.abs(points);

  // Low-value farming dampener for positive transaction-like events
  if (
    isPositive &&
    points > 0 &&
    salePriceCents > 0 &&
    PAIR_DAMPENED_EVENT_TYPES.includes(type)
  ) {
    const lvDampen = lowValueFarmingDampener(salePriceCents);
    points = Math.round(points * lvDampen);
  }

  // Pair-repeat dampening for positive transaction-like events
  const counterpartyId = meta.counterpartyId as string | undefined;
  if (
    isPositive &&
    points > 0 &&
    counterpartyId &&
    PAIR_DAMPENED_EVENT_TYPES.includes(type)
  ) {
    const thirtyDaysAgo = new Date(asOfDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const distinctAuctionsWithCounterparty = new Set(
      existingEvents
        .filter(
          (e) =>
            e.userId === userId &&
            (e.meta?.counterpartyId as string) === counterpartyId &&
            e.createdAt >= thirtyDaysAgo &&
            e.createdAt <= asOfDate
        )
        .map((e) => e.meta?.auctionId as string)
        .filter(Boolean)
    );
    const pairCount = distinctAuctionsWithCounterparty.size + 1;
    const dampen = computePairDampeningFactor(pairCount);
    points = Math.round(points * dampen);
  }

  // Diminishing returns for positive gains (penalties always full strength)
  if (isPositive && points > 0) {
    const gainFactor = scoreGainFactor(currentScore);
    points = Math.round(points * gainFactor);
  }

  // Per-event cap: max +90 points per single event (positive only)
  if (isPositive && points > 0) {
    points = Math.min(points, MAX_POSITIVE_POINTS_PER_EVENT);
  }

  if (isPositive && points > 0) {
    const todayStart = new Date(asOfDate);
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayPositive = existingEvents
      .filter(
        (e) =>
          e.points > 0 &&
          e.createdAt >= todayStart &&
          e.createdAt <= asOfDate
      )
      .reduce((sum, e) => sum + e.points, 0);
    if (todayPositive >= DAILY_POSITIVE_CAP) {
      points = 0;
    } else {
      const allowed = DAILY_POSITIVE_CAP - todayPositive;
      points = Math.min(points, allowed);
    }
  }

  return { points, shouldApply: true };
}
