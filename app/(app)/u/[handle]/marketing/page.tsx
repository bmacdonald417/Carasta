import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Megaphone, Gavel, Radio, Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getSellerMarketingOverview } from "@/lib/marketing/get-seller-marketing-overview";
import { getSellerMarketingListings } from "@/lib/marketing/get-seller-marketing-listings";
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
  const listings = await getSellerMarketingListings(user.id);

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
      hint: "Tracked impressions & actions (coming soon)",
    },
    {
      label: "Active Campaigns",
      value: overview.activeCampaigns,
      icon: Target,
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
            Track auction reach, promotion performance, and campaign activity.
            Detailed analytics and tracking will appear here as you promote
            your listings.
          </p>
        </div>
        <Link
          href={`/u/${user.handle}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← @{user.handle}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            Per-listing marketing tools will roll out in the next phase. For now,
            open any listing to share it from the auction page.
        </p>

        {listings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-14 text-center">
            <p className="font-medium text-neutral-200">No listings yet</p>
            <p className="mt-2 text-sm text-neutral-500">
              Create your first auction from Sell — then you&apos;ll manage
              promotion from here.
            </p>
            <Button className="mt-6" asChild variant="secondary">
              <Link href="/sell">Start selling</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((a) => (
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
                    <Button variant="secondary" size="sm" disabled title="Coming soon">
                      View marketing
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
