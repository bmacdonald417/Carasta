import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeCurrentBidCents, computeReserveMetPercent } from "@/lib/auction-metrics";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { isWatchingAuction } from "@/lib/auctions/auction-watch-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/auctions/[id] — JSON detail for web clients and Carmunity mobile (read-only).
 * Shape is extended additively; existing top-level keys remain for backward compatibility.
 */
export async function GET(
  req: NextRequest,
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

  const viewerId = await getJwtSubjectUserId(req);
  let watching = false;
  if (viewerId) {
    watching = await isWatchingAuction({ userId: viewerId, auctionId: id });
  }

  return NextResponse.json({
    ok: true,
    watching,
    id: auction.id,
    title: auction.title,
    description: auction.description,
    year: auction.year,
    make: auction.make,
    model: auction.model,
    trim: auction.trim,
    status: auction.status,
    startAt: auction.startAt.toISOString(),
    endAt: auction.endAt.toISOString(),
    createdAt: auction.createdAt.toISOString(),
    mileage: auction.mileage,
    conditionGrade: auction.conditionGrade,
    conditionSummary: auction.conditionSummary,
    locationZip: auction.locationZip,
    latitude: auction.latitude,
    longitude: auction.longitude,
    highBidCents: highCents,
    highBidderHandle: auction.bids[0]?.bidder?.handle ?? null,
    reserveMeterPercent: reservePercent,
    reservePriceCents: auction.reservePriceCents,
    buyNowPriceCents: auction.buyNowPriceCents,
    buyNowExpiresAt: auction.buyNowExpiresAt?.toISOString() ?? null,
    bidCount: auction._count.bids,
    images: auction.images.map((img) => ({
      id: img.id,
      url: img.url,
      sortOrder: img.sortOrder,
    })),
    seller: {
      id: auction.seller.id,
      handle: auction.seller.handle,
      name: auction.seller.name,
      avatarUrl: auction.seller.avatarUrl,
    },
  });
}
