/**
 * Manual prune for old `TrafficEvent` rows (optional, operational).
 *
 * ## Destructive run (deletes rows)
 * Requires: `TRAFFIC_EVENT_PRUNE_ENABLED=true`
 * Optional env:
 *   `TRAFFIC_EVENT_RETENTION_DAYS` — default **365**
 *   `TRAFFIC_EVENT_PRUNE_DRY_RUN=true` — same as `--dry-run` (count only)
 *
 *   npx ts-node -P tsconfig.scripts.json scripts/prune-traffic-events.ts
 *
 * ## Dry-run (count only, no env gate)
 *   npm run marketing:prune-traffic-events:dry-run
 *   — or —
 *   npx ts-node -P tsconfig.scripts.json scripts/prune-traffic-events.ts --dry-run
 *
 * After pruning, re-run analytics backfill if rollups must match remaining raw
 * events only; see `MARKETING_PHASE_6_NOTES.md` and `MARKETING_PHASE_10_NOTES.md`.
 */

import { pruneTrafficEventsOlderThan } from "../lib/marketing/prune-traffic-events";

function parseDays(argv: string[]): number {
  const i = argv.indexOf("--days");
  if (i >= 0 && argv[i + 1]) {
    const n = Math.max(1, Number.parseInt(argv[i + 1], 10) || 365);
    return n;
  }
  return Math.max(
    1,
    Number.parseInt(process.env.TRAFFIC_EVENT_RETENTION_DAYS ?? "365", 10) || 365
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const isDryRun =
    argv.includes("--dry-run") ||
    process.env.TRAFFIC_EVENT_PRUNE_DRY_RUN === "true";

  if (!isDryRun && process.env.TRAFFIC_EVENT_PRUNE_ENABLED !== "true") {
    console.error(
      "Refusing to delete: set TRAFFIC_EVENT_PRUNE_ENABLED=true, or pass --dry-run to count rows only."
    );
    process.exit(1);
  }

  const days = parseDays(argv);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  console.log(
    `${isDryRun ? "[dry-run] " : ""}TrafficEvent with createdAt < ${cutoff.toISOString()} (${days} day retention)`
  );

  const result = await pruneTrafficEventsOlderThan(cutoff, { dryRun: isDryRun });
  console.log(
    isDryRun
      ? `Would delete ${result.deleted} row(s).`
      : `Deleted ${result.deleted} row(s).`
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
