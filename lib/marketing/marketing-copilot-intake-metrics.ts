import type { SellerMarketingAuctionDetail } from "@/lib/marketing/get-seller-marketing-auction-detail";

/**
 * Serializable snapshot of listing marketing traffic shown in the copilot intake UI.
 * Mirrors the per-listing marketing dashboard so sellers see what context they are generating with.
 */
export type MarketingCopilotIntakeMetricsSnapshot = {
  totalViews: number;
  totalShareClicks: number;
  totalBidClicks: number;
  viewsLast24h: number;
  viewsLast7d: number;
  bidClicksLast24h: number;
  bidClicksLast7d: number;
  listingStatus: string;
  endAtIso: string;
  highBidCents: number;
  lastActivityAtIso: string | null;
};

export function buildMarketingCopilotIntakeMetricsFromDetail(
  detail: SellerMarketingAuctionDetail
): MarketingCopilotIntakeMetricsSnapshot {
  const { auction } = detail;
  return {
    totalViews: detail.totalViews,
    totalShareClicks: detail.totalShareClicks,
    totalBidClicks: detail.totalBidClicks,
    viewsLast24h: detail.viewsLast24h,
    viewsLast7d: detail.viewsLast7d,
    bidClicksLast24h: detail.bidClicksLast24h,
    bidClicksLast7d: detail.bidClicksLast7d,
    listingStatus: auction.status,
    endAtIso: auction.endAt.toISOString(),
    highBidCents: auction.highBidCents,
    lastActivityAtIso: detail.lastMarketingActivityAt?.toISOString() ?? null,
  };
}
