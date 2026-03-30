import { MarketingTrafficEventType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { utcMarketingDayFromDate } from "@/lib/marketing/utc-marketing-day";

/** Increment daily rollup after a TrafficEvent row is persisted (VIEW / SHARE_CLICK only). */
export async function incrementAuctionAnalyticsRollup(input: {
  auctionId: string;
  eventType: MarketingTrafficEventType;
  recordedAt: Date;
}): Promise<void> {
  if (
    input.eventType !== MarketingTrafficEventType.VIEW &&
    input.eventType !== MarketingTrafficEventType.SHARE_CLICK
  ) {
    return;
  }

  const day = utcMarketingDayFromDate(input.recordedAt);
  const incViews = input.eventType === MarketingTrafficEventType.VIEW;
  const incShares =
    input.eventType === MarketingTrafficEventType.SHARE_CLICK;

  await prisma.auctionAnalytics.upsert({
    where: {
      auctionId_day: { auctionId: input.auctionId, day },
    },
    create: {
      auctionId: input.auctionId,
      day,
      views: incViews ? 1 : 0,
      shareClicks: incShares ? 1 : 0,
      lastEventAt: input.recordedAt,
    },
    update: {
      ...(incViews ? { views: { increment: 1 } } : {}),
      ...(incShares ? { shareClicks: { increment: 1 } } : {}),
      lastEventAt: input.recordedAt,
    },
  });
}

/** Best-effort rollup bump; logs and swallows errors so ingest never fails on rollup. */
export async function tryIncrementAuctionAnalyticsRollup(input: {
  auctionId: string;
  eventType: MarketingTrafficEventType;
  recordedAt: Date;
}): Promise<void> {
  try {
    await incrementAuctionAnalyticsRollup(input);
  } catch (e) {
    console.error("[marketing] rollup increment failed", e);
  }
}
