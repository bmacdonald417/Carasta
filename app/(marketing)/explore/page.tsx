import Link from "next/link";

import { getSession } from "@/lib/auth";
import { buildOnboardingPack, getCarmunityOnboardingState } from "@/lib/carmunity/onboarding-service";
import { listDiscussedLiveAuctions } from "@/lib/forums/auction-discussion";
import { listTrendingThreadsGlobal } from "@/lib/forums/discussions-discovery";
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
    <div className="carasta-container max-w-2xl py-10 pb-16">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        Carmunity
      </h1>
      <p className="mt-1 text-sm text-neutral-500">by Carasta</p>
      <p className="mt-2 text-neutral-400">
        One home for posts and discussions from people you follow — jump to{" "}
        <Link
          href="/discussions"
          className="carmunity-nav-link text-primary hover:underline"
          data-active="false"
        >
          Discussions
        </Link>{" "}
        for full Gear threads.
      </p>
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
