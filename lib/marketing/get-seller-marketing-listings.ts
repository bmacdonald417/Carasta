import { prisma } from "@/lib/db";
import { computeCurrentBidCents } from "@/lib/auction-metrics";

const MARKETING_LISTINGS_LIMIT = 12;

/** Recent seller auctions for the marketing dashboard (read-only). */
export async function getSellerMarketingListings(sellerId: string) {
  const auctions = await prisma.auction.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: MARKETING_LISTINGS_LIMIT,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      _count: { select: { bids: true } },
    },
  });

  return auctions.map((a) => ({
    id: a.id,
    title: a.title,
    year: a.year,
    make: a.make,
    model: a.model,
    status: a.status,
    imageUrl: a.images[0]?.url ?? null,
    highBidCents: computeCurrentBidCents(a.bids),
    bidCount: a._count.bids,
  }));
}
