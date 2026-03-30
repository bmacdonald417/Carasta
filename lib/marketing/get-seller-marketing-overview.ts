import { prisma } from "@/lib/db";
import { MarketingCampaignStatus } from "@prisma/client";

export type SellerMarketingOverview = {
  totalListings: number;
  liveAuctions: number;
  marketingEvents: number;
  activeCampaigns: number;
};

export async function getSellerMarketingOverview(
  sellerId: string
): Promise<SellerMarketingOverview> {
  const [totalListings, liveAuctions, marketingEvents, activeCampaigns] =
    await Promise.all([
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
    ]);

  return {
    totalListings,
    liveAuctions,
    marketingEvents,
    activeCampaigns,
  };
}
