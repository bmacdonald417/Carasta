import { getSellerMarketingAuctionDetail } from "@/lib/marketing/get-seller-marketing-auction-detail";
import { getAuctionCampaignsForSeller } from "@/lib/marketing/get-seller-campaigns";
import { csvRow } from "@/lib/marketing/csv-utils";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";

const HEADER = [
  "section",
  "col1",
  "col2",
  "col3",
  "col4",
  "col5",
  "col6",
  "col7",
  "col8",
  "col9",
] as const;

function pad(cells: string[]): string[] {
  const out = [...cells];
  while (out.length < HEADER.length) out.push("");
  return out.slice(0, HEADER.length);
}

/**
 * Single-auction marketing export: multiple logical sections in one wide CSV (`section` discriminates rows).
 */
export async function buildSellerAuctionMarketingCsv(
  sellerId: string,
  auctionId: string
): Promise<string | null> {
  const [detail, campaigns] = await Promise.all([
    getSellerMarketingAuctionDetail(auctionId, sellerId),
    getAuctionCampaignsForSeller(sellerId, auctionId),
  ]);
  if (!detail) return null;

  const { auction } = detail;
  const lines: string[] = [csvRow([...HEADER])];

  const summaryRows: [string, string][] = [
    ["auction_id", auction.id],
    ["title", auction.title],
    ["status", auction.status],
    ["created_at", auction.createdAt.toISOString()],
    ["end_at", auction.endAt.toISOString()],
    ["year", String(auction.year)],
    ["make", auction.make],
    ["model", auction.model],
    ["trim", auction.trim ?? ""],
    ["mileage", auction.mileage != null ? String(auction.mileage) : ""],
    ["high_bid_cents", String(auction.highBidCents)],
  ];
  for (const [k, v] of summaryRows) {
    lines.push(csvRow(pad(["summary", k, v])));
  }

  const totals: [string, string][] = [
    ["total_views", String(detail.totalViews)],
    ["total_share_clicks", String(detail.totalShareClicks)],
    ["total_bid_clicks", String(detail.totalBidClicks)],
    ["views_last_24h", String(detail.viewsLast24h)],
    ["views_last_7d", String(detail.viewsLast7d)],
    ["bid_clicks_last_24h", String(detail.bidClicksLast24h)],
    ["bid_clicks_last_7d", String(detail.bidClicksLast7d)],
    [
      "last_marketing_activity_at",
      detail.lastMarketingActivityAt?.toISOString() ?? "",
    ],
  ];
  for (const [k, v] of totals) {
    lines.push(csvRow(pad(["totals", k, v])));
  }

  for (const s of detail.bySource) {
    if (s.count === 0) continue;
    lines.push(
      csvRow(pad(["by_source", String(s.source), String(s.count)]))
    );
  }

  for (const e of detail.byEventType) {
    if (e.count === 0) continue;
    lines.push(
      csvRow(pad(["by_event_type", String(e.eventType), String(e.count)]))
    );
  }

  for (const st of detail.shareTargetCounts) {
    lines.push(
      csvRow(pad(["share_target", st.target, String(st.count)]))
    );
  }

  for (const ev of detail.recentEvents) {
    lines.push(
      csvRow(
        pad([
          "recent_event",
          ev.id,
          ev.createdAt.toISOString(),
          String(ev.eventType),
          String(ev.source),
          ev.shareTarget ?? "",
          ev.bidUiSurface ?? "",
        ])
      )
    );
  }

  for (const p of detail.linkedPromoPosts) {
    lines.push(
      csvRow(
        pad([
          "linked_promo_post",
          p.id,
          p.createdAt.toISOString(),
          p.contentPreview ?? "",
          p.imageUrl ?? "",
        ])
      )
    );
  }

  for (const c of campaigns) {
    lines.push(
      csvRow(
        pad([
          "campaign",
          c.id,
          c.name,
          campaignTypeLabel(c.type),
          c.type,
          c.status,
          c.startAt?.toISOString() ?? "",
          c.endAt?.toISOString() ?? "",
          c.createdAt.toISOString(),
          c.updatedAt.toISOString(),
        ])
      )
    );
  }

  return lines.join("\r\n");
}
