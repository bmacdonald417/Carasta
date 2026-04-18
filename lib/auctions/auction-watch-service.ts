import { prisma } from "@/lib/db";

export type AuctionWatchSummary = {
  id: string;
  title: string;
  endAt: string;
  imageUrl: string | null;
  status: string;
};

export async function watchAuction(input: {
  userId: string;
  auctionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const auction = await prisma.auction.findUnique({
    where: { id: input.auctionId },
    select: { id: true },
  });
  if (!auction) return { ok: false, error: "Auction not found." };

  await prisma.auctionWatch.upsert({
    where: {
      userId_auctionId: { userId: input.userId, auctionId: input.auctionId },
    },
    create: { userId: input.userId, auctionId: input.auctionId },
    update: {},
  });
  return { ok: true };
}

export async function unwatchAuction(input: {
  userId: string;
  auctionId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  await prisma.auctionWatch.deleteMany({
    where: { userId: input.userId, auctionId: input.auctionId },
  });
  return { ok: true };
}

export async function isWatchingAuction(input: {
  userId: string;
  auctionId: string;
}): Promise<boolean> {
  const row = await prisma.auctionWatch.findUnique({
    where: {
      userId_auctionId: { userId: input.userId, auctionId: input.auctionId },
    },
    select: { id: true },
  });
  return row != null;
}

export async function listWatchedAuctionSummaries(userId: string): Promise<AuctionWatchSummary[]> {
  const rows = await prisma.auctionWatch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      auction: {
        select: {
          id: true,
          title: true,
          endAt: true,
          status: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.auction.id,
    title: r.auction.title,
    endAt: r.auction.endAt.toISOString(),
    status: r.auction.status,
    imageUrl: r.auction.images[0]?.url ?? null,
  }));
}
