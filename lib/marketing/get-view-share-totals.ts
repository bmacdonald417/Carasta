import { prisma } from "@/lib/db";
import { MarketingTrafficEventType } from "@prisma/client";

export type ViewShareTotals = { views: number; shareClicks: number };

/**
 * Per-auction VIEW / SHARE_CLICK totals. Prefers `AuctionAnalytics` daily sums when any
 * rollup row exists for the auction; otherwise counts `TrafficEvent` (pre-backfill / dev).
 */
export async function getViewShareTotalsForAuctionIds(
  auctionIds: string[]
): Promise<Map<string, ViewShareTotals>> {
  const out = new Map<string, ViewShareTotals>();
  if (auctionIds.length === 0) return out;

  const rollupRows = await prisma.auctionAnalytics.groupBy({
    by: ["auctionId"],
    where: { auctionId: { in: auctionIds } },
    _sum: { views: true, shareClicks: true },
  });

  const hasRollup = new Set(rollupRows.map((r) => r.auctionId));
  for (const r of rollupRows) {
    out.set(r.auctionId, {
      views: r._sum.views ?? 0,
      shareClicks: r._sum.shareClicks ?? 0,
    });
  }

  const missing = auctionIds.filter((id) => !hasRollup.has(id));
  if (missing.length === 0) return out;

  const rawCounts = await prisma.trafficEvent.groupBy({
    by: ["auctionId", "eventType"],
    where: {
      auctionId: { in: missing },
      eventType: {
        in: [
          MarketingTrafficEventType.VIEW,
          MarketingTrafficEventType.SHARE_CLICK,
        ],
      },
    },
    _count: { _all: true },
  });

  const rawMap = new Map<string, ViewShareTotals>();
  for (const id of missing) {
    rawMap.set(id, { views: 0, shareClicks: 0 });
  }
  for (const row of rawCounts) {
    const cur = rawMap.get(row.auctionId)!;
    if (row.eventType === MarketingTrafficEventType.VIEW) {
      cur.views += row._count._all;
    } else if (row.eventType === MarketingTrafficEventType.SHARE_CLICK) {
      cur.shareClicks += row._count._all;
    }
  }

  for (const id of missing) {
    out.set(id, rawMap.get(id) ?? { views: 0, shareClicks: 0 });
  }

  return out;
}

/** Aggregated totals across many listings (e.g. seller overview KPIs). */
export async function sumViewShareTotalsForSellerAuctions(
  sellerId: string
): Promise<ViewShareTotals> {
  const auctions = await prisma.auction.findMany({
    where: { sellerId },
    select: { id: true },
  });
  const ids = auctions.map((a) => a.id);
  const map = await getViewShareTotalsForAuctionIds(ids);
  let views = 0;
  let shareClicks = 0;
  for (const id of ids) {
    const t = map.get(id) ?? { views: 0, shareClicks: 0 };
    views += t.views;
    shareClicks += t.shareClicks;
  }
  return { views, shareClicks };
}
