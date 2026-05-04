"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  Download,
  ExternalLink,
  Eye,
  FileJson,
  Hand,
  Megaphone,
  MousePointerClick,
  Radio,
  Share2,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { CampaignStatusBadge, campaignStatusLabel } from "@/components/marketing/campaign-status-badge";
import { MarketingCampaignStatus } from "@prisma/client";
import type {
  AdminMarketingRecentWindow,
  AdminMarketingPlatformSummary,
} from "@/lib/marketing/get-admin-marketing-platform-summary";

function WindowStatsPanel({
  title,
  stats,
}: {
  title: string;
  stats: AdminMarketingRecentWindow;
}) {
  const rows: { label: string; value: string | number }[] = [
    { label: "Traffic events (rows)", value: stats.trafficEventRows },
    { label: "View events", value: stats.viewEvents },
    { label: "Share click events", value: stats.shareClickEvents },
    { label: "Bid click events", value: stats.bidClickEvents },
    { label: "External referral events", value: stats.externalReferralEvents },
    { label: "Campaigns updated", value: stats.campaignsUpdated },
    { label: "Campaigns created", value: stats.campaignsCreated },
    {
      label: "Marketing notifications created",
      value: stats.marketingNotificationsCreated,
    },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-e1">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums font-medium text-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const ALL_STATUSES = Object.values(MarketingCampaignStatus);

export function AdminMarketingClient({ data: s }: { data: AdminMarketingPlatformSummary }) {
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<MarketingCampaignStatus | "ALL">("ALL");

  const filteredCampaigns =
    campaignStatusFilter === "ALL"
      ? s.recentCampaigns
      : s.recentCampaigns.filter((c) => c.status === campaignStatusFilter);

  const kpi = [
    {
      label: "Traffic events (rows)",
      value: s.totals.trafficEventRows,
      icon: Megaphone,
      hint: "All recorded marketing events",
    },
    { label: "View events", value: s.totals.viewEvents, icon: Eye },
    { label: "Share click events", value: s.totals.shareClickEvents, icon: Share2 },
    {
      label: "Bid click events",
      value: s.totals.bidClickEvents,
      icon: Hand,
      hint: "Intent taps, not completed bids",
    },
    {
      label: "External referral events",
      value: s.totals.externalReferralEvents,
      icon: ExternalLink,
      hint: "TrafficEvent EXTERNAL_REFERRAL (all time)",
    },
    {
      label: "Rollup views (sum)",
      value: s.totals.rollupViewsSum,
      icon: Radio,
      hint: `${s.totals.auctionAnalyticsDayRows} AuctionAnalytics day rows`,
    },
    {
      label: "Rollup share clicks (sum)",
      value: s.totals.rollupShareClicksSum,
      icon: MousePointerClick,
    },
    {
      label: "Campaigns (active / total)",
      value: `${s.totals.campaignsActive} / ${s.totals.campaignsTotal}`,
      icon: Target,
    },
    {
      label: "Marketing notifications",
      value: s.totals.marketingNotificationsTotal,
      icon: BarChart3,
      hint: "In-app MARKETING_* rows (all sellers)",
    },
  ];

  return (
    <div className="carasta-container max-w-6xl py-8 md:py-10">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div className="min-w-0 flex-1">
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            ← Admin home
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Marketing summary
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Read-only platform aggregates — TrafficEvent, rollups, campaigns, and marketing
            notifications.
          </p>
          {!s.marketingFeatureEnabled ? (
            <p className="mt-4 rounded-lg border border-caution/30 bg-caution-soft px-3 py-2 text-xs text-caution-foreground">
              <strong className="font-medium">MARKETING_ENABLED</strong> is off — seller UI is
              hidden; historical rows may still exist below.
            </p>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/admin/marketing/export/summary" download>
              <Download className="mr-2 h-3.5 w-3.5" />
              Export summary CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/admin/marketing/export/tops-last-7" download>
              <Download className="mr-2 h-3.5 w-3.5" />
              Export tops (7d) CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/admin/marketing/snapshot" target="_blank" rel="noreferrer">
              <FileJson className="mr-2 h-3.5 w-3.5" />
              JSON snapshot
            </a>
          </Button>
        </div>
      </div>

      <section
        className="mb-10 rounded-xl border border-border bg-card p-6 shadow-e1"
        aria-labelledby="recent-activity-heading"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <h2 id="recent-activity-heading" className="text-sm font-semibold text-foreground">
              Recent activity
            </h2>
            <p className="text-xs text-muted-foreground">
              Rolling windows from server time — TrafficEvent, campaign timestamps, and marketing
              notification{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">createdAt</code>.
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <WindowStatsPanel title="Last 7 days" stats={s.recentActivity.last7Days} />
          <WindowStatsPanel title="Last 30 days" stats={s.recentActivity.last30Days} />
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold text-foreground">All-time platform totals</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-e1">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold tabular-nums text-foreground">{value}</p>
              </div>
            </div>
            {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-lg font-semibold text-foreground">Last 7 days — leaders</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Top listings (last 7 days)</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              TrafficEvent counts in the rolling 7-day window only.
            </p>
          </div>
          <div className="max-h-[22rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Listing</th>
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                  <th className="px-3 py-2 text-right">Views</th>
                  <th className="px-3 py-2 text-right">Shares</th>
                  <th className="px-3 py-2 text-right">Bid clk</th>
                  <th className="px-3 py-2 text-right">Ext ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.topAuctionsLast7Days.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No traffic in the last 7 days.
                    </td>
                  </tr>
                ) : (
                  s.topAuctionsLast7Days.map((a) => (
                    <tr key={a.auctionId} className="text-foreground">
                      <td className="max-w-[140px] px-3 py-2">
                        <Link
                          href={`/auctions/${a.auctionId}`}
                          className="line-clamp-2 font-medium text-primary hover:underline"
                        >
                          {a.title}
                        </Link>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{a.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/u/${a.sellerHandle}`} className="text-primary hover:underline">
                          @{a.sellerHandle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.totalEvents}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.viewEvents}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.shareClickEvents}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.bidClickEvents}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.externalReferralEvents}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Top sellers (last 7 days)</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              TrafficEvent rows across all listings, 7-day window.
            </p>
          </div>
          <div className="max-h-[22rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.topSellersLast7Days.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      No data.
                    </td>
                  </tr>
                ) : (
                  s.topSellersLast7Days.map((r) => (
                    <tr key={r.sellerId} className="text-foreground">
                      <td className="px-3 py-2">
                        <Link href={`/u/${r.handle}`} className="font-medium text-primary hover:underline">
                          @{r.handle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.eventCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold text-foreground">All-time leaders</h2>
      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Top listings by event volume</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ranked by total TrafficEvent rows per auction (lifetime).
            </p>
          </div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Listing</th>
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                  <th className="px-3 py-2 text-right">Views</th>
                  <th className="px-3 py-2 text-right">Shares</th>
                  <th className="px-3 py-2 text-right">Bid clk</th>
                  <th className="px-3 py-2 text-right">Ext ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.topAuctions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No traffic events yet.
                    </td>
                  </tr>
                ) : (
                  s.topAuctions.map((a) => (
                    <tr key={a.auctionId} className="text-foreground">
                      <td className="max-w-[160px] px-3 py-2">
                        <Link
                          href={`/auctions/${a.auctionId}`}
                          className="line-clamp-2 font-medium text-primary hover:underline"
                        >
                          {a.title}
                        </Link>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{a.status}</span>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/u/${a.sellerHandle}`} className="text-primary hover:underline">
                          @{a.sellerHandle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.totalEvents}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.views}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.shareClicks}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.bidClicks}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{a.externalReferrals}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-e1">
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">Top sellers by event volume</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Aggregated TrafficEvent counts across all listings (lifetime).
            </p>
          </div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {s.topSellers.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                      No data.
                    </td>
                  </tr>
                ) : (
                  s.topSellers.map((r) => (
                    <tr key={r.sellerId} className="text-foreground">
                      <td className="px-3 py-2">
                        <Link href={`/u/${r.handle}`} className="font-medium text-primary hover:underline">
                          @{r.handle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.eventCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Campaigns table with status filter */}
      <div className="mt-10 overflow-hidden rounded-xl border border-border bg-card shadow-e1">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Recent campaign updates</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Newest by <code className="rounded bg-muted px-1 py-0.5 text-foreground">updatedAt</code> (all sellers).
            </p>
          </div>
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCampaignStatusFilter("ALL")}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                campaignStatusFilter === "ALL"
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({s.recentCampaigns.length})
            </button>
            {ALL_STATUSES.map((status) => {
              const count = s.recentCampaigns.filter((c) => c.status === status).length;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setCampaignStatusFilter(status)}
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                    campaignStatusFilter === status
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {campaignStatusLabel(status)} ({count})
                </button>
              );
            })}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2">Campaign</th>
                <th className="px-4 py-2">Seller</th>
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No campaigns match this filter.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="text-foreground">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">
                      <Link href={`/u/${c.sellerHandle}`} className="text-muted-foreground hover:text-primary">
                        @{c.sellerHandle}
                      </Link>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                      <Link href={`/auctions/${c.auctionId}`} className="text-primary hover:underline">
                        {c.auctionTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{campaignTypeLabel(c.type)}</td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge status={c.status as MarketingCampaignStatus} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Links go to public listing and profile pages only. Seller marketing tools remain owner-only —
        no impersonation from this dashboard.
      </p>
    </div>
  );
}
