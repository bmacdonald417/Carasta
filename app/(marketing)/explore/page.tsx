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
    "inline-flex items-center justify-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200",
    active
      ? "border-primary/35 bg-gradient-to-b from-primary/[0.16] to-primary/[0.08] text-primary shadow-md ring-1 ring-inset ring-primary/25"
      : "border-border/70 bg-card/95 text-muted-foreground shadow-sm ring-1 ring-inset ring-border/40 hover:border-primary/25 hover:bg-primary/[0.07] hover:text-foreground hover:shadow-md hover:ring-primary/15 motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0",
    shellFocusRing
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const rawTab = typeof params.tab === "string" ? params.tab : "";
  const tab = rawTab === "following" ? "following" : "latest";
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
    <div className="min-h-0 bg-gradient-to-b from-muted/60 via-background to-muted/30 pb-12 pt-2 md:pt-3">
      <div className="carasta-container max-w-7xl px-4 sm:px-6">
        <header className="border-b border-border/70 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h1 className="min-w-0 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              Carmunity{" "}
              <span className="font-normal text-muted-foreground">by Carasta</span>
            </h1>
            {currentUserId ? (
              <ContextualHelpCard
                context="carmunity.explore"
                className="w-auto shrink-0"
                menuAlign="end"
              />
            ) : null}
          </div>
          <nav
            className="mt-2.5 flex flex-wrap items-center gap-2"
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
            <Link href="#trending-dream-garage" className={navPillClass(false)}>
              Dream garage
            </Link>
          </nav>
        </header>

        {!currentUserId ? (
          <SignedOutPreviewNotice
            nextUrl="/explore"
            className="mt-3"
            title="Read-only preview"
            description="You’re viewing a read-only Carmunity preview. Join free to react, comment, follow voices, and shape your feed."
          />
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
