import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeCurrentBidCents, computeReserveMetPercent } from "@/lib/auction-metrics";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auction = await prisma.auction.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      bids: { orderBy: { amountCents: "desc" }, take: 1, include: { bidder: { select: { handle: true } } } },
      seller: { select: { id: true, handle: true, name: true, avatarUrl: true } },
      _count: { select: { bids: true } },
    },
  });
  if (!auction) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const highCents = computeCurrentBidCents(auction.bids);
  const reservePercent = computeReserveMetPercent(highCents, auction.reservePriceCents);

  return NextResponse.json({
    id: auction.id,
    title: auction.title,
    status: auction.status,
    endAt: auction.endAt.toISOString(),
    highBidCents: highCents,
    highBidderHandle: auction.bids[0]?.bidder?.handle ?? null,
    reserveMeterPercent: reservePercent,
    reservePriceCents: auction.reservePriceCents,
    buyNowPriceCents: auction.buyNowPriceCents,
    buyNowExpiresAt: auction.buyNowExpiresAt?.toISOString() ?? null,
    bidCount: auction._count.bids,
  });
}
