import { getSession } from "@/lib/auth";
import { CommunityFeed } from "./community-feed";
import { TrendingDreamGarage } from "./TrendingDreamGarage";

type SearchParams = Promise<{ tab?: string }>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tab = typeof params.tab === "string" ? params.tab : "trending";
  const session = await getSession();
  const currentUserId = (session?.user as any)?.id;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Community
      </h1>
      <p className="mt-1 text-neutral-400">
        Posts from the community. Follow people to see them in Following.
      </p>
      <TrendingDreamGarage />
      <CommunityFeed tab={tab} currentUserId={currentUserId} />
    </div>
  );
}
