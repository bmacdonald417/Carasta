import { prisma } from "@/lib/db";
import { getSellerMarketingOverview } from "@/lib/marketing/get-seller-marketing-overview";
import { getSellerMarketingAuctionRows } from "@/lib/marketing/get-seller-marketing-auction-rows";
import { getSellerMarketingNotifications } from "@/lib/marketing/get-seller-marketing-notifications";
import { MarketingCampaignStatus } from "@prisma/client";

const TOP_N = 5;
const ENDING_SOON_DAYS = 7;
const LOW_ENGAGEMENT_TOTAL = 8; // views + shares + bid clicks lifetime rollup totals

export type DigestAuctionLine = {
  id: string;
  title: string;
  views: number;
  shareClicks: number;
  bidClicks: number;
  status: string;
  endAt: Date;
};

export type DigestAlertLine = {
  title: string;
  marketingHref: string | null;
};

export type DigestCampaignLine = {
  name: string;
  status: string;
  auctionTitle: string;
  marketingHref: string;
};

export type MarketingDigestSnapshot = {
  sellerId: string;
  handle: string;
  email: string;
  greetingName: string;
  overview: {
    liveAuctions: number;
    totalViews: number;
    totalShareClicks: number;
    totalBidClicks: number;
    activeCampaigns: number;
  };
  recentAlerts: DigestAlertLine[];
  topByViews: DigestAuctionLine[];
  topByBidClicks: DigestAuctionLine[];
  endingSoon: DigestAuctionLine[];
  lowEngagement: DigestAuctionLine[];
  activeCampaigns: DigestCampaignLine[];
};

function marketingAuctionPath(handle: string, auctionId: string): string {
  return `/u/${handle}/marketing/auctions/${auctionId}`;
}

function toLine(
  row: Awaited<
    ReturnType<typeof getSellerMarketingAuctionRows>
  >[number]
): DigestAuctionLine {
  return {
    id: row.id,
    title: row.title,
    views: row.totalViews,
    shareClicks: row.totalShareClicks,
    bidClicks: row.totalBidClicks,
    status: row.status,
    endAt: row.endAt,
  };
}

/**
 * Deterministic weekly digest snapshot for one seller. Read-only; used by
 * `render-marketing-digest-email` + send script.
 */
export async function buildMarketingDigestSnapshot(
  sellerId: string
): Promise<MarketingDigestSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true,
      email: true,
      handle: true,
      name: true,
    },
  });
  if (!user) return null;

  const handle = user.handle;
  const handleLower = handle.toLowerCase();

  const [overview, rows, alertRows, campaigns] = await Promise.all([
    getSellerMarketingOverview(sellerId),
    getSellerMarketingAuctionRows(sellerId),
    getSellerMarketingNotifications(sellerId, 8),
    prisma.campaign.findMany({
      where: {
        userId: sellerId,
        status: MarketingCampaignStatus.ACTIVE,
      },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { auction: { select: { id: true, title: true } } },
    }),
  ]);

  const live = rows.filter((r) => r.status === "LIVE");
  const now = Date.now();
  const endingCutoff = new Date(
    now + ENDING_SOON_DAYS * 24 * 60 * 60 * 1000
  );

  const topByViews = [...live]
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, TOP_N)
    .map(toLine);

  const topByBidClicks = [...live]
    .sort((a, b) => b.totalBidClicks - a.totalBidClicks)
    .slice(0, TOP_N)
    .map(toLine);

  const endingSoon = live
    .filter((r) => r.endAt <= endingCutoff)
    .sort((a, b) => a.endAt.getTime() - b.endAt.getTime())
    .slice(0, TOP_N)
    .map(toLine);

  const lowEngagement = live
    .filter(
      (r) =>
        r.totalViews + r.totalShareClicks + r.totalBidClicks < LOW_ENGAGEMENT_TOTAL
    )
    .sort(
      (a, b) =>
        a.totalViews +
        a.totalShareClicks +
        a.totalBidClicks -
        (b.totalViews + b.totalShareClicks + b.totalBidClicks)
    )
    .slice(0, TOP_N)
    .map(toLine);

  const recentAlerts: DigestAlertLine[] = alertRows.map((a) => ({
    title: a.title,
    marketingHref:
      a.marketingHref ??
      (a.auctionId ? marketingAuctionPath(handleLower, a.auctionId) : null),
  }));

  const activeCampaigns: DigestCampaignLine[] = campaigns.map((c) => ({
    name: c.name,
    status: c.status,
    auctionTitle: c.auction.title,
    marketingHref: marketingAuctionPath(handleLower, c.auctionId),
  }));

  return {
    sellerId: user.id,
    handle: user.handle,
    email: user.email,
    greetingName: user.name?.trim() || `@${user.handle}`,
    overview: {
      liveAuctions: overview.liveAuctions,
      totalViews: overview.totalViews,
      totalShareClicks: overview.totalShareClicks,
      totalBidClicks: overview.totalBidClicks,
      activeCampaigns: overview.activeCampaigns,
    },
    recentAlerts,
    topByViews,
    topByBidClicks,
    endingSoon,
    lowEngagement,
    activeCampaigns,
  };
}
