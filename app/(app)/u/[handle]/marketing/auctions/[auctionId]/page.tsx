import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Hand,
  MousePointerClick,
  Radio,
  Timer,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerMarketingAuctionDetail } from "@/lib/marketing/get-seller-marketing-auction-detail";
import {
  formatMarketingDate,
  formatMarketingDateTime,
  marketingBidUiSurfaceLabel,
  marketingEventTypeLabel,
  marketingSourceLabel,
  shareTargetLabel,
} from "@/lib/marketing/marketing-display";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";
import { buildMarketingLinkKit } from "@/lib/marketing/build-marketing-links";
import { generateCarmunityDraft } from "@/lib/marketing/generate-carmunity-draft";
import { getMarketingPresetsForUser } from "@/lib/marketing/get-seller-marketing-presets";
import {
  buildPresetBundlesForAuction,
  buildSharePromoteBundle,
} from "@/lib/marketing/build-share-promote-bundle";
import { ShareAndPromotePanel } from "@/components/marketing/share-and-promote-panel";
import { CarmunityPromoPanel } from "@/components/marketing/carmunity-promo-panel";
import { AuctionLinkedPromoPostsSection } from "@/components/marketing/auction-linked-promo-posts";
import { MarketingAlertsPanel } from "@/components/marketing/marketing-alerts-panel";
import { ensureSellerMarketingNotifications } from "@/lib/marketing/generate-marketing-notifications";
import { getSellerMarketingNotifications } from "@/lib/marketing/get-seller-marketing-notifications";
import { getAuctionCampaignsForSeller } from "@/lib/marketing/get-seller-campaigns";
import { CampaignStatusBadge } from "@/components/marketing/campaign-status-badge";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { Button } from "@/components/ui/button";
import { MarketingCampaignStatus, MarketingTrafficEventType } from "@prisma/client";
import { serializeWorkspacePlan } from "@/lib/marketing/listing-marketing-workspace-serialize";
import { SellerMarketingWorkspace } from "@/components/marketing/seller-marketing-workspace";
import { HashScrollIntoView } from "@/components/marketing/hash-scroll-into-view";
import { MarketingAuctionStickyNav } from "@/components/marketing/marketing-auction-sticky-nav";
import { buildMarketingCopilotIntakeMetricsFromDetail } from "@/lib/marketing/marketing-copilot-intake-metrics";
import { ScrollMarketingSectionIntoView } from "@/components/marketing/scroll-marketing-section-into-view";
import {
  firstSearchParamValue,
  parseSharePresetQueryParam,
} from "@/lib/marketing/resolve-share-preset-query";

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
  searchParams,
}: {
  params: Promise<{ handle: string; auctionId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

  await ensureSellerMarketingNotifications(user.id, user.handle);

  const [
    detail,
    auctionCampaigns,
    presets,
    marketingAlertRows,
    listingWorkspacePlan,
    listingExtra,
  ] = await Promise.all([
    getSellerMarketingAuctionDetail(auctionId, user.id),
    getAuctionCampaignsForSeller(user.id, auctionId),
    getMarketingPresetsForUser(user.id),
    getSellerMarketingNotifications(user.id, 24),
    prisma.listingMarketingPlan.findUnique({
      where: { auctionId },
      include: {
        tasks: { orderBy: { sortOrder: "asc" } },
        artifacts: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    }),
    prisma.auction.findFirst({
      where: { id: auctionId, sellerId: user.id },
      select: { description: true, conditionSummary: true },
    }),
  ]);
  if (!detail) notFound();

  const { auction } = detail;
  const auctionMarketingAlerts = marketingAlertRows.filter(
    (n) =>
      n.auctionId === auctionId ||
      (n.marketingHref?.includes(auctionId) ?? false)
  );
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

  const origin = getPublicSiteOrigin();
  const linkKit = buildMarketingLinkKit(auction.id, origin);

  const shareAuctionInput = {
    title: auction.title,
    year: auction.year,
    make: auction.make,
    model: auction.model,
    trim: auction.trim,
    mileage: auction.mileage,
    status: auction.status,
    endAt: auction.endAt,
    highBidCents: auction.highBidCents,
  };

  const { linkRows: defaultLinkRows, copyPack: defaultCopyPack } =
    buildSharePromoteBundle(auction.id, shareAuctionInput, origin, null);
  const defaultBundle = {
    linkRows: defaultLinkRows,
    copyPack: defaultCopyPack,
  };
  const presetBundles = buildPresetBundlesForAuction(
    auction.id,
    shareAuctionInput,
    origin,
    presets
  );

  const sp = searchParams != null ? await searchParams : {};
  const rawPresetId = firstSearchParamValue(sp, "presetId");
  const validPresetIds = new Set(presets.map((p) => p.id));
  const initialSharePresetSelection = parseSharePresetQueryParam(rawPresetId, validPresetIds);
  const scrollSharePromoteIntoView = initialSharePresetSelection != null;

  const carmunityDraft = generateCarmunityDraft({
    auction: {
      title: auction.title,
      year: auction.year,
      make: auction.make,
      model: auction.model,
      trim: auction.trim,
      mileage: auction.mileage,
      status: auction.status,
      endAt: auction.endAt,
      highBidCents: auction.highBidCents,
    },
    links: linkKit,
    primaryImageUrl: auction.primaryImageUrl,
  });

  const kpiTotals = [
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
      label: "Bid clicks",
      value: detail.totalBidClicks,
      icon: Hand,
    },
  ];

  const kpiWindows = [
    {
      label: "Bid clicks (24h)",
      value: detail.bidClicksLast24h,
      icon: Timer,
    },
    {
      label: "Bid clicks (7d)",
      value: detail.bidClicksLast7d,
      icon: CalendarDays,
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
  ];

  const initialWorkspacePlan = listingWorkspacePlan
    ? serializeWorkspacePlan(listingWorkspacePlan)
    : null;

  const listingCapsule = {
    title: auction.title,
    year: auction.year,
    make: auction.make,
    model: auction.model,
    trim: auction.trim,
    mileage: auction.mileage,
    status: auction.status,
    description: listingExtra?.description ?? null,
    conditionSummary: listingExtra?.conditionSummary ?? null,
    sellerHandle: user.handle,
  };

  const copilotConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
  const copilotIntakeMetrics = buildMarketingCopilotIntakeMetricsFromDetail(detail);

  const kpiActivity = [
    {
      label: "Last activity",
      value: formatMarketingDate(detail.lastMarketingActivityAt),
      icon: Clock,
      isText: true,
    },
  ];

  return (
    <div className="carasta-container max-w-6xl py-8">
      <HashScrollIntoView elementId="marketing-ai-copilot" hash="#marketing-ai-copilot" />
      <HashScrollIntoView elementId="marketing-share-promote" hash="#marketing-share-promote" />
      <ScrollMarketingSectionIntoView
        elementId="marketing-share-promote"
        active={scrollSharePromoteIntoView}
      />
      <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <Link
            href={`/u/${user.handle}/marketing`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
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
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Views, shares, and bid-button intent for this listing (not completed
            bids).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a
                href={`/api/u/${user.handle}/marketing/export/auctions/${auction.id}`}
                download
                title="Download this listing’s marketing data as CSV"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Export CSV
              </a>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link
                href={`/auctions/${auction.id}`}
                className="inline-flex items-center gap-2"
              >
                View public listing
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <MarketingAuctionStickyNav />

      <section id="marketing-overview" className="scroll-mt-32 space-y-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Totals
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {kpiTotals.map(({ label, value, icon: Icon }) => (
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
                    <p className="text-2xl font-semibold text-neutral-100">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Recent windows
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpiWindows.map(({ label, value, icon: Icon }) => (
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
                    <p className="text-2xl font-semibold text-neutral-100">
                      {value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Activity
          </p>
          <div className="grid max-w-md gap-4">
            {kpiActivity.map(({ label, value, icon: Icon, isText }) => (
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
        </div>
      </section>

      <section id="marketing-alerts" className="scroll-mt-32 mt-8">
        <MarketingAlertsPanel
          items={auctionMarketingAlerts.slice(0, 6)}
          compact
          context="auction"
        />
      </section>

      <SellerMarketingWorkspace
        key={auction.id}
        auctionId={auction.id}
        initialPlan={initialWorkspacePlan}
        listingCapsule={listingCapsule}
        copilotConfigured={copilotConfigured}
        copilotIntakeMetrics={copilotIntakeMetrics}
      />

      <section id="marketing-share-promote" className="scroll-mt-32 mt-10">
        <ShareAndPromotePanel
          defaultBundle={defaultBundle}
          presetBundles={presetBundles}
          managePresetsHref={`/u/${user.handle}/marketing/presets`}
          initialSharePresetSelection={initialSharePresetSelection}
        />
      </section>

      <section id="marketing-carmunity" className="scroll-mt-32 mt-10">
        <CarmunityPromoPanel
          handle={user.handle}
          auctionId={auction.id}
          draft={carmunityDraft}
          displayName={user.name}
          avatarUrl={user.avatarUrl ?? user.image}
        />
      </section>

      <section id="marketing-promo-posts" className="scroll-mt-32 mt-10">
        <AuctionLinkedPromoPostsSection posts={detail.linkedPromoPosts} />
      </section>

      <section
        id="marketing-campaigns"
        className="scroll-mt-32 mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              Campaigns · this listing
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Outreach notes tied to this auction.
            </p>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link
              href={`/u/${user.handle}/marketing/campaigns/new?auctionId=${auction.id}`}
            >
              New campaign
            </Link>
          </Button>
        </div>
        {auctionCampaigns.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/20 px-5 py-10 text-center">
            <p className="text-sm text-neutral-400">
              No campaigns for this listing
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Add one to log dates and status alongside Share &amp; Promote.
            </p>
            <Button className="mt-4" asChild size="sm" variant="outline">
              <Link
                href={`/u/${user.handle}/marketing/campaigns/new?auctionId=${auction.id}`}
              >
                New campaign
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {auctionCampaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-100">{c.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {campaignTypeLabel(c.type)}
                    {(c.startAt || c.endAt) && (
                      <>
                        {" · "}
                        {c.startAt
                          ? formatMarketingDate(c.startAt)
                          : "—"} →{" "}
                        {c.endAt ? formatMarketingDate(c.endAt) : "—"}
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CampaignStatusBadge
                    status={c.status as MarketingCampaignStatus}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/u/${user.handle}/marketing/campaigns/${c.id}/edit`}
                    >
                      Edit
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-neutral-500">
          <Link
            href={`/u/${user.handle}/marketing/campaigns`}
            className="font-medium text-[#ff3b5c]/90 hover:underline"
          >
            Manage Campaigns
          </Link>
        </p>
      </section>

      <section id="marketing-analytics" className="scroll-mt-32 mt-10 space-y-8">
        <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="font-display text-lg font-semibold text-neutral-100">
            Traffic sources
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Best-effort from UTM and referrer signals.
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
            Event types
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Volume by tracked event type.
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
            Share targets when we could record them.
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
      </section>

      <section
        id="marketing-activity"
        className="scroll-mt-32 mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
      >
        <h2 className="font-display text-lg font-semibold text-neutral-100">
          Recent activity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Newest events first (up to 50).
        </p>
        {detail.recentEvents.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-white/15 bg-black/20 px-6 py-12 text-center">
            <p className="font-medium text-neutral-200">No activity yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Traffic will show here once visitors view, share, or tap bid on
              the public listing.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Event</th>
                  <th className="pb-3 pr-4">Source</th>
                  <th className="pb-3">Detail</th>
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
                      {row.eventType === MarketingTrafficEventType.SHARE_CLICK &&
                      row.shareTarget
                        ? shareTargetLabel(row.shareTarget)
                        : row.eventType === MarketingTrafficEventType.BID_CLICK &&
                            row.bidUiSurface
                          ? marketingBidUiSurfaceLabel(row.bidUiSurface)
                          : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
