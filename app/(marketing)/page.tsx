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
    <section className="border-t border-border bg-muted/30 py-12 md:py-16">
      <div className="carasta-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">{description}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
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
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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

      <section className="border-b border-border bg-background py-16 md:py-20">
        <div className="carasta-container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
                Platform activity
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Alive now, not just explained well.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Carasta already has the ingredients people expect from a real
                product: live auctions, bids, Carmunity activity, and public
                surfaces that connect identity with marketplace motion.
              </p>
              <div className="mt-8">
                <HomeStatsStrip stats={homeStats} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5">
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      <WhyCarastaSection />

      <section className="border-b border-border bg-foreground py-16 text-background md:py-20">
        <div className="carasta-container">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Marketplace proof
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Live auctions should validate the story, not have to carry it by themselves.
            </h2>
            <p className="mt-4 text-base leading-7 text-background/80 md:text-lg">
              The marketplace remains a serious part of Carasta. This is where
              live inventory, bidding urgency, and seller credibility prove that
              the broader platform already has real substance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-2xl bg-background px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse Live Auctions
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-background/25 bg-background/10 px-6 py-3.5 text-sm font-semibold text-background backdrop-blur-sm transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                See How Bidding Works
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-background/75 transition-colors hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        <section className="border-t border-border bg-muted/30 py-16 md:py-24">
          <div className="carasta-container">
            <div className="rounded-2xl border border-border bg-card py-16 text-center shadow-e1">
              <p className="text-muted-foreground">
                No live auctions at the moment. Check back soon.
              </p>
              <Link
                href="/auctions"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
