import { getSession } from "@/lib/auth";
import { fetchLiveAuctionsForList } from "@/lib/auction-queries";
import { getHomeStats } from "@/lib/home-stats";
import { HomeStatsStrip } from "@/components/home/HomeStatsStrip";
import { LiveActivityFeed } from "@/components/home/LiveActivityFeed";
import Link from "next/link";
import {
  CarmunityHero,
  HowItWorksSnapshot,
  ProductPillarsSection,
  SellerIntelligenceSection,
  TrustResourcesBand,
  WhyCarastaSection,
} from "@/components/home/HomePublicSections";
import { ShowroomHero } from "@/components/home/ShowroomHero";
import { AuctionImageStrip } from "@/components/home/AuctionImageStrip";
import { AuctionCard } from "@/app/(marketing)/auctions/auction-card";
import { Gavel } from "lucide-react";

export const dynamic = "force-dynamic";

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
    <section className="border-t border-border/60 bg-neutral-50 py-12 md:py-16">
      <div className="carasta-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.1em] text-neutral-950 md:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-neutral-600">{description}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-100 md:inline-flex"
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
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2.5 font-medium text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-100"
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
  let homeStats = { liveAuctions: 0, soldAuctions: 0, totalBids: 0, communityPosts: 0 };
  try {
    [endingSoonAuctions, recentAuctions, homeStats] = await Promise.all([
      fetchLiveAuctionsForList({ orderBy: "endAt", take: 6, imagesTake: 2 }),
      fetchLiveAuctionsForList({ orderBy: "createdAt", take: 6, imagesTake: 2 }),
      getHomeStats(),
    ]);
  } catch (err) {
    console.error("[home] Failed to fetch:", err);
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
    <div className="bg-background">
      <AuctionImageStrip
        auctions={stripAuctions.map((a) => ({
          id: a.id,
          title: a.title,
          images: a.images,
        }))}
        requireAuth={requireAuth}
      />
      <CarmunityHero />
      <ProductPillarsSection />

      <section className="border-b border-border/60 bg-white py-16 md:py-20">
        <div className="carasta-container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                Platform activity
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
                Alive now, not just explained well.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
                Carasta already has the ingredients people expect from a real
                product: live auctions, bids, Carmunity activity, and public
                surfaces that connect identity with marketplace motion.
              </p>
              <div className="mt-8">
                <HomeStatsStrip stats={homeStats} />
              </div>
            </div>
            <div className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-4 shadow-sm md:p-5">
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      <WhyCarastaSection />

      <section className="border-b border-border/60 bg-neutral-950 py-16 text-white md:py-20">
        <div className="carasta-container">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
              Marketplace proof
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Live auctions should validate the story, not have to carry it by themselves.
            </h2>
            <p className="mt-4 text-base leading-7 text-neutral-300 md:text-lg">
              The marketplace remains a serious part of Carasta. This is where
              live inventory, bidding urgency, and seller credibility prove that
              the broader platform already has real substance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-100"
              >
                Browse Live Auctions
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See How Bidding Works
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:text-white"
              >
                Sell Your Car
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-10">
          <ShowroomHero auctions={featuredForHero} requireAuth={requireAuth} />
        </div>
      </section>

      <AuctionSection
        title="Ending Soon"
        description="Auctions closing next. Follow the market as bidding gets tighter."
        auctions={endingSoonAuctions}
        viewAllHref="/auctions?sort=ending"
        requireAuth={requireAuth}
      />

      <AuctionSection
        title="Recently Added"
        description="Fresh collector cars entering the marketplace right now."
        auctions={recentAuctions}
        viewAllHref="/auctions?sort=newest"
        requireAuth={requireAuth}
      />

      {endingSoonAuctions.length === 0 && recentAuctions.length === 0 && (
        <section className="border-t border-border/60 bg-neutral-50 py-16 md:py-24">
          <div className="carasta-container">
            <div className="rounded-3xl border border-neutral-200 bg-white py-16 text-center shadow-sm">
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
          </div>
        </section>
      )}

      <SellerIntelligenceSection />
      <HowItWorksSnapshot />
      <TrustResourcesBand />
    </div>
  );
}
