import { prisma } from "@/lib/db";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { getViewShareTotalsForAuctionIds } from "@/lib/marketing/get-view-share-totals";
import { MarketingTrafficEventType } from "@prisma/client";

const ROW_LIMIT = 100;

export type SellerMarketingAuctionRow = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  status: string;
  createdAt: Date;
  endAt: Date;
  imageUrl: string | null;
  highBidCents: number;
  bidCount: number;
  totalViews: number;
  totalShareClicks: number;
  totalBidClicks: number;
  lastMarketingActivityAt: Date | null;
};

/** Per-listing traffic summaries for the seller marketing overview (read-only). */
export async function getSellerMarketingAuctionRows(
  sellerId: string
): Promise<SellerMarketingAuctionRow[]> {
  const auctions = await prisma.auction.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: ROW_LIMIT,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      _count: { select: { bids: true } },
    },
  });

  if (auctions.length === 0) return [];

  const auctionIds = auctions.map((a) => a.id);

  const [viewShareByAuction, bidClickByAuction, lastActivity] = await Promise.all([
    getViewShareTotalsForAuctionIds(auctionIds),
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: {
        auctionId: { in: auctionIds },
        eventType: MarketingTrafficEventType.BID_CLICK,
      },
      _count: { _all: true },
    }),
    prisma.trafficEvent.groupBy({
      by: ["auctionId"],
      where: { auctionId: { in: auctionIds } },
      _max: { createdAt: true },
    }),
  ]);

  const bidMap = new Map(
    bidClickByAuction.map((r) => [r.auctionId, r._count._all])
  );

  const lastByAuction = new Map<string, Date | null>();
  for (const row of lastActivity) {
    lastByAuction.set(row.auctionId, row._max.createdAt ?? null);
  }

  return auctions.map((a) => {
    const vs = viewShareByAuction.get(a.id) ?? {
      views: 0,
      shareClicks: 0,
    };
    return {
      id: a.id,
      title: a.title,
      year: a.year,
      make: a.make,
      model: a.model,
      status: a.status,
      createdAt: a.createdAt,
      endAt: a.endAt,
      imageUrl: a.images[0]?.url ?? null,
      highBidCents: computeCurrentBidCents(a.bids),
      bidCount: a._count.bids,
      totalViews: vs.views,
      totalShareClicks: vs.shareClicks,
      totalBidClicks: bidMap.get(a.id) ?? 0,
      lastMarketingActivityAt: lastByAuction.get(a.id) ?? null,
    };
  });
}
