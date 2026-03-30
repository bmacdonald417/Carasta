/**
 * Rebuilds `AuctionAnalytics` daily rollups from `TrafficEvent` (VIEW + SHARE_CLICK).
 * Run after deploy: `npx ts-node -P tsconfig.scripts.json scripts/backfill-auction-analytics.ts`
 *
 * Idempotent: clears rollup table then repopulates. New events after this run also
 * increment rollups via ingestion.
 */

import { recomputeAllAuctionAnalyticsFromTrafficEvents } from "../lib/marketing/backfill-auction-analytics";

async function main() {
  const { rowCount } = await recomputeAllAuctionAnalyticsFromTrafficEvents();
  console.log(`AuctionAnalytics backfill complete: ${rowCount} day rows.`);
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
