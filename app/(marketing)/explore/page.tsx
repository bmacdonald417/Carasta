import Link from "next/link";

import { getSession } from "@/lib/auth";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { buildOnboardingPack, getCarmunityOnboardingState } from "@/lib/carmunity/onboarding-service";
import { listDiscussedLiveAuctions } from "@/lib/forums/auction-discussion";
import { listTrendingThreadsGlobal } from "@/lib/forums/discussions-discovery";
import { ExploreRightRail } from "@/components/explore/ExploreRightRail";
import { ExploreTrendingThreads } from "@/components/explore/ExploreTrendingThreads";
import { SignedOutPreviewNotice } from "@/components/guest-preview/SignedOutPreviewNotice";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { CommunityFeed } from "./community-feed";
import { TrendingDreamGarage } from "./TrendingDreamGarage";

type SearchParams = { tab?: string } | Promise<{ tab?: string }>;

function navPillClass(active: boolean) {
  return cn(
    "inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
    active
      ? "border-primary/30 bg-primary/12 text-primary shadow-sm"
      : "border-border/80 bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/[0.06] hover:text-foreground",
    shellFocusRing
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "trending";
  const session = await getSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const [trendingThreads, discussedAuctions] = await Promise.all([
    listTrendingThreadsGlobal({ take: 4 }).catch(() => []),
    listDiscussedLiveAuctions({ take: 3 }).catch(() => []),
  ]);

  let needsCarmunityOnboarding = false;
  let onboardingPack: Awaited<ReturnType<typeof buildOnboardingPack>> | null = null;
  if (currentUserId) {
    const st = await getCarmunityOnboardingState(currentUserId);
    needsCarmunityOnboarding = !st.completedAt;
    if (needsCarmunityOnboarding) {
      onboardingPack = await buildOnboardingPack({ viewerUserId: currentUserId });
    }
  }

  const tabFollowing = tab === "following";

  return (
    <div className="min-h-0 bg-gradient-to-b from-muted/60 via-background to-muted/30 pb-16 pt-4 md:pt-6">
      <div className="carasta-container max-w-7xl px-4 sm:px-6">
        <header className="border-b border-border/70 pb-5 md:flex md:items-end md:justify-between md:gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Social feed
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground antialiased md:text-3xl">
              Carmunity
            </h1>
            <p className="mt-0.5 text-xs font-medium text-muted-foreground">by Carasta</p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Posts and motion from people you follow — plus{" "}
              <Link
                href="/discussions"
                className={cn(
                  "font-semibold text-primary underline-offset-4 hover:underline",
                  shellFocusRing,
                  "rounded-md"
                )}
              >
                Discussions
              </Link>{" "}
              for full Gear threads.
            </p>
          </div>
          <nav
            className="mt-4 flex flex-wrap items-center gap-2 md:mt-0 md:max-w-md md:justify-end"
            aria-label="Carmunity destinations"
          >
            <Link href="/explore" className={navPillClass(!tabFollowing)} scroll={false}>
              Feed
            </Link>
            <Link
              href="/explore?tab=following"
              className={navPillClass(tabFollowing)}
              scroll={false}
            >
              Following
            </Link>
            <Link href="/discussions" className={navPillClass(false)}>
              Discussions
            </Link>
            <Link
              href="#trending-dream-garage"
              className={navPillClass(false)}
            >
              Dream garage
            </Link>
          </nav>
        </header>

        {!currentUserId ? (
          <SignedOutPreviewNotice
            nextUrl="/explore"
            className="mt-5"
            title="Read-only preview"
            description="You’re viewing a read-only Carmunity preview. Join free to react, comment, follow voices, and shape your feed."
          />
        ) : null}
        {currentUserId ? (
          <ContextualHelpCard context="carmunity.explore" className="mt-5" />
        ) : null}

        <TrendingDreamGarage />

        <div className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_min(100%,300px)] lg:items-start lg:gap-10 xl:gap-12">
          <div className="min-w-0 space-y-6 lg:space-y-0">
            {trendingThreads.length > 0 ? (
              <div className="mb-6 lg:hidden">
                <ExploreTrendingThreads
                  threads={trendingThreads}
                  currentUserId={currentUserId}
                />
              </div>
            ) : null}
            <CommunityFeed
              tab={tab}
              currentUserId={currentUserId}
              discussedAuctions={discussedAuctions}
              needsCarmunityOnboarding={needsCarmunityOnboarding}
              onboardingPack={onboardingPack}
            />
          </div>

          <aside className="hidden lg:sticky lg:top-24 lg:block lg:min-w-0 lg:self-start">
            <ExploreRightRail
              trendingThreads={trendingThreads}
              currentUserId={currentUserId}
              nextPath="/explore"
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
