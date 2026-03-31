import { csvRow } from "@/lib/marketing/csv-utils";
import type { AdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

export function buildAdminMarketingSummaryCsv(
  s: AdminMarketingPlatformSummary,
  exportedAt: Date
): string {
  const lines: string[] = [];
  const push = (cells: (string | number | null | undefined)[]) =>
    lines.push(csvRow(cells));

  push(["scope", "metric", "value"]);
  push(["meta", "exported_at_iso", exportedAt.toISOString()]);
  push([
    "meta",
    "marketing_feature_enabled",
    s.marketingFeatureEnabled ? "true" : "false",
  ]);

  const t = s.totals;
  push(["all_time", "traffic_event_rows", t.trafficEventRows]);
  push(["all_time", "view_events", t.viewEvents]);
  push(["all_time", "share_click_events", t.shareClickEvents]);
  push(["all_time", "bid_click_events", t.bidClickEvents]);
  push(["all_time", "rollup_views_sum", t.rollupViewsSum]);
  push(["all_time", "rollup_share_clicks_sum", t.rollupShareClicksSum]);
  push(["all_time", "auction_analytics_day_rows", t.auctionAnalyticsDayRows]);
  push(["all_time", "campaigns_total", t.campaignsTotal]);
  push(["all_time", "campaigns_active", t.campaignsActive]);
  push(["all_time", "marketing_notifications_total", t.marketingNotificationsTotal]);

  const w7 = s.recentActivity.last7Days;
  push(["last_7_days", "traffic_event_rows", w7.trafficEventRows]);
  push(["last_7_days", "view_events", w7.viewEvents]);
  push(["last_7_days", "share_click_events", w7.shareClickEvents]);
  push(["last_7_days", "bid_click_events", w7.bidClickEvents]);
  push(["last_7_days", "campaigns_updated", w7.campaignsUpdated]);
  push(["last_7_days", "campaigns_created", w7.campaignsCreated]);
  push([
    "last_7_days",
    "marketing_notifications_created",
    w7.marketingNotificationsCreated,
  ]);

  const w30 = s.recentActivity.last30Days;
  push(["last_30_days", "traffic_event_rows", w30.trafficEventRows]);
  push(["last_30_days", "view_events", w30.viewEvents]);
  push(["last_30_days", "share_click_events", w30.shareClickEvents]);
  push(["last_30_days", "bid_click_events", w30.bidClickEvents]);
  push(["last_30_days", "campaigns_updated", w30.campaignsUpdated]);
  push(["last_30_days", "campaigns_created", w30.campaignsCreated]);
  push([
    "last_30_days",
    "marketing_notifications_created",
    w30.marketingNotificationsCreated,
  ]);

  return lines.join("\r\n");
}
