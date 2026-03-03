import { getSession } from "@/lib/auth";
import { fetchLiveAuctionsForList } from "@/lib/auction-queries";

export const dynamic = "force-dynamic";
import Link from "next/link";
import { ShowroomHero } from "@/components/home/ShowroomHero";
import { AuctionImageStrip } from "@/components/home/AuctionImageStrip";
import { AuctionCard } from "@/app/(marketing)/auctions/auction-card";
import { AppStoreBadges } from "@/components/ui/app-store-badges";
import { InstagramShowcase } from "@/components/carasta/InstagramShowcase";
import { Gavel } from "lucide-react";

function AuctionSection({
  title,
  description,
  auctions,
  viewAllHref,
  requireAuth,
}: {
  title: string;
  description: string;
  auctions: Awaited<ReturnType<typeof fetchLiveAuctionsForList>>;
  viewAllHref: string;
  requireAuth: boolean;
}) {
  if (auctions.length === 0) return null;
  return (
    <section className="border-t border-white/10 bg-white/[0.02] py-12 md:py-16">
      <div className="carasta-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.1em] text-neutral-100 md:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-neutral-400">{description}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-[#ff3b5c]/30 bg-[#ff3b5c]/10 px-4 py-2.5 font-medium text-[#ff3b5c] transition hover:bg-[#ff3b5c]/20 md:inline-flex"
          >
            View all
            <Gavel className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.map((a, i) => (
            <AuctionCard
              key={a.id}
              auction={{
                id: a.id,
                title: a.title,
                year: a.year,
                make: a.make,
                model: a.model,
                endAt: a.endAt.toISOString(),
                status: a.status,
                reservePriceCents: a.reservePriceCents,
                images: a.images,
                seller: a.seller,
              }}
              highBidCents={a.highBidCents}
              bidCount={a._count.bids}
              index={i}
              requireAuth={requireAuth}
            />
          ))}
        </div>
        <div className="mt-6 text-center md:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-lg bg-[#ff3b5c]/20 px-4 py-2.5 font-medium text-[#ff3b5c] transition hover:bg-[#ff3b5c]/30"
          >
            View all
            <Gavel className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const session = await getSession();
  const requireAuth = !session?.user;

  let endingSoonAuctions: Awaited<ReturnType<typeof fetchLiveAuctionsForList>> = [];
  let recentAuctions: Awaited<ReturnType<typeof fetchLiveAuctionsForList>> = [];
  try {
    [endingSoonAuctions, recentAuctions] = await Promise.all([
      fetchLiveAuctionsForList({ orderBy: "endAt", take: 6, imagesTake: 2 }),
      fetchLiveAuctionsForList({ orderBy: "createdAt", take: 6, imagesTake: 2 }),
    ]);
  } catch (err) {
    console.error("[home] Failed to fetch auctions:", err);
  }

  const featuredForHero = endingSoonAuctions.slice(0, 5).map((a) => ({
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

  const stripAuctions =
    recentAuctions.length > 0 ? recentAuctions : endingSoonAuctions;

  return (
    <div className="bg-[#0a0a0f]">
      {/* Scrolling auction image strip */}
      <AuctionImageStrip
        auctions={stripAuctions.map((a) => ({
          id: a.id,
          title: a.title,
          images: a.images,
        }))}
        requireAuth={requireAuth}
      />
      {/* Featured Live Auctions — hero carousel */}
      <ShowroomHero auctions={featuredForHero} requireAuth={requireAuth} />

      {/* Ending Soon */}
      <AuctionSection
        title="Ending Soon"
        description="Auctions closing next. Place your bid before it's too late."
        auctions={endingSoonAuctions}
        viewAllHref="/auctions?sort=ending"
        requireAuth={requireAuth}
      />

      {/* Recently Added */}
      <AuctionSection
        title="Recently Added"
        description="Just listed. Fresh collector cars hitting the block."
        auctions={recentAuctions}
        viewAllHref="/auctions?sort=newest"
        requireAuth={requireAuth}
      />

      {/* Fallback when no auctions */}
      {endingSoonAuctions.length === 0 && recentAuctions.length === 0 && (
        <section className="border-t border-white/10 py-16 md:py-24">
          <div className="carasta-container">
            <div className="rounded-2xl border border-white/10 bg-white/5 py-16 text-center">
              <p className="text-neutral-400">
                No live auctions at the moment. Check back soon.
              </p>
              <Link
                href="/auctions"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#ff3b5c] hover:underline"
              >
                Browse Auctions
                <Gavel className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Social Command Center — Instagram showcase */}
      <InstagramShowcase />

      {/* Value proposition + Download App */}
      <section className="border-t border-white/10 bg-white/[0.02] py-16 md:py-24">
        <div className="carasta-container text-center">
          <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.1em] text-neutral-100 md:text-3xl">
            Built by Enthusiasts, for Enthusiasts.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-400">
            A premium car auction experience with transparent bidding, reserve
            meters, anti-sniping, and a connected community of collectors.
          </p>
          <p className="mt-6 text-sm font-medium text-neutral-500">
            Download the app
          </p>
          <div className="mt-4">
            <AppStoreBadges />
          </div>
        </div>
      </section>
    </div>
  );
}
