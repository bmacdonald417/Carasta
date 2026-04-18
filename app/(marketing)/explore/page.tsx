import Link from "next/link";

import { getSession } from "@/lib/auth";
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

  return (
    <div className="carasta-container max-w-2xl py-10 pb-16">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Carmunity
      </h1>
      <p className="mt-1 text-sm text-neutral-500">by Carasta</p>
      <p className="mt-2 text-neutral-400">
        Feed posts from builders and collectors. Follow people to see them in
        Following — or jump to{" "}
        <Link href="/forums" className="carmunity-nav-link text-primary hover:underline" data-active="false">
          Forums
        </Link>{" "}
        for threaded discussions.
      </p>
      <TrendingDreamGarage />
      <CommunityFeed tab={tab} currentUserId={currentUserId} />
    </div>
  );
}
