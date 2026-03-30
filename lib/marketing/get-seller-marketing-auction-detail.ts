import { prisma } from "@/lib/db";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { getViewShareTotalsForAuctionIds } from "@/lib/marketing/get-view-share-totals";
import {
  MarketingTrafficEventType,
  MarketingTrafficSource,
} from "@prisma/client";
import type {
  MarketingTrafficEventType as MEventType,
  MarketingTrafficSource as MSource,
} from "@prisma/client";

const SHARE_TARGET_SAMPLE_CAP = 3000;

export type SellerMarketingAuctionDetail = {
  auction: {
    id: string;
    title: string;
    status: string;
    endAt: Date;
    createdAt: Date;
    year: number;
    make: string;
    model: string;
    trim: string | null;
    mileage: number | null;
    highBidCents: number;
  };
  totalViews: number;
  totalShareClicks: number;
  viewsLast24h: number;
  viewsLast7d: number;
  lastMarketingActivityAt: Date | null;
  bySource: { source: MSource; count: number }[];
  byEventType: { eventType: MEventType; count: number }[];
  shareTargetCounts: { target: string; count: number }[];
  recentEvents: {
    id: string;
    createdAt: Date;
    eventType: MEventType;
    source: MSource;
    shareTarget: string | null;
  }[];
};

export async function getSellerMarketingAuctionDetail(
  auctionId: string,
  sellerId: string
): Promise<SellerMarketingAuctionDetail | null> {
  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: {
      id: true,
      title: true,
      status: true,
      endAt: true,
      createdAt: true,
      year: true,
      make: true,
      model: true,
      trim: true,
      mileage: true,
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
    },
  });
  if (!auction) return null;

  const highBidCents = computeCurrentBidCents(auction.bids);
  const auctionRow = {
    id: auction.id,
    title: auction.title,
    status: auction.status,
    endAt: auction.endAt,
    createdAt: auction.createdAt,
    year: auction.year,
    make: auction.make,
    model: auction.model,
    trim: auction.trim,
    mileage: auction.mileage,
    highBidCents,
  };

  const now = new Date();
  const cutoff24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const cutoff7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    viewShareTotals,
    viewsLast24h,
    viewsLast7d,
    bySourceRaw,
    byEventTypeRaw,
    recentRows,
    shareRows,
    lastRow,
  ] = await Promise.all([
    getViewShareTotalsForAuctionIds([auctionId]),
    prisma.trafficEvent.count({
      where: {
        auctionId,
        eventType: MarketingTrafficEventType.VIEW,
        createdAt: { gte: cutoff24 },
      },
    }),
    prisma.trafficEvent.count({
      where: {
        auctionId,
        eventType: MarketingTrafficEventType.VIEW,
        createdAt: { gte: cutoff7 },
      },
    }),
    prisma.trafficEvent.groupBy({
      by: ["source"],
      where: { auctionId },
      _count: { _all: true },
    }),
    prisma.trafficEvent.groupBy({
      by: ["eventType"],
      where: { auctionId },
      _count: { _all: true },
    }),
    prisma.trafficEvent.findMany({
      where: { auctionId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        createdAt: true,
        eventType: true,
        source: true,
        metadata: true,
      },
    }),
    prisma.trafficEvent.findMany({
      where: {
        auctionId,
        eventType: MarketingTrafficEventType.SHARE_CLICK,
      },
      select: { metadata: true },
      take: SHARE_TARGET_SAMPLE_CAP,
    }),
    prisma.trafficEvent.findFirst({
      where: { auctionId },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const shareTargetMap = new Map<string, number>();
  for (const r of shareRows) {
    const m = r.metadata as Record<string, unknown> | null;
    const t =
      typeof m?.shareTarget === "string" && m.shareTarget
        ? m.shareTarget
        : "unknown";
    shareTargetMap.set(t, (shareTargetMap.get(t) ?? 0) + 1);
  }
  const shareTargetCounts = Array.from(shareTargetMap.entries())
    .map(([target, count]) => ({ target, count }))
    .sort((a, b) => b.count - a.count);

  const allSources = Object.values(MarketingTrafficSource);
  const sourceMap = new Map<MSource, number>(
    bySourceRaw.map((r) => [r.source, r._count._all])
  );
  const bySource = allSources.map((source) => ({
    source,
    count: sourceMap.get(source) ?? 0,
  }));

  const recentEvents = recentRows.map((r) => {
    const m = r.metadata as Record<string, unknown> | null;
    const shareTarget =
      typeof m?.shareTarget === "string" ? m.shareTarget : null;
    return {
      id: r.id,
      createdAt: r.createdAt,
      eventType: r.eventType,
      source: r.source,
      shareTarget,
    };
  });

  const allEventTypes = Object.values(MarketingTrafficEventType);
  const eventTypeMap = new Map<MEventType, number>(
    byEventTypeRaw.map((r) => [r.eventType, r._count._all])
  );
  const byEventType = allEventTypes.map((eventType) => ({
    eventType,
    count: eventTypeMap.get(eventType) ?? 0,
  }));

  const totals = viewShareTotals.get(auctionId) ?? {
    views: 0,
    shareClicks: 0,
  };

  return {
    auction: auctionRow,
    totalViews: totals.views,
    totalShareClicks: totals.shareClicks,
    viewsLast24h,
    viewsLast7d,
    lastMarketingActivityAt: lastRow?.createdAt ?? null,
    bySource,
    byEventType,
    shareTargetCounts,
    recentEvents,
  };
}
