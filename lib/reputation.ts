/**
 * Carasta Reputation Engine
 *
 * SCORING LOGIC:
 * - Base weights per event type (see SCORE_WEIGHTS)
 * - valueMultiplier: sale price affects points (log scale, 0.75–1.75)
 * - trustMultiplier: email verified, account age (only for positive points, cap 1.5)
 * - New accounts (<14 days): positive multiplier capped at 1.0
 *
 * ANTI-ABUSE:
 * - Daily positive points cap: +80/day per user (penalties always apply)
 * - Pair-repeat dampening: 1-2 tx/counterparty full, 3-5 = 50%, >5 = 10%
 * - Unique counterparty requirement for tiering (VERIFIED 2+, ELITE 6+, APEX 12+)
 * - CONDITION_REPORT_QUALITY: one-time per auction (meta.auctionId dedup)
 */

import { prisma } from "./db";
import type { Prisma, ReputationEventType } from "@prisma/client";
import {
  computePairDampeningFactor,
  determineTier as determineTierCore,
  lowValueFarmingDampener,
} from "./reputation-core";

export type { ReputationEventType, CollectorTier } from "@prisma/client";

const SCORE_WEIGHTS: Record<ReputationEventType, number> = {
  PAYMENT_VERIFIED: 10,
  DELIVERY_CONFIRMED: 10, // TODO: wire when buyer confirms delivery flow exists
  PURCHASE_COMPLETED: 20,
  SALE_COMPLETED: 25,
  POSITIVE_FEEDBACK: 5,
  NEGATIVE_FEEDBACK: -10,
  CONDITION_REPORT_QUALITY: 0, // variable 0..15
  DISPUTE_OPENED: -10,
  DISPUTE_LOST: -60,
  CHARGEBACK: -120,
  SELLER_CANCELLATION_AFTER_BID: -40,
  BUYER_NONPAYMENT: -50,
  POLICY_VIOLATION: -150,
  SOCIAL_HELPFUL_UPVOTE: 0, // stub
  SOCIAL_SPAM_FLAG: 0, // stub
};

const DAILY_POSITIVE_CAP = 80;

/** valueMultiplier: clamp(log10(salePriceCents/10000)+1, 0.75, 1.75) */
export function valueMultiplier(salePriceCents: number): number {
  if (salePriceCents <= 0) return 1;
  const raw = Math.log10(salePriceCents / 10000) + 1;
  return Math.max(0.75, Math.min(1.75, raw));
}

type UserForTrust = {
  emailVerified: Date | null;
  createdAt: Date;
};

/** trustMultiplier: emailVerified +0.05, age>30 +0.10, age>180 +0.15. Cap 1.5. Only for positive points. */
export function trustMultiplier(user: UserForTrust, isPositive: boolean): number {
  if (!isPositive) return 1;
  let m = 1;
  if (user.emailVerified) m += 0.05;
  const accountAgeDays =
    (Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000);
  if (accountAgeDays > 180) m += 0.15;
  else if (accountAgeDays > 30) m += 0.1;
  if (accountAgeDays < 14) return Math.min(1, m);
  return Math.min(1.5, m);
}

type AuctionForCondition = {
  conditionGrade: string | null;
  conditionSummary: string | null;
  imperfections: unknown;
  damageImages?: { id: string }[];
};

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

/** determineTier: delegates to reputation-core (age gates, tx count, counterparties) */
export function determineTier(user: {
  reputationScore: number;
  completedSalesCount: number;
  completedPurchasesCount: number;
  disputesLostCount: number;
  uniqueCounterpartyCount?: number;
  createdAt: Date;
}) {
  return determineTierCore(
    {
      ...user,
      uniqueCounterpartyCount: user.uniqueCounterpartyCount ?? 0,
    },
    new Date()
  );
}

export type ApplyReputationEventInput = {
  userId: string;
  type: ReputationEventType;
  basePoints?: number;
  meta?: Record<string, unknown>;
  salePriceCents?: number;
};

