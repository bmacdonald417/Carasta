import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Eye,
  MousePointerClick,
  Radio,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerMarketingAuctionDetail } from "@/lib/marketing/get-seller-marketing-auction-detail";
import {
  formatMarketingDate,
  formatMarketingDateTime,
  marketingEventTypeLabel,
  marketingSourceLabel,
  shareTargetLabel,
} from "@/lib/marketing/marketing-display";

function ProportionBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-[#ff3b5c]/70 transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function MarketingAuctionDetailPage({
  params,
}: {
  params: Promise<{ handle: string; auctionId: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle, auctionId } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  const isOwn = (session?.user as any)?.id === user.id;
  if (!isOwn) notFound();

  const detail = await getSellerMarketingAuctionDetail(auctionId, user.id);
  if (!detail) notFound();

  const { auction } = detail;
  const maxSource = Math.max(...detail.bySource.map((s) => s.count), 1);
  const maxEvent = Math.max(...detail.byEventType.map((e) => e.count), 1);
  const maxShareTarget = Math.max(
    ...detail.shareTargetCounts.map((s) => s.count),
    1
  );

  const statusBadge =
    auction.status === "LIVE"
      ? "border border-[#ff3b5c]/50 bg-[#ff3b5c]/90 text-white"
      : auction.status === "SOLD"
        ? "border border-green-500/50 bg-green-500/20 text-green-400"
        : auction.status === "DRAFT"
          ? "border border-neutral-500/50 bg-neutral-500/20 text-neutral-400"
          : "border border-neutral-500/50 bg-neutral-500/20 text-neutral-400";

  const kpi = [
    {
      label: "Total views",
      value: detail.totalViews,
      icon: Eye,
    },
    {
      label: "Share clicks",
      value: detail.totalShareClicks,
      icon: MousePointerClick,
    },
    {
      label: "Views (24h)",
      value: detail.viewsLast24h,
      icon: Radio,
    },
    {
      label: "Views (7d)",
      value: detail.viewsLast7d,
      icon: Radio,
    },
    {
      label: "Last activity",
      value: formatMarketingDate(detail.lastMarketingActivityAt),
      icon: Clock,
      isText: true,
    },
  ];

  return (
    <div className="carasta-container max-w-6xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/u/${user.handle}/marketing`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Marketing
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-neutral-100">
              {auction.title}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusBadge}`}
            >
              {auction.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Marketing activity for this listing. Totals are from tracked page
            views and share actions only.
          </p>
        </div>
        <Link
          href={`/auctions/${auction.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:border-[#ff3b5c]/30 hover:text-neutral-50"
        >
          View public listing
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpi.map(({ label, value, icon: Icon, isText }) => (
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
                <p
                  className={`truncate font-semibold text-neutral-100 ${isText ? "text-base" : "text-2xl"}`}
                >
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-100">
            Traffic source
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How visitors arrived (best-effort from UTM and referrer).
          </p>
          <ul className="mt-4 space-y-4">
            {detail.bySource.map(({ source, count }) => (
              <li key={source}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-300">
                    {marketingSourceLabel(source)}
                  </span>
                  <span className="shrink-0 font-medium text-neutral-100">
                    {count}
                  </span>
                </div>
                <ProportionBar value={count} max={maxSource} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-100">
            Event type
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Counts by recorded event type.
          </p>
          <ul className="mt-4 space-y-4">
            {detail.byEventType.map(({ eventType, count }) => (
              <li key={eventType}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-300">
                    {marketingEventTypeLabel(eventType)}
                  </span>
                  <span className="shrink-0 font-medium text-neutral-100">
                    {count}
                  </span>
                </div>
                <ProportionBar value={count} max={maxEvent} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {detail.shareTargetCounts.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-100">
            Share actions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Which share paths were used (when tracked).
          </p>
          <ul className="mt-4 max-w-xl space-y-3">
            {detail.shareTargetCounts.map(({ target, count }) => (
              <li key={target}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-neutral-300">
                    {shareTargetLabel(target)}
                  </span>
                  <span className="font-medium text-neutral-100">{count}</span>
                </div>
                <ProportionBar value={count} max={maxShareTarget} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="font-display text-lg font-semibold text-neutral-100">
          Recent activity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest tracked events (newest first).
        </p>
        {detail.recentEvents.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="font-medium text-neutral-200">No activity yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Views and shares will appear after visitors open or share this
              listing (with marketing tracking enabled).
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {detail.recentEvents.map((row) => (
                  <tr key={row.id} className="text-neutral-300">
                    <td className="py-3 pr-4 whitespace-nowrap text-neutral-400">
                      {formatMarketingDateTime(row.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      {marketingEventTypeLabel(row.eventType)}
                    </td>
                    <td className="py-3 pr-4">
                      {marketingSourceLabel(row.source)}
                    </td>
                    <td className="py-3 text-neutral-500">
                      {row.shareTarget
                        ? shareTargetLabel(row.shareTarget)
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
