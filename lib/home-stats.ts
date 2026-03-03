/**
 * Homepage stats aggregation. Uses Prisma count for efficiency.
 * No sensitive data exposed. Cached 60s to reduce DB load.
 */
import { unstable_cache } from "next/cache";
import { prisma } from "./db";

export type HomeStats = {
  liveAuctions: number;
  soldAuctions: number;
  totalBids: number;
  communityPosts: number;
};

async function fetchHomeStats(): Promise<HomeStats> {
  const [liveAuctions, soldAuctions, totalBids, communityPosts] =
    await Promise.all([
      prisma.auction.count({ where: { status: "LIVE" } }),
      prisma.auction.count({ where: { status: "SOLD" } }),
      prisma.bid.count(),
      prisma.post.count(),
    ]);

  return {
    liveAuctions,
    soldAuctions,
    totalBids,
    communityPosts,
  };
}

export const getHomeStats = unstable_cache(
  fetchHomeStats,
  ["home-stats"],
  { revalidate: 60 }
);
