import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Download,
  Eye,
  Hand,
  Lightbulb,
  Megaphone,
  Gavel,
  Radio,
  Share2,
  Sparkles,
  Target,
} from "lucide-react";
import { MarketingCampaignStatus } from "@prisma/client";
import { getRecentSellerCampaigns } from "@/lib/marketing/get-seller-campaigns";
import { CampaignStatusBadge } from "@/components/marketing/campaign-status-badge";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerMarketingOverview } from "@/lib/marketing/get-seller-marketing-overview";
import { getSellerMarketingAuctionRows } from "@/lib/marketing/get-seller-marketing-auction-rows";
import { ensureSellerMarketingNotifications } from "@/lib/marketing/generate-marketing-notifications";
import { getSellerMarketingNotifications } from "@/lib/marketing/get-seller-marketing-notifications";
import { getMarketingPresetsForUser } from "@/lib/marketing/get-seller-marketing-presets";
import { formatMarketingDate } from "@/lib/marketing/marketing-display";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { MarketingAlertsPanel } from "@/components/marketing/marketing-alerts-panel";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  SellerInsightCard,
  SellerKpiCard,
  SellerSectionPanel,
  SellerStatusBadge,
  SellerWorkspaceShell,
} from "@/components/marketing/seller-workspace-primitives";

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  const isOwn = (session?.user as { id?: string } | undefined)?.id === user.id;
  if (!isOwn) notFound();

  await ensureSellerMarketingNotifications(user.id, user.handle);
  const [overview, rows, recentCampaigns, marketingAlerts, marketingPresets] = await Promise.all([
    getSellerMarketingOverview(user.id),
    getSellerMarketingAuctionRows(user.id),
    getRecentSellerCampaigns(user.id, 6),
    getSellerMarketingNotifications(user.id, 10),
    getMarketingPresetsForUser(user.id),
  ]);

  const defaultPresetForShare =
    marketingPresets.find((p) => p.isDefault) ?? marketingPresets[0] ?? null;

  const inventoryCards = [
    {
      label: "Total listings",
      value: overview.totalListings,
      icon: Gavel,
    },
    {
      label: "Live auctions",
      value: overview.liveAuctions,
      icon: Radio,
    },
    {
      label: "Active campaigns",
      value: overview.activeCampaigns,
      icon: Target,
    },
  ];

  const engagementCards = [
    {
      label: "Marketing events",
      value: overview.marketingEvents,
      icon: Megaphone,
      hint: "Views, shares, bid intent — all tracked events",
    },
    {
      label: "Total views",
      value: overview.totalViews,
      icon: Eye,
    },
    {
      label: "Share clicks",
      value: overview.totalShareClicks,
      icon: Share2,
    },
    {
      label: "Bid clicks",
      value: overview.totalBidClicks,
      icon: Hand,
      hint: "Bid button taps (not completed bids)",
    },
  ];

  const healthyListings = rows.filter(
    (row) => row.totalViews >= 25 || row.totalBidClicks >= 3 || row.totalShareClicks >= 2
  ).length;
  const atRiskListings = rows.filter(
    (row) =>
      row.status === "LIVE" &&
      row.totalViews < 20 &&
      row.totalBidClicks === 0 &&
      row.totalShareClicks < 2
  ).length;

  const priorityItems = rows
    .filter((row) => row.status === "LIVE")
    .map((row) => {
      const hoursRemaining = Math.max(
        0,
        Math.round((row.endAt.getTime() - Date.now()) / (1000 * 60 * 60))
      );
      const lowTraction =
        row.totalViews < 20 && row.totalBidClicks === 0 && row.totalShareClicks < 2;
      const momentum =
        row.totalBidClicks >= 3 || row.totalShareClicks >= 4 || row.totalViews >= 80;

      if (hoursRemaining <= 24 && lowTraction) {
        return {
          id: row.id,
          title: `${row.title} needs a late push`,
          body: `Auction closes in about ${hoursRemaining || 1} hour(s) with low visible traction. Prioritize a tighter share cycle and seller CTA now.`,
          tone: "urgency" as const,
          href: `/u/${user.handle}/marketing/auctions/${row.id}#marketing-share-promote`,
          cta: "Open share plan",
        };
      }
      if (momentum) {
        return {
          id: row.id,
          title: `${row.title} has active momentum`,
          body: `This listing is already seeing stronger engagement. Use the workspace to reinforce what is working instead of changing everything at once.`,
          tone: "success" as const,
          href: `/u/${user.handle}/marketing/auctions/${row.id}`,
          cta: "Review momentum",
        };
      }
      return {
        id: row.id,
        title: `${row.title} needs a clearer next action`,
        body: `Open the listing workspace to tighten positioning, checklist coverage, and promotion timing from one place.`,
        tone: "info" as const,
        href: `/u/${user.handle}/marketing/auctions/${row.id}`,
        cta: "Open workspace",
      };
    })
    .slice(0, 3);

  const recentCampaignActivity = recentCampaigns.slice(0, 4);

  return (
    <SellerWorkspaceShell>
      <div className="carasta-container max-w-7xl py-8 md:py-10">
        <section className="rounded-2xl border border-border bg-card bg-gradient-to-br from-card via-card to-info-soft/20 p-6 shadow-e1 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <SellerStatusBadge label="Seller growth workspace" tone="info" />
                <SellerStatusBadge
                  label={`${overview.liveAuctions} live`}
                  tone={overview.liveAuctions > 0 ? "success" : "neutral"}
                />
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--seller-foreground))] md:text-4xl">
                Marketing command center
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[hsl(var(--seller-muted))]">
                This workspace is now organized around what needs attention,
                what is healthy, and what to do next across your listings. The
                underlying campaigns, AI copilot, alerts, exports, and per-listing
                drill-downs are preserved.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  href={`/u/${user.handle}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Back to profile
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Settings → Email
                </Link>
              </div>
              <ContextualHelpCard context="seller.marketing" className="mt-6 max-w-xl" />
            </div>
            <div className="grid gap-3 sm:min-w-[280px]">
              <div className="rounded-[1.5rem] border border-[hsl(var(--seller-info))]/15 bg-[hsl(var(--seller-info-soft))] p-4">
                <p className="text-sm font-semibold text-[hsl(var(--seller-info-foreground))]">
                  AI copilot access
                </p>
                <p className="mt-2 text-sm leading-6 text-[hsl(var(--seller-info-foreground))]">
                  Jump into a listing to generate strategy, checklist, and draft
                  content. Nothing auto-posts.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--seller-muted))]">
                  Default preset
                </p>
                <p className="mt-2 text-sm text-[hsl(var(--seller-foreground))]">
                  {defaultPresetForShare
                    ? `${defaultPresetForShare.name} is ready for share links and copy reuse.`
                    : "No default share preset yet. Set one up to make listing promotion faster."}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          {inventoryCards.map(({ label, value, icon: Icon }) => (
            <div key={label} className="xl:col-span-1">
              <SellerKpiCard label={label} value={value} icon={Icon} tone="info" />
            </div>
          ))}
          {engagementCards.map(({ label, value, icon: Icon, hint }) => (
            <div key={label} className="xl:col-span-1">
              <SellerKpiCard
                label={label}
                value={value}
                icon={Icon}
                tone={label === "Bid clicks" ? "success" : "neutral"}
                detail={hint}
              />
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <SellerSectionPanel
            title="Priority queue"
            description="The strongest candidates for action now, based on current listing state and visible traction."
            tone="info"
          >
            {priorityItems.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {priorityItems.map((item) => (
                  <SellerInsightCard
                    key={item.id}
                    title={item.title}
                    body={item.body}
                    tone={item.tone}
                    ctaHref={item.href}
                    ctaLabel={item.cta}
                    icon={item.tone === "urgency" ? Lightbulb : Sparkles}
                  />
                ))}
              </div>
            ) : (
              <SellerInsightCard
                title="No immediate priority spikes"
                body="The overview is not seeing a clear urgent issue right now. Use alerts and per-listing drill-downs for the next layer of detail."
                tone="success"
                icon={Sparkles}
              />
            )}
          </SellerSectionPanel>

          <SellerSectionPanel
            title="Portfolio health"
            description="A quick read on portfolio state before you open a specific listing workspace."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SellerInsightCard
                title={`${healthyListings} listing${healthyListings === 1 ? "" : "s"} showing healthier traction`}
                body="These listings have enough visible activity to justify a momentum-preserving approach rather than a full rewrite."
                tone="success"
                icon={Target}
              />
              <SellerInsightCard
                title={`${atRiskListings} live listing${atRiskListings === 1 ? "" : "s"} may need intervention`}
                body="Low-traction live auctions are where tighter share timing, stronger copy, or AI-assisted planning matter most."
                tone={atRiskListings > 0 ? "caution" : "neutral"}
                icon={Lightbulb}
              />
            </div>
          </SellerSectionPanel>
        </section>

        <div className="mt-8">
          <MarketingAlertsPanel items={marketingAlerts} />
        </div>

        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
          <SellerSectionPanel
            title="Campaign command"
            description="Campaign tracking stays intact, but the overview now treats it as execution infrastructure rather than the first thing sellers see."
            actions={
              <>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`/api/u/${user.handle}/marketing/export/campaigns`}
                    download
                    title="Download campaigns as CSV"
                  >
                    <Download className="mr-2 h-3.5 w-3.5" />
                    Export CSV
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/u/${user.handle}/marketing/campaigns`}>
                    Manage Campaigns
                  </Link>
                </Button>
              </>
            }
          >
            {recentCampaigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-5 py-12 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <Target className="h-5 w-5 text-slate-600" aria-hidden />
                </div>
                <p className="mt-3 text-sm font-medium text-[hsl(var(--seller-foreground))]">
                  No campaigns yet
                </p>
                <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
                  Track outreach alongside Share &amp; Promote on each listing.
                </p>
                <Button className="mt-5" asChild variant="secondary" size="sm">
                  <Link href={`/u/${user.handle}/marketing/campaigns/new`}>
                    New campaign
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] text-xs font-medium uppercase tracking-[0.16em] text-[hsl(var(--seller-muted))]">
                      <th className="px-4 py-3">Campaign</th>
                      <th className="px-4 py-3">Listing</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {recentCampaigns.map((c) => (
                      <tr key={c.id} className="text-[hsl(var(--seller-foreground))]">
                        <td className="px-4 py-3 font-medium">{c.name}</td>
                        <td className="max-w-[160px] truncate px-4 py-3 text-[hsl(var(--seller-muted))]">
                          {c.auctionTitle}
                        </td>
                        <td className="px-4 py-3 text-[hsl(var(--seller-muted))]">
                          {campaignTypeLabel(c.type)}
                        </td>
                        <td className="px-4 py-3">
                          <CampaignStatusBadge
                            status={c.status as MarketingCampaignStatus}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/u/${user.handle}/marketing/campaigns/${c.id}/edit`}
                              >
                                Edit
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/u/${user.handle}/marketing/auctions/${c.auctionId}`}
                              >
                                Open workspace
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SellerSectionPanel>

          <SellerSectionPanel
            title="Recent campaign activity"
            description="What changed most recently across your campaign work."
          >
            {recentCampaignActivity.length > 0 ? (
              <ul className="space-y-3">
                {recentCampaignActivity.map((campaign) => (
                  <li
                    key={campaign.id}
                    className="rounded-xl border border-border bg-muted/40 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[hsl(var(--seller-foreground))]">
                          {campaign.name}
                        </p>
                        <p className="mt-1 text-xs text-[hsl(var(--seller-muted))]">
                          {campaign.auctionTitle} · updated{" "}
                          {formatMarketingDate(campaign.updatedAt)}
                        </p>
                      </div>
                      <CampaignStatusBadge
                        status={campaign.status as MarketingCampaignStatus}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--seller-muted))]">
                Campaign changes will appear here once you start tracking outreach.
              </p>
            )}
          </SellerSectionPanel>
        </section>

        <SellerSectionPanel
          title="Listing workspaces"
          description="Each listing now acts more like a managed active campaign workspace. Open one when you need performance context, AI help, share/promote, or detailed activity."
          actions={
            rows.length > 0 ? (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`/api/u/${user.handle}/marketing/export/auctions`}
                  download
                  title="Download listings as CSV"
                >
                  <Download className="mr-2 h-3.5 w-3.5" />
                  Export CSV
                </a>
              </Button>
            ) : undefined
          }
          className="mt-8"
        >
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                <Gavel className="h-5 w-5 text-slate-600" aria-hidden />
              </div>
              <p className="mt-3 font-medium text-[hsl(var(--seller-foreground))]">
                No listings yet
              </p>
              <p className="mt-2 text-sm text-[hsl(var(--seller-muted))]">
                List something from Sell and the workspace will start tracking
                views, shares, bid intent, and execution context.
              </p>
              <Button className="mt-6" asChild variant="secondary">
                <Link href="/sell">Go to Sell</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((a) => {
                const tone =
                  a.status === "LIVE"
                    ? a.totalBidClicks >= 3
                      ? "success"
                      : a.totalViews < 20 && a.totalShareClicks < 2
                        ? "caution"
                        : "info"
                    : a.status === "SOLD"
                      ? "success"
                      : "neutral";

                return (
                  <article
                    key={a.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card shadow-e1 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-e2"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={
                          a.imageUrl ??
                          "https://placehold.co/600x400/e8ebf1/6b7280?text=No+image"
                        }
                        alt={a.title}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute left-4 top-4">
                        <SellerStatusBadge label={a.status} tone={tone} />
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-[hsl(var(--seller-muted))]">
                        {a.year} {a.make} {a.model}
                      </p>
                      <h3 className="mt-1 line-clamp-1 text-xl font-semibold tracking-tight text-[hsl(var(--seller-foreground))]">
                        {a.title}
                      </h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-[hsl(var(--seller-panel-muted))] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--seller-muted))]">
                            Views
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
                            {a.totalViews}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[hsl(var(--seller-panel-muted))] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--seller-muted))]">
                            Shares
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
                            {a.totalShareClicks}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[hsl(var(--seller-panel-muted))] px-3 py-3">
                          <p className="text-[11px] uppercase tracking-[0.15em] text-[hsl(var(--seller-muted))]">
                            Bid taps
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[hsl(var(--seller-foreground))]">
                            {a.totalBidClicks}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-[hsl(var(--seller-muted))]">
                        Last activity {formatMarketingDate(a.lastMarketingActivityAt)}
                      </p>
                      {a.status === "LIVE" ? (
                        <p className="mt-2 text-sm font-medium text-[hsl(var(--seller-info-foreground))]">
                          {formatCurrency(a.highBidCents)} high bid
                          <span className="ml-2 text-[hsl(var(--seller-muted))]">
                            · {a.bidCount} bids
                          </span>
                        </p>
                      ) : null}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/u/${user.handle}/marketing/auctions/${a.id}`}>
                            Open workspace
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/auctions/${a.id}`}>Public listing</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/u/${user.handle}/marketing/auctions/${a.id}#marketing-ai-copilot`}
                          >
                            AI copilot
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/u/${user.handle}/marketing/auctions/${a.id}#marketing-share-promote`}
                          >
                            Share &amp; Promote
                          </Link>
                        </Button>
                        {defaultPresetForShare ? (
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/u/${user.handle}/marketing/auctions/${a.id}?presetId=${encodeURIComponent(defaultPresetForShare.id)}`}
                            >
                              Share + preset
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </SellerSectionPanel>

        <SellerSectionPanel
          title="Workspace utilities"
          description="Keep your preset library and reusable marketing setup close at hand."
          className="mt-8"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href={`/u/${user.handle}/marketing/presets`}>
                Manage Presets
              </Link>
            </Button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SellerInsightCard
              title="Share & Promote presets"
              body="Saved UTM labels and copy bundles stay reusable across listing pages so sellers can move faster without losing control."
              tone="info"
              icon={Share2}
              ctaHref={`/u/${user.handle}/marketing/presets`}
              ctaLabel="Open presets"
            />
            <SellerInsightCard
              title="AI workflow entry points"
              body="Use the listing-level workspace when you need AI-supported strategy, task generation, or content drafts tied to a specific auction."
              tone="neutral"
              icon={ArrowRight}
            />
          </div>
        </SellerSectionPanel>
      </div>
    </SellerWorkspaceShell>
  );
}
