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
const TOP_AUCTIONS_LAST7 = 10;
const TOP_SELLERS_LAST7 = 10;
const RECENT_CAMPAIGNS = 12;

const MS_DAY = 24 * 60 * 60 * 1000;

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
  externalReferrals: number;
};

/** Top listings in a time window — TrafficEvent counts only (not rollups). */
export type AdminMarketingTopAuctionWindowRow = {
  auctionId: string;
  title: string;
  status: string;
  sellerHandle: string;
  sellerId: string;
  totalEvents: number;
  viewEvents: number;
  shareClickEvents: number;
  bidClickEvents: number;
  externalReferralEvents: number;
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

export type AdminMarketingRecentWindow = {
  trafficEventRows: number;
  viewEvents: number;
  shareClickEvents: number;
  bidClickEvents: number;
  externalReferralEvents: number;
  campaignsUpdated: number;
  campaignsCreated: number;
  marketingNotificationsCreated: number;
};

export type AdminMarketingPlatformSummary = {
  marketingFeatureEnabled: boolean;
  totals: {
    trafficEventRows: number;
    viewEvents: number;
    shareClickEvents: number;
    bidClickEvents: number;
    externalReferralEvents: number;
    rollupViewsSum: number;
    rollupShareClicksSum: number;
    auctionAnalyticsDayRows: number;
    campaignsTotal: number;
    campaignsActive: number;
    marketingNotificationsTotal: number;
  };
  recentActivity: {
    last7Days: AdminMarketingRecentWindow;
    last30Days: AdminMarketingRecentWindow;
  };
  topAuctions: AdminMarketingTopAuctionRow[];
  topSellers: AdminMarketingTopSellerRow[];
  topAuctionsLast7Days: AdminMarketingTopAuctionWindowRow[];
  topSellersLast7Days: AdminMarketingTopSellerRow[];
  recentCampaigns: AdminMarketingRecentCampaignRow[];
};

function windowCutoffs(now: Date) {
  return {
    d7: new Date(now.getTime() - 7 * MS_DAY),
    d30: new Date(now.getTime() - 30 * MS_DAY),
  };
}

async function loadRecentWindow(cutoff: Date): Promise<AdminMarketingRecentWindow> {
  const [trafficEventRows, byEventType, campaignsUpdated, campaignsCreated, marketingNotificationsCreated] =
    await Promise.all([
      prisma.trafficEvent.count({ where: { createdAt: { gte: cutoff } } }),
      prisma.trafficEvent.groupBy({
        by: ["eventType"],
        where: { createdAt: { gte: cutoff } },
        _count: { _all: true },
      }),
      prisma.campaign.count({ where: { updatedAt: { gte: cutoff } } }),
      prisma.campaign.count({ where: { createdAt: { gte: cutoff } } }),
      prisma.notification.count({
        where: {
          type: { startsWith: MARKETING_NOTIFICATION_PREFIX },
          createdAt: { gte: cutoff },
        },
      }),
    ]);

  const countFor = (t: MarketingTrafficEventType) =>
    byEventType.find((r) => r.eventType === t)?._count._all ?? 0;

  return {
    trafficEventRows,
    viewEvents: countFor(MarketingTrafficEventType.VIEW),
    shareClickEvents: countFor(MarketingTrafficEventType.SHARE_CLICK),
    bidClickEvents: countFor(MarketingTrafficEventType.BID_CLICK),
    externalReferralEvents: countFor(
      MarketingTrafficEventType.EXTERNAL_REFERRAL
    ),
    campaignsUpdated,
    campaignsCreated,
    marketingNotificationsCreated,
  };
}

/**
 * Read-only aggregates for **ADMIN** marketing dashboard.
 * Heavy on `TrafficEvent` / rollups — acceptable for low-frequency admin loads.
 */
export async function getAdminMarketingPlatformSummary(): Promise<AdminMarketingPlatformSummary> {
  const marketingFeatureEnabled = isMarketingEnabled();
  const now = new Date();
  const { d7, d30 } = windowCutoffs(now);

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
    last7,
    last30,
    topAuction7Raw,
    seller7Raw,
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
    loadRecentWindow(d7),
    loadRecentWindow(d30),
    prisma.$queryRaw<Array<{ auctionId: string; cnt: bigint }>>`
      SELECT te."auctionId" AS "auctionId", COUNT(te.id)::bigint AS cnt
      FROM "TrafficEvent" te
      WHERE te."createdAt" >= ${d7}
      GROUP BY te."auctionId"
      ORDER BY cnt DESC
      LIMIT ${TOP_AUCTIONS_LAST7}
    `,
    prisma.$queryRaw<Array<{ sellerId: string; cnt: bigint }>>`
      SELECT a."sellerId" AS "sellerId", COUNT(te.id)::bigint AS cnt
      FROM "TrafficEvent" te
      INNER JOIN "Auction" a ON a.id = te."auctionId"
      WHERE te."createdAt" >= ${d7}
      GROUP BY a."sellerId"
      ORDER BY cnt DESC
      LIMIT ${TOP_SELLERS_LAST7}
    `,
  ]);

  const countFor = (t: MarketingTrafficEventType) =>
    byEventType.find((r) => r.eventType === t)?._count._all ?? 0;

  const auctionIds = topAuctionRaw.map((g) => g.auctionId);
  const [auctions, viewShareMap, bidGroups, extRefGroups] = await Promise.all([
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
    auctionIds.length
      ? prisma.trafficEvent.groupBy({
          by: ["auctionId"],
          where: {
            auctionId: { in: auctionIds },
            eventType: MarketingTrafficEventType.EXTERNAL_REFERRAL,
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const bidByAuction = new Map(
    bidGroups.map((b) => [b.auctionId, b._count._all])
  );
  const extRefByAuction = new Map(
    extRefGroups.map((b) => [b.auctionId, b._count._all])
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
        externalReferrals: extRefByAuction.get(g.auctionId) ?? 0,
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

  const auctionIds7 = topAuction7Raw.map((g) => g.auctionId);
  const [auctions7, breakdown7] = await Promise.all([
    auctionIds7.length
      ? prisma.auction.findMany({
          where: { id: { in: auctionIds7 } },
          select: {
            id: true,
            title: true,
            status: true,
            sellerId: true,
            seller: { select: { handle: true } },
          },
        })
      : Promise.resolve([]),
    auctionIds7.length
      ? prisma.trafficEvent.groupBy({
          by: ["auctionId", "eventType"],
          where: {
            auctionId: { in: auctionIds7 },
            createdAt: { gte: d7 },
          },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  const byAuctionType7 = new Map<
    string,
    Partial<Record<MarketingTrafficEventType, number>>
  >();
  for (const row of breakdown7) {
    const m = byAuctionType7.get(row.auctionId) ?? {};
    m[row.eventType] = row._count._all;
    byAuctionType7.set(row.auctionId, m);
  }
  const auction7ById = new Map(auctions7.map((a) => [a.id, a]));

  const topAuctionsLast7Days: AdminMarketingTopAuctionWindowRow[] =
    topAuction7Raw
      .map((g) => {
        const a = auction7ById.get(g.auctionId);
        if (!a) return null;
        const m = byAuctionType7.get(g.auctionId) ?? {};
        return {
          auctionId: g.auctionId,
          title: a.title,
          status: a.status,
          sellerHandle: a.seller.handle,
          sellerId: a.sellerId,
          totalEvents: Number(g.cnt),
          viewEvents: m[MarketingTrafficEventType.VIEW] ?? 0,
          shareClickEvents: m[MarketingTrafficEventType.SHARE_CLICK] ?? 0,
          bidClickEvents: m[MarketingTrafficEventType.BID_CLICK] ?? 0,
          externalReferralEvents:
            m[MarketingTrafficEventType.EXTERNAL_REFERRAL] ?? 0,
        };
      })
      .filter((x): x is AdminMarketingTopAuctionWindowRow => x != null);

  const seller7Ids = seller7Raw.map((r) => r.sellerId);
  const users7 = seller7Ids.length
    ? await prisma.user.findMany({
        where: { id: { in: seller7Ids } },
        select: { id: true, handle: true },
      })
    : [];
  const user7ById = new Map(users7.map((u) => [u.id, u]));

  const topSellersLast7Days: AdminMarketingTopSellerRow[] = seller7Raw
    .map((r) => {
      const u = user7ById.get(r.sellerId);
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
      externalReferralEvents: countFor(
        MarketingTrafficEventType.EXTERNAL_REFERRAL
      ),
      rollupViewsSum: rollupAgg._sum.views ?? 0,
      rollupShareClicksSum: rollupAgg._sum.shareClicks ?? 0,
      auctionAnalyticsDayRows: analyticsRowCount,
      campaignsTotal,
      campaignsActive,
      marketingNotificationsTotal,
    },
    recentActivity: {
      last7Days: last7,
      last30Days: last30,
    },
    topAuctions,
    topSellers,
    topAuctionsLast7Days,
    topSellersLast7Days,
    recentCampaigns,
  };
}
