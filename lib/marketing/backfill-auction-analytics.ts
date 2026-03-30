import { prisma } from "@/lib/db";

type AggregatedRow = {
  auctionId: string;
  day: Date;
  views: bigint;
  shareClicks: bigint;
  lastEventAt: Date;
};

/**
 * Rebuilds all `AuctionAnalytics` rows from `TrafficEvent` (VIEW + SHARE_CLICK only).
 * Idempotent: replaces rollup table contents. Safe to re-run after deploy or drift.
 */
export async function recomputeAllAuctionAnalyticsFromTrafficEvents(): Promise<{
  rowCount: number;
}> {
  const rows = await prisma.$queryRaw<AggregatedRow[]>`
    SELECT
      te."auctionId" AS "auctionId",
      (te."createdAt" AT TIME ZONE 'UTC')::date AS day,
      CAST(
        COUNT(*) FILTER (WHERE te."eventType" = 'VIEW')
        AS BIGINT
      ) AS views,
      CAST(
        COUNT(*) FILTER (WHERE te."eventType" = 'SHARE_CLICK')
        AS BIGINT
      ) AS "shareClicks",
      MAX(te."createdAt") AS "lastEventAt"
    FROM "TrafficEvent" te
    WHERE te."eventType" IN ('VIEW', 'SHARE_CLICK')
    GROUP BY te."auctionId", (te."createdAt" AT TIME ZONE 'UTC')::date
    ORDER BY te."auctionId", day
  `;

  await prisma.$transaction(async (tx) => {
    await tx.auctionAnalytics.deleteMany({});
    if (rows.length === 0) return;

    const chunk = 400;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      const now = new Date();
      await tx.auctionAnalytics.createMany({
        data: slice.map((r) => ({
          auctionId: r.auctionId,
          day: r.day,
          views: Number(r.views),
          shareClicks: Number(r.shareClicks),
          lastEventAt: r.lastEventAt,
          createdAt: now,
          updatedAt: now,
        })),
      });
    }
  });

  return { rowCount: rows.length };
}
