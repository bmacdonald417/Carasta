import {
  MarketingCampaignStatus,
  MarketingTrafficEventType,
} from "@prisma/client";
import { prisma } from "@/lib/db";
import { getViewShareTotalsForAuctionIds } from "@/lib/marketing/get-view-share-totals";
import { MARKETING_NOTIFICATION_PREFIX } from "@/lib/marketing/marketing-notification-types";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";

const TOP_AUCTIONS = 15;
const TOP_SELLERS = 15;
const RECENT_CAMPAIGNS = 12;

export type AdminMarketingTopAuctionRow = {
  auctionId: string;
  title: string;
  status: string;
  sellerHandle: string;
  sellerId: string;
  totalEvents: number;
  views: number;
  shareClicks: number;
  bidClicks: number;
};

export type AdminMarketingTopSellerRow = {
  sellerId: string;
  handle: string;
  eventCount: number;
};

export type AdminMarketingRecentCampaignRow = {
  id: string;
  name: string;
  status: string;
  type: string;
  updatedAt: Date;
  auctionId: string;
  auctionTitle: string;
  sellerHandle: string;
  sellerId: string;
};

export type AdminMarketingPlatformSummary = {
  marketingFeatureEnabled: boolean;
  totals: {
    trafficEventRows: number;
    viewEvents: number;
    shareClickEvents: number;
    bidClickEvents: number;
    rollupViewsSum: number;
    rollupShareClicksSum: number;
    auctionAnalyticsDayRows: number;
    campaignsTotal: number;
    campaignsActive: number;
    marketingNotificationsTotal: number;
  };
  topAuctions: AdminMarketingTopAuctionRow[];
  topSellers: AdminMarketingTopSellerRow[];
  recentCampaigns: AdminMarketingRecentCampaignRow[];
};

/**
 * Read-only aggregates for **ADMIN** marketing dashboard.
 * Heavy on `TrafficEvent` / rollups — acceptable for low-frequency admin loads.
 */
export async function getAdminMarketingPlatformSummary(): Promise<AdminMarketingPlatformSummary> {
  const marketingFeatureEnabled = isMarketingEnabled();

  const [
    trafficEventRows,
    byEventType,
    rollupAgg,
    analyticsRowCount,
    campaignsTotal,
    campaignsActive,
    marketingNotificationsTotal,
    topAuctionRaw,
    sellerAggRows,
    recentCampaignRows,
  ] = await Promise.all([
    prisma.trafficEvent.count(),
    prisma.trafficEvent.groupBy({
      by: ["eventType"],
      _count: { _all: true },
    }),
    prisma.auctionAnalytics.aggregate({
      _sum: { views: true, shareClicks: true },
    }),
    prisma.auctionAnalytics.count(),
    prisma.campaign.count(),
    prisma.campaign.count({
      where: { status: MarketingCampaignStatus.ACTIVE },
    }),
    prisma.notification.count({
      where: { type: { startsWith: MARKETING_NOTIFICATION_PREFIX } },
    }),
    prisma.$queryRaw<Array<{ auctionId: string; cnt: bigint }>>`
      SELECT te."auctionId" AS "auctionId", COUNT(te.id)::bigint AS cnt
      FROM "TrafficEvent" te
      GROUP BY te."auctionId"
      ORDER BY cnt DESC
      LIMIT ${TOP_AUCTIONS}
    `,
    prisma.$queryRaw<Array<{ sellerId: string; cnt: bigint }>>`
      SELECT a."sellerId" AS "sellerId", COUNT(te.id)::bigint AS cnt
      FROM "TrafficEvent" te
      INNER JOIN "Auction" a ON a.id = te."auctionId"
      GROUP BY a."sellerId"
      ORDER BY cnt DESC
      LIMIT ${TOP_SELLERS}
    `,
    prisma.campaign.findMany({
      take: RECENT_CAMPAIGNS,
      orderBy: { updatedAt: "desc" },
      include: {
        auction: { select: { id: true, title: true } },
        user: { select: { id: true, handle: true } },
      },
    }),
  ]);

  const countFor = (t: MarketingTrafficEventType) =>
    byEventType.find((r) => r.eventType === t)?._count._all ?? 0;

  const auctionIds = topAuctionRaw.map((g) => g.auctionId);
  const [auctions, viewShareMap, bidGroups] = await Promise.all([
    auctionIds.length
      ? prisma.auction.findMany({
          where: { id: { in: auctionIds } },
          select: {
            id: true,
            title: true,
            status: true,
            sellerId: true,
            seller: { select: { handle: true } },
          },
        })
      : Promise.resolve([]),
    getViewShareTotalsForAuctionIds(auctionIds),
    auctionIds.length
      ? prisma.trafficEvent.groupBy({
          by: ["auctionId"],
          where: {
            auctionId: { in: auctionIds },
            eventType: MarketingTrafficEventType.BID_CLICK,
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const bidByAuction = new Map(
    bidGroups.map((b) => [b.auctionId, b._count._all])
  );
  const auctionById = new Map(auctions.map((a) => [a.id, a]));

  const topAuctions: AdminMarketingTopAuctionRow[] = topAuctionRaw
    .map((g) => {
      const a = auctionById.get(g.auctionId);
      if (!a) return null;
      const vs = viewShareMap.get(g.auctionId) ?? {
        views: 0,
        shareClicks: 0,
      };
      return {
        auctionId: g.auctionId,
        title: a.title,
        status: a.status,
        sellerHandle: a.seller.handle,
        sellerId: a.sellerId,
        totalEvents: Number(g.cnt),
        views: vs.views,
        shareClicks: vs.shareClicks,
        bidClicks: bidByAuction.get(g.auctionId) ?? 0,
      };
    })
    .filter((x): x is AdminMarketingTopAuctionRow => x != null);

  const sellerIds = sellerAggRows.map((r) => r.sellerId);
  const users = sellerIds.length
    ? await prisma.user.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, handle: true },
      })
    : [];
  const userById = new Map(users.map((u) => [u.id, u]));

  const topSellers: AdminMarketingTopSellerRow[] = sellerAggRows
    .map((r) => {
      const u = userById.get(r.sellerId);
      return {
        sellerId: r.sellerId,
        handle: u?.handle ?? r.sellerId.slice(0, 8) + "…",
        eventCount: Number(r.cnt),
      };
    })
    .filter((r) => r.eventCount > 0);

  const recentCampaigns: AdminMarketingRecentCampaignRow[] =
    recentCampaignRows.map((c) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      type: c.type,
      updatedAt: c.updatedAt,
      auctionId: c.auctionId,
      auctionTitle: c.auction.title,
      sellerHandle: c.user.handle,
      sellerId: c.user.id,
    }));

  return {
    marketingFeatureEnabled,
    totals: {
      trafficEventRows,
      viewEvents: countFor(MarketingTrafficEventType.VIEW),
      shareClickEvents: countFor(MarketingTrafficEventType.SHARE_CLICK),
      bidClickEvents: countFor(MarketingTrafficEventType.BID_CLICK),
      rollupViewsSum: rollupAgg._sum.views ?? 0,
      rollupShareClicksSum: rollupAgg._sum.shareClicks ?? 0,
      auctionAnalyticsDayRows: analyticsRowCount,
      campaignsTotal,
      campaignsActive,
      marketingNotificationsTotal,
    },
    topAuctions,
    topSellers,
    recentCampaigns,
  };
}
