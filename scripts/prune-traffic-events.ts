/**
 * Manual prune for old `TrafficEvent` rows (optional).
 *
 * Requires:
 *   TRAFFIC_EVENT_PRUNE_ENABLED=true
 * Optional:
 *   TRAFFIC_EVENT_PRUNE_DRY_RUN=true  — only print counts
 *   TRAFFIC_EVENT_RETENTION_DAYS=365   — default 365
 *
 * Run: npx ts-node -P tsconfig.scripts.json scripts/prune-traffic-events.ts
 *
 * After pruning, re-run backfill if rollups must match remaining raw events only;
 * see MARKETING_PHASE_6_NOTES.md.
 */

import { pruneTrafficEventsOlderThan } from "../lib/marketing/prune-traffic-events";

async function main() {
  if (process.env.TRAFFIC_EVENT_PRUNE_ENABLED !== "true") {
    console.error(
      "Refusing to run: set TRAFFIC_EVENT_PRUNE_ENABLED=true (see script header)."
    );
    process.exit(1);
  }

  const days = Math.max(
    1,
    Number.parseInt(process.env.TRAFFIC_EVENT_RETENTION_DAYS ?? "365", 10) || 365
  );
  const dryRun = process.env.TRAFFIC_EVENT_PRUNE_DRY_RUN === "true";
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log(
    `${dryRun ? "[dry-run] " : ""}Pruning TrafficEvent with createdAt < ${cutoff.toISOString()} (${days} day retention)`
  );

  const result = await pruneTrafficEventsOlderThan(cutoff, { dryRun });
  console.log(
    dryRun ? `Would delete ${result.deleted} rows.` : `Deleted ${result.deleted} rows.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("../lib/db");
    await prisma.$disconnect();
  });
