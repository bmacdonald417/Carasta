/**
 * Carasta Reputation Engine
 *
 * SCORING LOGIC:
 * - Base weights per event type (see SCORE_WEIGHTS)
 * - valueMultiplier: sale price affects points (log scale, 0.7–1.5)
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
  scoreGainFactor,
  valueMultiplier,
  trustMultiplier,
  computeConditionQuality,
  SCORE_WEIGHTS,
  MAX_POSITIVE_POINTS_PER_EVENT,
  DAILY_POSITIVE_CAP,
} from "./reputation-core";

export type { ReputationEventType, CollectorTier } from "@prisma/client";
export { valueMultiplier, trustMultiplier, computeConditionQuality };

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

  let basePoints = input.basePoints ?? SCORE_WEIGHTS[type as keyof typeof SCORE_WEIGHTS];
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

  // Diminishing returns for positive gains (penalties always full strength)
  if (isPositive && points > 0) {
    const gainFactor = scoreGainFactor(user.reputationScore);
    points = Math.round(points * gainFactor);
  }

  // Per-event cap: max +90 points per single event (positive only)
  if (isPositive && points > 0) {
    points = Math.min(points, MAX_POSITIVE_POINTS_PER_EVENT);
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
