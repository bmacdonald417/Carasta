import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ShowroomHero } from "@/components/home/ShowroomHero";
import { AuctionCard } from "@/app/auctions/auction-card";
import { Gavel } from "lucide-react";

async function getFeaturedAuctions() {
  const auctions = await prisma.auction.findMany({
    where: { status: "LIVE" },
    orderBy: { endAt: "asc" },
    take: 5,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      seller: { select: { handle: true } },
    },
  });
  const { getAuctionHighBid } = await import("@/lib/auction-utils");
  const withHighBid = await Promise.all(
    auctions.map(async (a) => ({
      ...a,
      highBidCents: await getAuctionHighBid(a.id),
    }))
  );
  return withHighBid;
}

async function getRecentAuctions() {
  const auctions = await prisma.auction.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      seller: { select: { handle: true } },
    },
  });
  return auctions;
}

export default async function HomePage() {
  let featuredAuctions: Awaited<ReturnType<typeof getFeaturedAuctions>> = [];
  let recentAuctions: Awaited<ReturnType<typeof getRecentAuctions>> = [];
  try {
    [featuredAuctions, recentAuctions] = await Promise.all([
      getFeaturedAuctions(),
      getRecentAuctions(),
    ]);
  } catch {
    // DB may be unavailable at build time
  }

  const featuredForHero = featuredAuctions.map((a) => ({
    id: a.id,
    title: a.title,
    year: a.year,
    make: a.make,
    model: a.model,
    endAt: a.endAt,
    highBidCents: a.highBidCents,
    reservePriceCents: a.reservePriceCents,
    images: a.images,
  }));

  return (
    <div className="bg-white">
      {/* The Showroom — hero carousel */}
      <ShowroomHero auctions={featuredForHero} />

      {/* Featured live auctions grid */}
      <section className="border-t border-neutral-100 py-16 md:py-24">
        <div className="carasta-container">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">
                Live Auctions
              </h2>
              <p className="mt-2 text-neutral-600">
                Bid on exceptional collector cars. Reserve meter, auto-bid, buy now.
              </p>
            </div>
            <Link
              href="/auctions"
              className="hidden shrink-0 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 font-medium text-neutral-900 transition hover:bg-neutral-50 md:inline-flex"
            >
              View all
              <Gavel className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recentAuctions.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-neutral-200 bg-neutral-50 py-16 text-center">
                <p className="text-neutral-600">
                  No live auctions at the moment. Check back soon.
                </p>
                <Link
                  href="/auctions"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:underline"
                >
                  Browse Auctions
                  <Gavel className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              recentAuctions.map((a) => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  highBidCents={a.bids[0]?.amountCents ?? 0}
                />
              ))
            )}
          </div>
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 font-medium text-white transition hover:bg-neutral-800"
            >
              View all auctions
              <Gavel className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Value proposition — minimal */}
      <section className="border-t border-neutral-100 bg-neutral-50/50 py-16 md:py-24">
        <div className="carasta-container text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
            Built by Enthusiasts, for Enthusiasts.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-600">
            A premium car auction experience with transparent bidding, reserve
            meters, anti-sniping, and a connected community of collectors.
          </p>
        </div>
      </section>
    </div>
  );
}
