import { prisma } from "./db";
import {
  BID_INCREMENT_CENTS,
  ANTI_SNIPE_EXTEND_SECONDS,
  nextMinBidCents,
} from "./utils";
import { computeCurrentBidCents, computeReserveMetPercent } from "./auction-metrics";

export type AuctionStatus = "DRAFT" | "LIVE" | "SOLD" | "ENDED";

/** @deprecated Use computeReserveMetPercent from lib/auction-metrics. Kept for backward compat. */
export function getReserveMeterPercent(
  currentHighCents: number,
  reserveCents: number | null
): number | null {
  return computeReserveMetPercent(currentHighCents, reserveCents);
}

export async function processAutoBids(
  auctionId: string,
  currentHighCents: number,
  currentHighBidderId: string
): Promise<{ newHighCents: number; newHighBidderId: string; extended: boolean }> {
  let high = currentHighCents;
  let highBidderId = currentHighBidderId;
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { endAt: true },
  });
  if (!auction) return { newHighCents: high, newHighBidderId: highBidderId, extended: false };

  const autoBids = await prisma.autoBid.findMany({
    where: { auctionId, active: true },
    orderBy: { maxAmountCents: "desc" },
  });

  let addedBid = false;
  for (const ab of autoBids) {
    if (ab.bidderId === highBidderId) continue;
    const wouldBid = nextMinBidCents(high);
    if (wouldBid <= ab.maxAmountCents) {
      await prisma.bid.create({
        data: {
          auctionId,
          bidderId: ab.bidderId,
          amountCents: wouldBid,
        },
      });
      high = wouldBid;
      highBidderId = ab.bidderId;
      addedBid = true;
    }
  }

  let extended = false;
  const now = new Date();
  const remaining = (auction.endAt.getTime() - now.getTime()) / 1000;
  if (addedBid && remaining < ANTI_SNIPE_EXTEND_SECONDS && remaining > 0) {
    const newEnd = new Date(now.getTime() + ANTI_SNIPE_EXTEND_SECONDS * 1000);
    await prisma.auction.update({
      where: { id: auctionId },
      data: { endAt: newEnd },
    });
    extended = true;
  }

  return { newHighCents: high, newHighBidderId: highBidderId, extended };
}

export async function placeBidAndProcess(
  auctionId: string,
  bidderId: string,
  amountCents: number
): Promise<{ ok: boolean; error?: string }> {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: { bids: { orderBy: { amountCents: "desc" }, take: 1 } },
  });
  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.status !== "LIVE") return { ok: false, error: "Auction is not live." };

  const now = new Date();
  if (now >= auction.endAt) return { ok: false, error: "Auction has ended." };

  const currentHigh = auction.bids[0]?.amountCents ?? 0;
  const minBid = nextMinBidCents(currentHigh);
  if (amountCents < minBid) return { ok: false, error: `Minimum bid is $${minBid / 100}.` };

  const inLastTwoMinutes =
    auction.endAt.getTime() - now.getTime() <= ANTI_SNIPE_EXTEND_SECONDS * 1000;
  let newEndAt = auction.endAt;
  if (inLastTwoMinutes) {
    newEndAt = new Date(now.getTime() + ANTI_SNIPE_EXTEND_SECONDS * 1000);
  }

  await prisma.$transaction([
    prisma.bid.create({
      data: { auctionId, bidderId, amountCents },
    }),
    prisma.auction.update({
      where: { id: auctionId },
      data: { endAt: newEndAt },
    }),
  ]);

  let highCents = amountCents;
  let highBidderId = bidderId;
  let done = false;
  while (!done) {
    const result = await processAutoBids(auctionId, highCents, highBidderId);
    if (result.newHighCents === highCents && result.newHighBidderId === highBidderId) {
      done = true;
    } else {
      highCents = result.newHighCents;
      highBidderId = result.newHighBidderId;
    }
  }

  return { ok: true };
}

export async function getAuctionLiveData(auctionId: string) {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      bids: { orderBy: { amountCents: "desc" }, take: 1, include: { bidder: { select: { handle: true } } } },
      _count: { select: { bids: true } },
    },
  });
  if (!auction) return null;
  const highBidCents = computeCurrentBidCents(auction.bids);
  const reservePercent = computeReserveMetPercent(highBidCents, auction.reservePriceCents);
  return {
    highBidCents,
    highBidderHandle: auction.bids[0]?.bidder?.handle ?? null,
    bidCount: auction._count.bids,
    reserveMeterPercent: reservePercent,
    status: auction.status,
    endAt: auction.endAt.toISOString(),
    buyNowPriceCents: auction.buyNowPriceCents,
    buyNowExpiresAt: auction.buyNowExpiresAt?.toISOString() ?? null,
  };
}

export async function buyNow(auctionId: string, buyerId: string): Promise<{ ok: boolean; error?: string }> {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });
  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.status !== "LIVE") return { ok: false, error: "Auction is not live." };
  if (!auction.buyNowPriceCents || !auction.buyNowExpiresAt) return { ok: false, error: "Buy now not available." };
  const now = new Date();
  if (now > auction.buyNowExpiresAt) return { ok: false, error: "Buy now window has expired." };

  await prisma.auction.update({
    where: { id: auctionId },
    data: { status: "SOLD", endAt: now, buyerId },
  });

  return { ok: true };
}
