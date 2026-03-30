import { prisma } from "@/lib/db";
import { MarketingCampaignStatus, MarketingTrafficEventType } from "@prisma/client";
import { sumViewShareTotalsForSellerAuctions } from "@/lib/marketing/get-view-share-totals";

export type SellerMarketingOverview = {
  totalListings: number;
  liveAuctions: number;
  marketingEvents: number;
  activeCampaigns: number;
  totalViews: number;
  totalShareClicks: number;
  totalBidClicks: number;
};

export async function getSellerMarketingOverview(
  sellerId: string
): Promise<SellerMarketingOverview> {
  const [
    totalListings,
    liveAuctions,
    marketingEvents,
    activeCampaigns,
    shareTotals,
    totalBidClicks,
  ] = await Promise.all([
    prisma.auction.count({ where: { sellerId } }),
    prisma.auction.count({ where: { sellerId, status: "LIVE" } }),
    prisma.trafficEvent.count({
      where: { auction: { sellerId } },
    }),
    prisma.campaign.count({
      where: {
        userId: sellerId,
        status: MarketingCampaignStatus.ACTIVE,
      },
    }),
    sumViewShareTotalsForSellerAuctions(sellerId),
    prisma.trafficEvent.count({
      where: {
        auction: { sellerId },
        eventType: MarketingTrafficEventType.BID_CLICK,
      },
    }),
  ]);

  return {
    totalListings,
    liveAuctions,
    marketingEvents,
    activeCampaigns,
    totalViews: shareTotals.views,
    totalShareClicks: shareTotals.shareClicks,
    totalBidClicks,
  };
}
