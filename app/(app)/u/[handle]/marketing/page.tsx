import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, Megaphone, Gavel, Radio, Share2, Target } from "lucide-react";
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
      hint: "All tracked views and share actions",
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-neutral-100">
          Your Listings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Views and share clicks are shown per listing. Use View marketing for
          sources, timelines, and recent events.
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
                    share clicks
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
