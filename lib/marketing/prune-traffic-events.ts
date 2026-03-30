import { prisma } from "@/lib/db";

export type PruneTrafficEventsResult = {
  deleted: number;
  dryRun: boolean;
};

/**
 * Deletes `TrafficEvent` rows older than `olderThan` (by `createdAt`).
 *
 * **Manual / operational only.** Nothing runs this on app startup. Does not adjust
 * `AuctionAnalytics`; after a large prune, run `recomputeAllAuctionAnalyticsFromTrafficEvents()`
 * if rollups must stay aligned with raw history, or accept that rollups retain pre-prune totals
 * (typical: prune raw after rollups are trusted, or re-backfill once).
 *
 * **Environment (script `scripts/prune-traffic-events.ts`):**
 * - `TRAFFIC_EVENT_PRUNE_ENABLED=true` — required for destructive prune
 * - `TRAFFIC_EVENT_RETENTION_DAYS` — default **365**
 * - `TRAFFIC_EVENT_PRUNE_DRY_RUN=true` — count only (or use `--dry-run`, which does not require the enable flag)
 *
 * This helper does **not** read env — callers pass `dryRun` so tests stay simple.
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
