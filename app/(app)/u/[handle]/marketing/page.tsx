import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, Hand, Megaphone, Gavel, Radio, Share2, Target } from "lucide-react";
import { MarketingCampaignStatus } from "@prisma/client";
import { getRecentSellerCampaigns } from "@/lib/marketing/get-seller-campaigns";
import { CampaignStatusBadge } from "@/components/marketing/campaign-status-badge";
import { campaignTypeLabel } from "@/components/marketing/campaign-type-label";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerMarketingOverview } from "@/lib/marketing/get-seller-marketing-overview";
import { getSellerMarketingAuctionRows } from "@/lib/marketing/get-seller-marketing-auction-rows";
import { formatMarketingDate } from "@/lib/marketing/marketing-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

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
  const isOwn = (session?.user as any)?.id === user.id;
  if (!isOwn) notFound();

  const overview = await getSellerMarketingOverview(user.id);
  const rows = await getSellerMarketingAuctionRows(user.id);
  const recentCampaigns = await getRecentSellerCampaigns(user.id, 6);

  const statCards = [
    {
      label: "Total Listings",
      value: overview.totalListings,
      icon: Gavel,
    },
    {
      label: "Live Auctions",
      value: overview.liveAuctions,
      icon: Radio,
    },
    {
      label: "Marketing Events",
      value: overview.marketingEvents,
      icon: Megaphone,
      hint: "Views, shares, bid intent, and other tracked events",
    },
    {
      label: "Active Campaigns",
      value: overview.activeCampaigns,
      icon: Target,
    },
    {
      label: "Total Views",
      value: overview.totalViews,
      icon: Eye,
    },
    {
      label: "Share Clicks",
      value: overview.totalShareClicks,
      icon: Share2,
    },
    {
      label: "Bid Clicks",
      value: overview.totalBidClicks,
      icon: Hand,
      hint: "Bid button intent (not successful bids)",
    },
  ];

  return (
    <div className="carasta-container max-w-6xl py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-neutral-100">
            Marketing
          </h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            See listing reach and promotion activity from tracked page views and
            shares. Open a listing below for a detailed breakdown.
          </p>
        </div>
        <Link
          href={`/u/${user.handle}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← @{user.handle}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, hint }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#ff3b5c]/20 p-2">
                <Icon className="h-5 w-5 text-[#ff3b5c]" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{label}</p>
                <p className="text-2xl font-semibold text-neutral-100">{value}</p>
              </div>
            </div>
            {hint ? (
              <p className="mt-3 text-xs text-neutral-500">{hint}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
        <div>
          <p className="font-medium text-neutral-200">
            Share &amp; Promote presets
          </p>
          <p className="mt-0.5 text-sm text-neutral-500">
            Save UTM campaign labels and copy options to reuse on listing
            marketing pages.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/u/${user.handle}/marketing/presets`}>
            Manage presets
          </Link>
        </Button>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              Campaigns
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Group promotion work by listing — manual tracking only.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/u/${user.handle}/marketing/campaigns`}>
              Manage campaigns
            </Link>
          </Button>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-10 text-center">
            <p className="text-sm text-neutral-400">No campaigns yet</p>
            <Button className="mt-4" asChild variant="secondary" size="sm">
              <Link href={`/u/${user.handle}/marketing/campaigns/new`}>
                Create a campaign
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.04] text-xs font-medium uppercase tracking-wider text-neutral-500">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Listing</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentCampaigns.map((c) => (
                  <tr key={c.id} className="text-neutral-300">
                    <td className="px-4 py-3 font-medium text-neutral-100">
                      {c.name}
                    </td>
                    <td className="max-w-[140px] truncate px-4 py-3 text-neutral-500">
                      {c.auctionTitle}
                    </td>
                    <td className="px-4 py-3">{campaignTypeLabel(c.type)}</td>
                    <td className="px-4 py-3">
                      <CampaignStatusBadge
                        status={c.status as MarketingCampaignStatus}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
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
                          Marketing
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-neutral-100">
          Your Listings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
            Views, share clicks, and bid intent are shown per listing. Open View
            marketing for sources, timelines, and recent events.
        </p>

        {rows.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
            <p className="font-medium text-neutral-200">No listings yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Create your first auction from Sell — then you&apos;ll see metrics
              here after visitors view or share your page.
            </p>
            <Button className="mt-6" asChild variant="secondary">
              <Link href="/sell">Start selling</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((a) => (
              <Card
                key={a.id}
                className="overflow-hidden border-white/10 bg-white/5 transition-all"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={
                      a.imageUrl ??
                      "https://placehold.co/600x400/1a1a1a/666?text=No+image"
                    }
                    alt={a.title}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute left-3 top-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        a.status === "LIVE"
                          ? "border border-[#ff3b5c]/50 bg-[#ff3b5c]/90 text-white"
                          : a.status === "SOLD"
                            ? "border border-green-500/50 bg-green-500/20 text-green-400"
                            : a.status === "DRAFT"
                              ? "border border-neutral-500/50 bg-neutral-500/20 text-neutral-400"
                              : "border border-neutral-500/50 bg-neutral-500/20 text-neutral-400"
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                </div>
                <CardContent className="border-t border-white/5 p-4">
                  <p className="text-xs text-neutral-500">
                    {a.year} {a.make} {a.model}
                  </p>
                  <h3 className="mt-1 font-display font-semibold line-clamp-1 text-neutral-100">
                    {a.title}
                  </h3>
                  <p className="mt-2 text-xs text-neutral-500">
                    <span className="text-neutral-300">{a.totalViews}</span>{" "}
                    views ·{" "}
                    <span className="text-neutral-300">
                      {a.totalShareClicks}
                    </span>{" "}
                    shares ·{" "}
                    <span className="text-neutral-300">{a.totalBidClicks}</span>{" "}
                    bid clicks
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Last activity:{" "}
                    {formatMarketingDate(a.lastMarketingActivityAt)}
                  </p>
                  {a.status === "LIVE" && (
                    <p className="mt-2 text-sm text-[#ff3b5c]">
                      {formatCurrency(a.highBidCents)} high bid
                      <span className="ml-1 text-neutral-500">
                        · {a.bidCount} bids
                      </span>
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/auctions/${a.id}`}>View listing</Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/u/${user.handle}/marketing/auctions/${a.id}`}>
                        View marketing
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
