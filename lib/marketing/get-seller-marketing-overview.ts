import { prisma } from "@/lib/db";
import { MarketingCampaignStatus } from "@prisma/client";
import { sumViewShareTotalsForSellerAuctions } from "@/lib/marketing/get-view-share-totals";

export type SellerMarketingOverview = {
  totalListings: number;
  liveAuctions: number;
  marketingEvents: number;
  activeCampaigns: number;
  totalViews: number;
  totalShareClicks: number;
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
  ]);

  return {
    totalListings,
    liveAuctions,
    marketingEvents,
    activeCampaigns,
    totalViews: shareTotals.views,
    totalShareClicks: shareTotals.shareClicks,
  };
}
