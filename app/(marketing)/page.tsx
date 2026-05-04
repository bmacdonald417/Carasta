import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchLiveAuctionsForList } from "@/lib/auction-queries";
import { getHomeStats } from "@/lib/home-stats";
import { listTrendingThreadsGlobal } from "@/lib/forums/discussions-discovery";
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
import { AuctionCard } from "@/app/(marketing)/auctions/auction-card";
import { LiveAuctionStrip } from "@/components/marketplace/live-auction-strip";
import { FeaturedAuctionHero } from "@/components/marketplace/featured-auction-hero";
import { SellerCtaStrip } from "@/components/marketplace/seller-cta-strip";
import { CarmunityFeedPanel, type FeedPreviewPost } from "@/components/marketplace/carmunity-feed-panel";
import { CarmunityForumsPanel } from "@/components/marketplace/carmunity-forums-panel";
import { UserGarageCard } from "@/components/marketplace/user-garage-card";
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
    <section className="border-t border-border bg-muted/30 py-8 md:py-10">
      <div className="carasta-container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden shrink-0 items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-e1 transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:inline-flex"
          >
            View all
            <Gavel className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mt-5 text-center md:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-e1 transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;

  let endingSoonAuctions: Awaited<ReturnType<typeof fetchLiveAuctionsForList>> = [];
  let recentAuctions: Awaited<ReturnType<typeof fetchLiveAuctionsForList>> = [];
  let homeStats = { liveAuctions: 0, soldAuctions: 0, totalBids: 0, communityPosts: 0 };
  let trendingThreads: Awaited<ReturnType<typeof listTrendingThreadsGlobal>> = [];
  let feedPreviewPosts: FeedPreviewPost[] = [];
  let viewerGarage:
    | {
        handle: string;
        displayName: string | null;
        location: string | null;
        avatarUrl: string | null;
        stats: { posts: number; followers: number; following: number };
        garage: Array<{
          id: string;
          year: number;
          make: string;
          model: string;
          imageUrl: string | null;
        }>;
      }
    | null = null;

  try {
    const [endSoon, recent, stats, threads, postsRaw] = await Promise.all([
      fetchLiveAuctionsForList({ orderBy: "endAt", take: 8, imagesTake: 2 }),
      fetchLiveAuctionsForList({ orderBy: "createdAt", take: 8, imagesTake: 2 }),
      getHomeStats(),
      listTrendingThreadsGlobal({ take: 7 }).catch(() => []),
      prisma.post.findMany({
        orderBy: [{ postReactions: { _count: "desc" } }, { likes: { _count: "desc" } }],
        take: 4,
        include: {
          author: { select: { id: true, handle: true, name: true, avatarUrl: true } },
          _count: { select: { likes: true, comments: true } },
        },
      }),
    ]);
    endingSoonAuctions = endSoon;
    recentAuctions = recent;
    homeStats = stats;
    trendingThreads = threads;
    feedPreviewPosts = postsRaw.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt.toISOString(),
      author: p.author,
      _count: p._count,
    }));

    if (viewerId) {
      const u = await prisma.user.findUnique({
        where: { id: viewerId },
        select: {
          handle: true,
          name: true,
          location: true,
          avatarUrl: true,
          image: true,
          _count: { select: { posts: true, followers: true, following: true } },
        },
      });
      if (u?.handle) {
        const garageCars = await prisma.garageCar.findMany({
          where: { ownerId: viewerId, type: "GARAGE" },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: {
            id: true,
            year: true,
            make: true,
            model: true,
            images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
          },
        });
        viewerGarage = {
          handle: u.handle,
          displayName: u.name,
          location: u.location,
          avatarUrl: u.avatarUrl ?? u.image ?? null,
          stats: {
            posts: u._count.posts,
            followers: u._count.followers,
            following: u._count.following,
          },
          garage: garageCars.map((c) => ({
            id: c.id,
            year: c.year,
            make: c.make,
            model: c.model,
            imageUrl: c.images[0]?.url ?? null,
          })),
        };
      }
    }
  } catch {
    /* graceful degradation — leave previews empty */
  }

  const stripAuctions =
    recentAuctions.length > 0 ? recentAuctions : endingSoonAuctions;
  const stripItems = stripAuctions.slice(0, 12).map((a) => ({
    ...a,
    endAt: a.endAt.toISOString(),
  }));

  const featured = endingSoonAuctions[0] ?? null;
  const featuredHero =
    featured != null
      ? {
          id: featured.id,
          title: featured.title,
          year: featured.year,
          make: featured.make,
          model: featured.model,
          endAt: featured.endAt.toISOString(),
          status: featured.status,
          reservePriceCents: featured.reservePriceCents,
          images: featured.images,
          seller: featured.seller,
        }
      : null;

  return (
    <div className="bg-background">
      <LiveAuctionStrip
        auctions={stripItems}
        requireAuth={requireAuth}
        viewAllHref="/auctions"
      />

      <FeaturedAuctionHero
        auction={featuredHero}
        highBidCents={featured?.highBidCents ?? null}
        requireAuth={requireAuth}
      />

      {/* Three-column social layout */}
      <section className="border-b border-border bg-background py-4 md:py-5">
        <div className="carasta-container">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
            {/* Left: profile/nav sidebar */}
            <div className="order-2 lg:order-1 lg:col-span-3">
              {viewerGarage ? (
                <UserGarageCard
                  variant="signed-in"
                  handle={viewerGarage.handle}
                  displayName={viewerGarage.displayName}
                  location={viewerGarage.location}
                  avatarUrl={viewerGarage.avatarUrl}
                  stats={viewerGarage.stats}
                  garage={viewerGarage.garage}
                />
              ) : (
                <UserGarageCard variant="guest" garage={[]} />
              )}
            </div>
            {/* Center: social feed */}
            <div className="order-1 lg:order-2 lg:col-span-6">
              <CarmunityFeedPanel posts={feedPreviewPosts} currentUserId={viewerId} />
            </div>
            {/* Right: forums + sell CTA */}
            <div className="order-3 lg:col-span-3 flex flex-col gap-4">
              <SellerCtaStrip inline />
              <CarmunityForumsPanel threads={trendingThreads} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/15 py-7 md:py-8">
        <div className="carasta-container">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary/90">Platform activity</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Alive now, not just explained well.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Live auctions, bids, Carmunity posts, and public surfaces connect enthusiast identity with marketplace motion.
              </p>
              <div className="mt-6">
                <HomeStatsStrip stats={homeStats} />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5">
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      <CarmunityHero />
      <ProductPillarsSection />

      <WhyCarastaSection />

      <section className="border-b border-border bg-[hsl(var(--navy))] py-8 text-white md:py-10">
        <div className="carasta-container max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Marketplace proof</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
            Live auctions validate the story — they don&apos;t have to carry it alone.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">
            Browse transparent bidding, seller credibility, and real inventory alongside the Carmunity feed and forums.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[hsl(var(--navy))] shadow-e1 transition hover:bg-white/90"
            >
              Browse live auctions
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              How bidding works
            </Link>
            <Link href="/sell" className="inline-flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold text-white/80 transition hover:text-white">
              Sell your car
            </Link>
          </div>
        </div>
      </section>

      <AuctionSection
        title="Ending soon"
        description="Auctions closing next — follow the market as bidding gets tighter."
        auctions={endingSoonAuctions}
        viewAllHref="/auctions"
        requireAuth={requireAuth}
      />

      <AuctionSection
        title="Recently added"
        description="Fresh collector cars entering the marketplace right now."
        auctions={recentAuctions}
        viewAllHref="/auctions"
        requireAuth={requireAuth}
      />

      {endingSoonAuctions.length === 0 && recentAuctions.length === 0 && (
        <section className="border-t border-border bg-muted/30 py-10 md:py-14">
          <div className="carasta-container">
            <div className="rounded-3xl border border-border bg-card py-12 text-center shadow-e1">
              <p className="text-muted-foreground">No live auctions at the moment. Check back soon.</p>
              <Link
                href="/auctions"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse auctions
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
