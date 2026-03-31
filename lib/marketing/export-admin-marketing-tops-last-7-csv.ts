import { csvRow } from "@/lib/marketing/csv-utils";
import type { AdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

/**
 * Last 7 days top listings and top sellers (dashboard tables).
 * Two labeled blocks for readability in Excel.
 */
export function buildAdminMarketingTopsLast7Csv(
  s: AdminMarketingPlatformSummary
): string {
  const lines: string[] = [];
  const push = (cells: (string | number | null | undefined)[]) =>
    lines.push(csvRow(cells));

  push(["Top listings (last 7 days)"]);
  push([
    "auction_id",
    "title",
    "listing_status",
    "seller_handle",
    "seller_id",
    "total_events",
    "view_events",
    "share_click_events",
    "bid_click_events",
    "external_referral_events",
  ]);
  for (const a of s.topAuctionsLast7Days) {
    push([
      a.auctionId,
      a.title,
      a.status,
      a.sellerHandle,
      a.sellerId,
      a.totalEvents,
      a.viewEvents,
      a.shareClickEvents,
      a.bidClickEvents,
      a.externalReferralEvents,
    ]);
  }

  lines.push("");
  push(["Top sellers (last 7 days)"]);
  push(["seller_id", "handle", "event_count"]);
  for (const r of s.topSellersLast7Days) {
    push([r.sellerId, r.handle, r.eventCount]);
  }

  return lines.join("\r\n");
}
