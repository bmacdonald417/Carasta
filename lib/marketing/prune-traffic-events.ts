import { prisma } from "@/lib/db";

export type PruneTrafficEventsResult = {
  deleted: number;
  dryRun: boolean;
};

/**
 * Deletes `TrafficEvent` rows older than `olderThan` (by `createdAt`).
 *
 * **Manual / operational only.** Does not adjust `AuctionAnalytics`; after a large prune,
 * run `recomputeAllAuctionAnalyticsFromTrafficEvents()` if rollups must stay aligned
 * with raw history, or accept that rollups retain pre-prune totals (recommended model:
 * prune raw after rollups are trusted, or re-backfill once).
 *
 * Set `TRAFFIC_EVENT_PRUNE_ENABLED=true` (and optional `TRAFFIC_EVENT_PRUNE_DRY_RUN=false`)
 * in the environment before calling from a script — this guard is not checked here so
 * unit tests can call with `dryRun: true` freely.
 */
export async function pruneTrafficEventsOlderThan(
  olderThan: Date,
  options?: { dryRun?: boolean }
): Promise<PruneTrafficEventsResult> {
  const dryRun = options?.dryRun ?? false;

  if (dryRun) {
    const count = await prisma.trafficEvent.count({
      where: { createdAt: { lt: olderThan } },
    });
    return { deleted: count, dryRun: true };
  }

  const result = await prisma.trafficEvent.deleteMany({
    where: { createdAt: { lt: olderThan } },
  });

  return { deleted: result.count, dryRun: false };
}
