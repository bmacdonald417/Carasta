import { prisma } from "./db";

export type LeaderboardRow = {
  rank: number;
  handle: string;
  avatarUrl: string | null;
  collectorTier: string;
  carsSold: number;
  highestBidWonCents: number;
  reputationScore: number;
};

/**
 * Fetch leaderboard data using Prisma aggregations.
 * Public-safe fields only: handle, avatarUrl, collectorTier, carsSold, highestBidWonCents, reputationScore.
 */
export async function getLeaderboardData(limit = 50): Promise<LeaderboardRow[]> {
  // Users with any activity (reputation, sales, or purchases)
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { reputationScore: { gt: 0 } },
        { completedSalesCount: { gt: 0 } },
        { completedPurchasesCount: { gt: 0 } },
      ],
    },
    select: {
      id: true,
      handle: true,
      avatarUrl: true,
      collectorTier: true,
      completedSalesCount: true,
      reputationScore: true,
    },
    orderBy: [{ reputationScore: "desc" }, { completedSalesCount: "desc" }],
    take: limit * 2, // fetch extra for filtering before we compute highest bid
  });

  if (users.length === 0) return [];

  const userIds = users.map((u) => u.id);

  // Sold auctions where user is buyer: get sale price per auction
  // Sale price = buyNowPriceCents ?? max bid amount
  const soldAuctions = await prisma.auction.findMany({
    where: {
      status: "SOLD",
      buyerId: { in: userIds },
    },
    select: {
      id: true,
      buyerId: true,
      buyNowPriceCents: true,
      bids: {
        orderBy: { amountCents: "desc" },
        take: 1,
        select: { amountCents: true },
      },
    },
  });

  const highestBidByUser = new Map<string, number>();
  for (const a of soldAuctions) {
    if (!a.buyerId) continue;
    const salePriceCents =
      a.buyNowPriceCents ?? a.bids[0]?.amountCents ?? 0;
    const current = highestBidByUser.get(a.buyerId) ?? 0;
    if (salePriceCents > current) {
      highestBidByUser.set(a.buyerId, salePriceCents);
    }
  }

  const rows: LeaderboardRow[] = users.map((u, i) => ({
    rank: i + 1,
    handle: u.handle,
    avatarUrl: u.avatarUrl,
    collectorTier: u.collectorTier,
    carsSold: u.completedSalesCount,
    highestBidWonCents: highestBidByUser.get(u.id) ?? 0,
    reputationScore: u.reputationScore,
  }));

  // Sort by composite score: reputation first, then cars sold, then highest bid
  rows.sort((a, b) => {
    if (b.reputationScore !== a.reputationScore)
      return b.reputationScore - a.reputationScore;
    if (b.carsSold !== a.carsSold) return b.carsSold - a.carsSold;
    return b.highestBidWonCents - a.highestBidWonCents;
  });

  const trimmed = rows.slice(0, limit);
  trimmed.forEach((r, i) => {
    r.rank = i + 1;
  });
  return trimmed;
}
