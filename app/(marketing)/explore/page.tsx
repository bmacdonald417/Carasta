import Link from "next/link";

import { getSession } from "@/lib/auth";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { buildOnboardingPack, getCarmunityOnboardingState } from "@/lib/carmunity/onboarding-service";
import { listDiscussedLiveAuctions } from "@/lib/forums/auction-discussion";
import { listTrendingThreadsGlobal } from "@/lib/forums/discussions-discovery";
import { SignedOutPreviewNotice } from "@/components/guest-preview/SignedOutPreviewNotice";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { CommunityFeed } from "./community-feed";
import { TrendingDreamGarage } from "./TrendingDreamGarage";

type SearchParams = { tab?: string } | Promise<{ tab?: string }>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "trending";
  const session = await getSession();
  const currentUserId = (session?.user as any)?.id;

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

  return (
    <div className="carasta-container max-w-2xl py-10 pb-16 md:max-w-5xl">
      <header className="border-b border-border pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Carmunity
        </h1>
        <p className="mt-1 text-sm font-medium text-muted-foreground">by Carasta</p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          One home for posts and discussions from people you follow — jump to{" "}
          <Link
            href="/discussions"
            className={cn(
              "carmunity-nav-link font-semibold text-primary hover:underline",
              shellFocusRing,
              "rounded-md"
            )}
            data-active="false"
          >
            Discussions
          </Link>{" "}
          for full Gear threads.
        </p>
      </header>
      {!currentUserId ? (
        <SignedOutPreviewNotice
          nextUrl="/explore"
          className="mt-6"
          description="You’re viewing a read-only Carmunity preview. Join free to react, comment, follow voices, and shape your feed."
        />
      ) : null}
      {currentUserId ? (
        <ContextualHelpCard context="carmunity.explore" className="mt-6" />
      ) : null}
      <TrendingDreamGarage />
      <CommunityFeed
        tab={tab}
        currentUserId={currentUserId}
        trendingDiscussionThreads={trendingThreads}
        discussedAuctions={discussedAuctions}
        needsCarmunityOnboarding={needsCarmunityOnboarding}
        onboardingPack={onboardingPack}
      />
    </div>
  );
}
