import { MarketingTrafficEventType } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CopilotLightMetrics = {
  bidCount: number;
  viewsLast7d: number;
  totalViewEvents: number;
  hoursRemaining: number | null;
  listingStatus: string;
  endAtIso: string;
};

/**
 * Lightweight signals for copilot tone/cadence (not a performance guarantee).
 */
export async function loadCopilotLightMetrics(
  auctionId: string,
  sellerId: string
): Promise<CopilotLightMetrics | null> {
  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { status: true, endAt: true },
  });
  if (!auction) return null;

  const now = new Date();
  const dayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const windowStart = new Date(dayStart);
  windowStart.setUTCDate(windowStart.getUTCDate() - 6);

  const [bidCount, viewsLast7dAgg, totalViewEvents] = await Promise.all([
    prisma.bid.count({ where: { auctionId } }),
    prisma.auctionAnalytics.aggregate({
      where: { auctionId, day: { gte: windowStart } },
      _sum: { views: true },
    }),
    prisma.trafficEvent.count({
      where: { auctionId, eventType: MarketingTrafficEventType.VIEW },
    }),
  ]);

  let hoursRemaining: number | null = null;
  if (auction.status === "LIVE" && auction.endAt.getTime() > now.getTime()) {
    hoursRemaining = (auction.endAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  }

  return {
    bidCount,
    viewsLast7d: viewsLast7dAgg._sum.views ?? 0,
    totalViewEvents,
    hoursRemaining,
    listingStatus: auction.status,
    endAtIso: auction.endAt.toISOString(),
  };
}