/** Apply reputation event: create event, update user score, denormalized counts, tier. Uses transaction. */
export async function applyReputationEvent(
  input: ApplyReputationEventInput
): Promise<{ ok: boolean; error?: string }> {
  const { userId, type, meta = {} } = input;

  // Dedupe: prevent double-awards when meta.auctionId + type already exists
  const auctionId = meta.auctionId as string | undefined;
  if (auctionId) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "ReputationEvent"
      WHERE "userId" = ${userId} AND type = ${type}
      AND meta->>'auctionId' = ${auctionId}
      LIMIT 1
    `;
    if (rows.length > 0) return { ok: true };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      emailVerified: true,
      createdAt: true,
      reputationScore: true,
      completedSalesCount: true,
      completedPurchasesCount: true,
      disputesLostCount: true,
      uniqueCounterpartyCount: true,
    },
  });
  if (!user) return { ok: false, error: "User not found" };

  let basePoints = input.basePoints ?? SCORE_WEIGHTS[type];
  if (type === "CONDITION_REPORT_QUALITY" && input.basePoints != null) {
    basePoints = input.basePoints;
  }

  const isPositive = basePoints > 0;
  const salePriceCents = input.salePriceCents ?? 0;
  const valMult = salePriceCents > 0 ? valueMultiplier(salePriceCents) : 1;
  const trustMult = trustMultiplier(user, isPositive);
  let points = Math.round(basePoints * valMult * trustMult);
  if (isPositive && points < 0) points = 0;
  if (!isPositive && points > 0) points = -Math.abs(points);

  const pairDampenedTypes = [
    "PAYMENT_VERIFIED",
    "PURCHASE_COMPLETED",
    "SALE_COMPLETED",
    "POSITIVE_FEEDBACK",
    "CONDITION_REPORT_QUALITY",
  ] as ReputationEventType[];

  // Low-value farming dampener for positive transaction-like events
  if (
    isPositive &&
    points > 0 &&
    salePriceCents > 0 &&
    pairDampenedTypes.includes(type)
  ) {
    const lvDampen = lowValueFarmingDampener(salePriceCents);
    points = Math.round(points * lvDampen);
  }

  // Pair-repeat dampening for positive transaction-like events (not penalties)
  const counterpartyId = meta.counterpartyId as string | undefined;
  if (
    isPositive &&
    points > 0 &&
    counterpartyId &&
    auctionId &&
    pairDampenedTypes.includes(type)
  ) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pairCountRows = await prisma.$queryRaw<{ cnt: bigint }[]>`
      SELECT COUNT(DISTINCT meta->>'auctionId')::bigint as cnt
      FROM "ReputationEvent"
      WHERE "userId" = ${userId}
        AND meta->>'counterpartyId' = ${counterpartyId}
        AND meta->>'auctionId' IS NOT NULL
        AND "createdAt" >= ${thirtyDaysAgo}
        AND type IN ('PAYMENT_VERIFIED', 'PURCHASE_COMPLETED', 'SALE_COMPLETED', 'POSITIVE_FEEDBACK', 'CONDITION_REPORT_QUALITY')
    `;
    const pairCount = Number(pairCountRows[0]?.cnt ?? 0) + 1;
    const dampen = computePairDampeningFactor(pairCount);
    points = Math.round(points * dampen);
  }

  // Daily positive cap (penalties always apply)
  if (isPositive && points > 0) {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todaySum = await prisma.reputationEvent.aggregate({
      where: {
        userId,
        createdAt: { gte: todayStart },
        points: { gt: 0 },
      },
      _sum: { points: true },
    });
    const todayPositive = todaySum._sum.points ?? 0;
    if (todayPositive >= DAILY_POSITIVE_CAP) {
      points = 0;
    } else {
      const allowed = DAILY_POSITIVE_CAP - todayPositive;
      points = Math.min(points, allowed);
    }
  }

  let isNewCounterparty = false;
  if (
    (type === "SALE_COMPLETED" || type === "PURCHASE_COMPLETED") &&
    counterpartyId
  ) {
    const priorRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM "ReputationEvent"
      WHERE "userId" = ${userId}
        AND type IN ('SALE_COMPLETED', 'PURCHASE_COMPLETED')
        AND meta->>'counterpartyId' = ${counterpartyId}
      LIMIT 1
    `;
    isNewCounterparty = priorRows.length === 0;
  }

  await prisma.$transaction(async (tx) => {
    await tx.reputationEvent.create({
      data: {
        userId,
        type,
        points,
        basePoints,
        meta: Object.keys(meta).length ? (meta as Prisma.InputJsonValue) : undefined,
      },
    });

    const updates: {
      reputationScore?: { increment: number };
      completedSalesCount?: { increment: number };
      completedPurchasesCount?: { increment: number };
      disputesLostCount?: { increment: number };
      uniqueCounterpartyCount?: { increment: number };
    } = {};

    if (points !== 0) {
      updates.reputationScore = { increment: points };
    }
    if (type === "SALE_COMPLETED") {
      updates.completedSalesCount = { increment: 1 };
    }
    if (type === "PURCHASE_COMPLETED") {
      updates.completedPurchasesCount = { increment: 1 };
    }
    if (type === "DISPUTE_LOST") {
      updates.disputesLostCount = { increment: 1 };
    }
    if (isNewCounterparty) {
      updates.uniqueCounterpartyCount = { increment: 1 };
    }

    if (Object.keys(updates).length > 0) {
      const updated = await tx.user.update({
        where: { id: userId },
        data: {
          ...updates,
          reputationUpdatedAt: new Date(),
        },
        select: {
          reputationScore: true,
          completedSalesCount: true,
          completedPurchasesCount: true,
          disputesLostCount: true,
          uniqueCounterpartyCount: true,
          createdAt: true,
        },
      });
      const newTier = determineTier(updated);
      await tx.user.update({
        where: { id: userId },
        data: { collectorTier: newTier },
      });
    }
  });

  return { ok: true };
}
