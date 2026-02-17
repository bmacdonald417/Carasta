import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CommunityFeed } from "./community-feed";

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
      <h1 className="font-display text-2xl font-bold">Community</h1>
      <p className="mt-1 text-muted-foreground">
        Posts from the community. Follow people to see them in Following.
      </p>
      <CommunityFeed tab={tab} currentUserId={currentUserId} />
    </div>
  );
}
