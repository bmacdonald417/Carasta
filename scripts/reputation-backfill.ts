/**
 * Reputation Backfill Script
 * Recomputes user scores from ReputationEvents (idempotent).
 * Run: npm run rep:backfill [userId1] [userId2] ...
 * Or: npm run rep:backfill  (all users, chunked)
 */

import { prisma } from "../lib/db";
import { determineTier } from "../lib/reputation";

const BATCH_SIZE = 200;

type RecomputeResult = {
  reputationScore: number;
  completedSalesCount: number;
  completedPurchasesCount: number;
  disputesLostCount: number;
  uniqueCounterpartyCount: number;
  collectorTier: string;
};

async function recomputeUser(userId: string): Promise<RecomputeResult | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  if (!user) return null;

  const events = await prisma.reputationEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { type: true, points: true, meta: true },
  });

  let reputationScore = 0;
  let completedSalesCount = 0;
  let completedPurchasesCount = 0;
  let disputesLostCount = 0;
  const counterpartyIds = new Set<string>();

  for (const e of events) {
    reputationScore += e.points;
    if (e.type === "SALE_COMPLETED") completedSalesCount += 1;
    if (e.type === "PURCHASE_COMPLETED") completedPurchasesCount += 1;
    if (e.type === "DISPUTE_LOST") disputesLostCount += 1;
    if (
      (e.type === "SALE_COMPLETED" || e.type === "PURCHASE_COMPLETED") &&
      e.meta &&
      typeof e.meta === "object" &&
      "counterpartyId" in e.meta &&
      typeof (e.meta as { counterpartyId?: unknown }).counterpartyId === "string"
    ) {
      counterpartyIds.add((e.meta as { counterpartyId: string }).counterpartyId);
    }
  }

  const userForTier = {
    reputationScore,
    completedSalesCount,
    completedPurchasesCount,
    disputesLostCount,
    uniqueCounterpartyCount: counterpartyIds.size,
    createdAt: user.createdAt,
  };

  const collectorTier = determineTier(userForTier);

  return {
    reputationScore,
    completedSalesCount,
    completedPurchasesCount,
    disputesLostCount,
    uniqueCounterpartyCount: counterpartyIds.size,
    collectorTier,
  };
}

async function main() {
  const args = process.argv.slice(2);
  let userIds: string[];

  if (args.length > 0) {
    userIds = args.filter((a) => a && !a.startsWith("-"));
    console.log(`[rep:backfill] Processing ${userIds.length} user(s) from args`);
  } else {
    const users = await prisma.user.findMany({
      select: { id: true },
    });
    userIds = users.map((u) => u.id);
    console.log(`[rep:backfill] Processing all ${userIds.length} user(s)`);
  }

  let processed = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    for (const userId of batch) {
      try {
        const result = await recomputeUser(userId);
        if (!result) {
          console.warn(`[rep:backfill] User not found: ${userId}`);
          errors += 1;
          continue;
        }

        await prisma.user.update({
          where: { id: userId },
          data: {
            reputationScore: result.reputationScore,
            collectorTier: result.collectorTier as "NEW" | "VERIFIED" | "ELITE" | "APEX",
            completedSalesCount: result.completedSalesCount,
            completedPurchasesCount: result.completedPurchasesCount,
            disputesLostCount: result.disputesLostCount,
            uniqueCounterpartyCount: result.uniqueCounterpartyCount,
            reputationUpdatedAt: new Date(),
          },
        });

        updated += 1;
      } catch (err) {
        console.error(`[rep:backfill] Error for ${userId}:`, err);
        errors += 1;
      }
      processed += 1;
    }
    console.log(
      `[rep:backfill] Progress: ${processed}/${userIds.length} processed, ${updated} updated, ${errors} errors`
    );
  }

  console.log(
    `[rep:backfill] Done. Processed=${processed} updated=${updated} errors=${errors}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
