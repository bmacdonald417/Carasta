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
  Lightbulb,
  MousePointerClick,
  Radio,
  Sparkles,
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
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";
import {
  SellerInsightCard,
  SellerKpiCard,
  SellerMicroBar,
  SellerSectionPanel,
  SellerStatusBadge,
  SellerTone,
  SellerWorkspaceShell,
} from "@/components/marketing/seller-workspace-primitives";

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
  const reviewCtx = isReviewModeEnabled() ? await getReviewModeContext() : null;
  const isOwn =
    (session?.user as any)?.id === user.id ||
    (reviewCtx?.sellerUserId === user.id && reviewCtx?.sellerHandle === handle.toLowerCase());
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

  const statusTone: SellerTone =
    auction.status === "LIVE"
      ? detail.bidClicksLast24h > 0 || detail.viewsLast24h > 10
        ? "success"
        : "caution"
      : auction.status === "SOLD"
        ? "success"
        : "neutral";

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

  const endsInHours = Math.max(
    0,
    Math.round((auction.endAt.getTime() - Date.now()) / (1000 * 60 * 60))
  );
  const listingHealth =
    detail.totalViews >= 80 || detail.totalBidClicks >= 4
      ? "Healthy"
      : detail.totalViews >= 30 || detail.totalShareClicks >= 3
        ? "Building"
        : "Needs attention";
  const momentumSummary =
    detail.bidClicksLast24h > 0 || detail.viewsLast24h > 10
      ? "Momentum is active in the recent window."
      : "Recent traction is quiet — use the next action layer to tighten promotion.";
  const nextActionCards = [
    endsInHours <= 24 && detail.totalBidClicks === 0
      ? {
          title: "Run a late-cycle share push",
          body: `This auction closes in about ${endsInHours || 1} hour(s) and bid intent is still quiet. Prioritize share timing and direct CTA coverage now.`,
          tone: "urgency" as const,
          href: "#marketing-share-promote",
          cta: "Open share plan",
          icon: Lightbulb,
        }
      : null,
    detail.totalShareClicks > detail.totalBidClicks * 2
      ? {
          title: "Translate attention into bid intent",
          body: "Interest is showing up in share activity faster than bid-button taps. Tighten the call to action and use the AI workspace to sharpen urgency language.",
          tone: "info" as const,
          href: "#marketing-ai-copilot",
          cta: "Open AI copilot",
          icon: Sparkles,
        }
      : null,
    {
      title: "Review checklist readiness",
      body: "Use the workspace plan, tasks, and artifacts together so the listing reads like one managed campaign instead of separate modules.",
      tone: "success" as const,
      href: "#marketing-workspace",
      cta: "Open workspace",
      icon: Lightbulb,
    },
  ].filter(Boolean) as Array<{
    title: string;
    body: string;
    tone: SellerTone;
    href: string;
    cta: string;
    icon: typeof Lightbulb;
  }>;

  return (
    <SellerWorkspaceShell>
      <div className="carasta-container max-w-7xl py-8">
      <HashScrollIntoView elementId="marketing-ai-copilot" hash="#marketing-ai-copilot" />
      <HashScrollIntoView elementId="marketing-share-promote" hash="#marketing-share-promote" />
      <ScrollMarketingSectionIntoView
        elementId="marketing-share-promote"
        active={scrollSharePromoteIntoView}
      />
      <section className="rounded-2xl border border-border bg-card bg-gradient-to-br from-card via-card to-info-soft/35 p-6 shadow-e1 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <Link
              href={`/u/${user.handle}/marketing`}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketing
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-[hsl(var(--seller-foreground))] md:text-4xl">
                {auction.title}
              </h1>
              <SellerStatusBadge label={auction.status} tone={statusTone} />
              <SellerStatusBadge label={listingHealth} tone={statusTone} />
            </div>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[hsl(var(--seller-muted))]">
              One listing as a managed campaign workspace. The surface now
              prioritizes status, momentum, next actions, AI support, and
              execution context before long-tail analytics.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
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
          <div className="grid min-w-[280px] gap-3">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--seller-muted))]">
                Auction state
              </p>
              <p className="mt-2 text-sm text-[hsl(var(--seller-foreground))]">
                Ends {formatMarketingDate(auction.endAt)} · {momentumSummary}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--seller-info))]/15 bg-[hsl(var(--seller-info-soft))] p-4">
              <p className="text-sm font-semibold text-[hsl(var(--seller-info-foreground))]">
                Quick action
              </p>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--seller-info-foreground))]">
                Use the share plan, AI copilot, or checklist below to improve
                the campaign without losing existing activity history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MarketingAuctionStickyNav />

      <section id="marketing-overview" className="scroll-mt-32 mt-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          {kpiTotals.map(({ label, value, icon: Icon }) => (
            <SellerKpiCard
              key={label}
              label={label}
              value={value}
              icon={Icon}
              tone={label === "Bid clicks" ? "success" : "info"}
            />
          ))}
          {kpiActivity.map(({ label, value, icon: Icon }) => (
            <SellerKpiCard
              key={label}
              label={label}
              value={value}
              icon={Icon}
              tone="neutral"
            />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiWindows.map(({ label, value, icon: Icon }) => (
            <SellerKpiCard
              key={label}
              label={label}
              value={value}
              icon={Icon}
              tone={label.includes("Bid") ? "success" : "neutral"}
            />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <SellerSectionPanel
            title="Next best actions"
            description="This layer is intentionally ahead of the deeper modules so the workspace helps sellers decide before they start scrolling."
            tone="info"
          >
            <div className="grid gap-4 md:grid-cols-3">
              {nextActionCards.map((item) => (
                <SellerInsightCard
                  key={item.title}
                  title={item.title}
                  body={item.body}
                  tone={item.tone}
                  ctaHref={item.href}
                  ctaLabel={item.cta}
                  icon={item.icon}
                />
              ))}
            </div>
          </SellerSectionPanel>

          <SellerSectionPanel
            title="Health and momentum"
            description="A compact read on whether this listing needs more reach, more urgency, or steadier follow-through."
          >
            <div className="grid gap-4">
              <SellerInsightCard
                title={listingHealth}
                body={momentumSummary}
                tone={statusTone}
                icon={statusTone === "success" ? Sparkles : Lightbulb}
              />
              <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--seller-muted))]">
                  Time pressure
                </p>
                <p className="mt-2 text-sm text-[hsl(var(--seller-foreground))]">
                  {auction.status === "LIVE"
                    ? `Approx. ${endsInHours || 1} hour(s) remaining`
                    : `Listing status is ${auction.status}`}
                </p>
              </div>
            </div>
          </SellerSectionPanel>
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

      <SellerSectionPanel
        id="marketing-campaigns"
        title="Channel plan and campaigns"
        description="Outreach notes tied to this listing. Campaign tracking remains intact, but is now treated as one execution layer inside the broader workspace."
        className="scroll-mt-32 mt-10"
        actions={
          <Button asChild size="sm" variant="secondary">
            <Link
              href={`/u/${user.handle}/marketing/campaigns/new?auctionId=${auction.id}`}
            >
              New campaign
            </Link>
          </Button>
        }
      >
        {auctionCampaigns.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-5 py-10 text-center">
            <p className="text-sm text-[hsl(var(--seller-muted))]">
              No campaigns for this listing
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
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
          <ul className="space-y-3">
            {auctionCampaigns.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[hsl(var(--seller-foreground))]">
                    {c.name}
                  </p>
                  <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
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
        <p className="mt-4 text-xs text-[hsl(var(--seller-muted))]">
          <Link
            href={`/u/${user.handle}/marketing/campaigns`}
            className="font-medium text-[hsl(var(--seller-info-foreground))] hover:underline"
          >
            Manage Campaigns
          </Link>
        </p>
      </SellerSectionPanel>

      <SellerSectionPanel
        id="marketing-analytics"
        title="Campaign log and analytics detail"
        description="Best-effort traffic and interaction breakdowns for diagnosing how attention is moving through this listing."
        className="scroll-mt-32 mt-10"
      >
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-6">
            <h2 className="font-display text-lg font-semibold text-[hsl(var(--seller-foreground))]">
              Traffic sources
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--seller-muted))]">
              Best-effort from UTM and referrer signals.
            </p>
            <ul className="mt-4 space-y-4">
              {detail.bySource.map(({ source, count }) => (
                <li key={source}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[hsl(var(--seller-foreground))]">
                      {marketingSourceLabel(source)}
                    </span>
                    <span className="shrink-0 font-medium text-[hsl(var(--seller-foreground))]">
                      {count}
                    </span>
                  </div>
                  <SellerMicroBar value={count} max={maxSource} tone="info" />
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-6">
            <h2 className="font-display text-lg font-semibold text-[hsl(var(--seller-foreground))]">
              Event types
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--seller-muted))]">
              Volume by tracked event type.
            </p>
            <ul className="mt-4 space-y-4">
              {detail.byEventType.map(({ eventType, count }) => (
                <li key={eventType}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[hsl(var(--seller-foreground))]">
                      {marketingEventTypeLabel(eventType)}
                    </span>
                    <span className="shrink-0 font-medium text-[hsl(var(--seller-foreground))]">
                      {count}
                    </span>
                  </div>
                  <SellerMicroBar value={count} max={maxEvent} tone="info" />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {detail.shareTargetCounts.length > 0 ? (
          <div className="mt-8 rounded-[1.5rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-6">
            <h2 className="font-display text-lg font-semibold text-[hsl(var(--seller-foreground))]">
              Share actions
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--seller-muted))]">
              Share targets when we could record them.
            </p>
            <ul className="mt-4 max-w-xl space-y-3">
              {detail.shareTargetCounts.map(({ target, count }) => (
                <li key={target}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[hsl(var(--seller-foreground))]">
                      {shareTargetLabel(target)}
                    </span>
                    <span className="font-medium text-[hsl(var(--seller-foreground))]">
                      {count}
                    </span>
                  </div>
                  <SellerMicroBar value={count} max={maxShareTarget} tone="success" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </SellerSectionPanel>

      <SellerSectionPanel
        id="marketing-activity"
        title="Activity and audit trail"
        description="Newest events first, up to 50 records."
        className="scroll-mt-32 mt-8"
      >
        {detail.recentEvents.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-6 py-12 text-center">
            <p className="font-medium text-[hsl(var(--seller-foreground))]">
              No activity yet
            </p>
            <p className="mt-2 text-sm text-[hsl(var(--seller-muted))]">
              Traffic will show here once visitors view, share, or tap bid on
              the public listing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[1.5rem] border border-[hsl(var(--seller-border))]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--seller-muted))]">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[hsl(var(--seller-border))] bg-white">
                {detail.recentEvents.map((row) => (
                  <tr key={row.id} className="text-[hsl(var(--seller-foreground))]">
                    <td className="px-4 py-3 whitespace-nowrap text-[hsl(var(--seller-muted))]">
                      {formatMarketingDateTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {marketingEventTypeLabel(row.eventType)}
                    </td>
                    <td className="px-4 py-3">
                      {marketingSourceLabel(row.source)}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--seller-muted))]">
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
      </SellerSectionPanel>
    </div>
    </SellerWorkspaceShell>
  );
}
