import { prisma } from "@/lib/db";
import {
  MarketingCampaignStatus,
  MarketingTrafficEventType,
} from "@prisma/client";

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
    totalViews,
    totalShareClicks,
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
    prisma.trafficEvent.count({
      where: {
        auction: { sellerId },
        eventType: MarketingTrafficEventType.VIEW,
      },
    }),
    prisma.trafficEvent.count({
      where: {
        auction: { sellerId },
        eventType: MarketingTrafficEventType.SHARE_CLICK,
      },
    }),
  ]);

  return {
    totalListings,
    liveAuctions,
    marketingEvents,
    activeCampaigns,
    totalViews,
    totalShareClicks,
  };
}
