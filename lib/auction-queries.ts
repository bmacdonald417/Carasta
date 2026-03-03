/**
 * Shared auction list queries for homepage and listing pages.
 * Ensures consistent include: top bid, _count.bids, seller.
 */
import { prisma } from "./db";
import { computeCurrentBidCents } from "./auction-metrics";

const AUCTION_LIST_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 2 },
  bids: { orderBy: { amountCents: "desc" as const }, take: 1 },
  seller: { select: { handle: true } },
  _count: { select: { bids: true } },
} as const;

export type AuctionListItem = Awaited<
  ReturnType<typeof fetchLiveAuctionsForList>
>[number];

export async function fetchLiveAuctionsForList(options: {
  orderBy: "endAt" | "createdAt";
  orderDir?: "asc" | "desc";
  take: number;
  skip?: number;
  imagesTake?: number;
}) {
  const {
    orderBy,
    orderDir = orderBy === "endAt" ? "asc" : "desc",
    take,
    skip = 0,
    imagesTake = 2,
  } = options;
  const include = {
    ...AUCTION_LIST_INCLUDE,
    images: { orderBy: { sortOrder: "asc" as const }, take: imagesTake },
  };
  const auctions = await prisma.auction.findMany({
    where: { status: "LIVE" },
    orderBy: { [orderBy]: orderDir },
    take,
    skip,
    include,
  });
  return auctions.map((a) => ({
    ...a,
    highBidCents: computeCurrentBidCents(a.bids),
  }));
}
