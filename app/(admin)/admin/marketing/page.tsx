import Link from "next/link";
import {
  BarChart3,
  Eye,
  Hand,
  Megaphone,
  MousePointerClick,
  Radio,
  Share2,
  Target,
} from "lucide-react";
import { getAdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { CampaignStatusBadge } from "@/components/marketing/campaign-status-badge";
import { MarketingCampaignStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminMarketingPage() {
  const s = await getAdminMarketingPlatformSummary();

  const kpi = [
    {
      label: "Traffic events (rows)",
      value: s.totals.trafficEventRows,
      icon: Megaphone,
      hint: "All recorded marketing events",
    },
    {
      label: "View events",
      value: s.totals.viewEvents,
      icon: Eye,
    },
    {
      label: "Share click events",
      value: s.totals.shareClickEvents,
      icon: Share2,
    },
    {
      label: "Bid click events",
      value: s.totals.bidClickEvents,
      icon: Hand,
      hint: "Intent taps, not completed bids",
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
    <div className="carasta-container max-w-6xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm text-neutral-500 transition hover:text-neutral-300"
          >
            ← Admin home
          </Link>
          <h2 className="mt-3 font-display text-xl font-semibold uppercase tracking-wider text-neutral-100">
            Marketing summary
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Read-only platform aggregates — TrafficEvent, rollups, campaigns, and
            marketing notifications.
          </p>
          {!s.marketingFeatureEnabled ? (
            <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
              <strong className="font-medium">MARKETING_ENABLED</strong> is off —
              seller UI is hidden; historical rows may still exist below.
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#ff3b5c]/20 p-2">
                <Icon className="h-5 w-5 text-[#ff3b5c]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="text-xl font-semibold text-neutral-100">{value}</p>
              </div>
            </div>
            {hint ? (
              <p className="mt-2 text-xs text-neutral-500">{hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="border-b border-white/10 bg-white/5 px-4 py-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Top listings by event volume
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Ranked by total TrafficEvent rows per auction.
            </p>
          </div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-3 py-2">Listing</th>
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                  <th className="px-3 py-2 text-right">Views</th>
                  <th className="px-3 py-2 text-right">Shares</th>
                  <th className="px-3 py-2 text-right">Bid clk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {s.topAuctions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-neutral-500"
                    >
                      No traffic events yet.
                    </td>
                  </tr>
                ) : (
                  s.topAuctions.map((a) => (
                    <tr key={a.auctionId} className="text-neutral-300">
                      <td className="max-w-[160px] px-3 py-2">
                        <Link
                          href={`/auctions/${a.auctionId}`}
                          className="line-clamp-2 font-medium text-[#ff3b5c] hover:underline"
                        >
                          {a.title}
                        </Link>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {a.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          href={`/u/${a.sellerHandle}`}
                          className="text-[#ff3b5c]/90 hover:underline"
                        >
                          @{a.sellerHandle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {a.totalEvents}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {a.views}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {a.shareClicks}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {a.bidClicks}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10">
          <div className="border-b border-white/10 bg-white/5 px-4 py-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Top sellers by event volume
            </h3>
            <p className="mt-0.5 text-xs text-neutral-500">
              Aggregated TrafficEvent counts across all listings.
            </p>
          </div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500">
                  <th className="px-3 py-2">Seller</th>
                  <th className="px-3 py-2 text-right">Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {s.topSellers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-8 text-center text-neutral-500"
                    >
                      No data.
                    </td>
                  </tr>
                ) : (
                  s.topSellers.map((r) => (
                    <tr key={r.sellerId} className="text-neutral-300">
                      <td className="px-3 py-2">
                        <Link
                          href={`/u/${r.handle}`}
                          className="font-medium text-[#ff3b5c]/90 hover:underline"
                        >
                          @{r.handle}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {r.eventCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-xl border border-white/10">
        <div className="border-b border-white/10 bg-white/5 px-4 py-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-200">
            Recent campaign updates
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500">
            Newest by <code className="text-neutral-400">updatedAt</code> (all
            sellers).
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-2">Campaign</th>
                <th className="px-4 py-2">Seller</th>
                <th className="px-4 py-2">Listing</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {s.recentCampaigns.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-neutral-500"
                  >
                    No campaigns.
                  </td>
                </tr>
              ) : (
                s.recentCampaigns.map((c) => (
                  <tr key={c.id} className="text-neutral-300">
                    <td className="px-4 py-3 font-medium text-neutral-200">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/u/${c.sellerHandle}`}
                        className="text-neutral-400 hover:text-neutral-200"
                      >
                        @{c.sellerHandle}
                      </Link>
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-neutral-500">
                      <Link
                        href={`/auctions/${c.auctionId}`}
                        className="hover:text-[#ff3b5c]/90 hover:underline"
                      >
                        {c.auctionTitle}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {campaignTypeLabel(c.type)}
                    </td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge
                        status={c.status as MarketingCampaignStatus}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-500">
                      {c.updatedAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-8 text-xs text-neutral-600">
        Links go to public listing and profile pages only. Seller marketing
        tools remain owner-only — no impersonation from this dashboard.
      </p>
    </div>
  );
}
