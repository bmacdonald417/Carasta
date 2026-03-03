"use server";

import { getSession } from "@/lib/auth";
import { placeBidAndProcess, buyNow } from "@/lib/auction-utils";
import { nextMinBidCents } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import {
  placeBidSchema,
  quickBidSchema,
  buyNowSchema,
  autoBidSchema,
} from "@/lib/validations/auction";

export async function placeBid(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in to bid." };

  const parsed = placeBidSchema.safeParse({
    auctionId: formData.get("auctionId"),
    amountCents: Number(formData.get("amountCents")),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const result = await placeBidAndProcess(
    parsed.data.auctionId,
    (session.user as any).id,
    parsed.data.amountCents
  );
  if (result.ok) {
    const { getAuctionLiveData } = await import("@/lib/auction-utils");
    const { broadcastBidUpdate } = await import("@/lib/pusher");
    const live = await getAuctionLiveData(parsed.data.auctionId);
    if (live) broadcastBidUpdate(parsed.data.auctionId, live);
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

export async function quickBid(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in to bid." };

  const parsed = quickBidSchema.safeParse({
    auctionId: formData.get("auctionId"),
    currentHighCents: Number(formData.get("currentHighCents")),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const amountCents = nextMinBidCents(parsed.data.currentHighCents);
  const result = await placeBidAndProcess(
    parsed.data.auctionId,
    (session.user as any).id,
    amountCents
  );
  if (result.ok) {
    const { getAuctionLiveData } = await import("@/lib/auction-utils");
    const { broadcastBidUpdate } = await import("@/lib/pusher");
    const live = await getAuctionLiveData(parsed.data.auctionId);
    if (live) broadcastBidUpdate(parsed.data.auctionId, live);
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

export async function executeBuyNow(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };

  const parsed = buyNowSchema.safeParse({ auctionId: formData.get("auctionId") });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const result = await buyNow(parsed.data.auctionId, (session.user as any).id);
  if (result.ok) {
    const buyerId = (session.user as any).id;
    const { prisma } = await import("@/lib/db");
    const { applyReputationEvent, computeConditionQuality } = await import("@/lib/reputation");

    const auction = await prisma.auction.findUnique({
      where: { id: parsed.data.auctionId },
      include: { damageImages: true },
    });
    if (auction && auction.sellerId && auction.buyerId) {
      const salePriceCents = auction.buyNowPriceCents ?? auction.reservePriceCents ?? 0;
      const meta = { auctionId: auction.id };

      await Promise.all([
        applyReputationEvent({ userId: buyerId, type: "PAYMENT_VERIFIED", salePriceCents, meta }),
        applyReputationEvent({ userId: auction.sellerId, type: "PAYMENT_VERIFIED", salePriceCents, meta }),
        applyReputationEvent({ userId: buyerId, type: "PURCHASE_COMPLETED", salePriceCents, meta }),
        applyReputationEvent({ userId: auction.sellerId, type: "SALE_COMPLETED", salePriceCents, meta }),
      ]);

      const qualityPts = computeConditionQuality(auction);
      if (qualityPts > 0) {
        await applyReputationEvent({
          userId: auction.sellerId,
          type: "CONDITION_REPORT_QUALITY",
          basePoints: qualityPts,
          meta: { auctionId: auction.id },
        });
      }
    }

    const { getAuctionLiveData } = await import("@/lib/auction-utils");
    const { broadcastBidUpdate } = await import("@/lib/pusher");
    const live = await getAuctionLiveData(parsed.data.auctionId);
    if (live) broadcastBidUpdate(parsed.data.auctionId, live);
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

export async function setAutoBid(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };

  const parsed = autoBidSchema.safeParse({
    auctionId: formData.get("auctionId"),
    maxAmountCents: Number(formData.get("maxAmountCents")),
  });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const { prisma } = await import("@/lib/db");
  const auction = await prisma.auction.findUnique({
    where: { id: parsed.data.auctionId },
    include: { bids: { orderBy: { amountCents: "desc" }, take: 1 } },
  });
  if (!auction || auction.status !== "LIVE") return { ok: false, error: "Auction not found or not live." };
  const currentHigh = auction.bids[0]?.amountCents ?? 0;
  if (parsed.data.maxAmountCents <= currentHigh) {
    return { ok: false, error: "Max bid must be higher than current high bid." };
  }

  await prisma.autoBid.upsert({
    where: {
      auctionId_bidderId: {
        auctionId: parsed.data.auctionId,
        bidderId: (session.user as any).id,
      },
    },
    create: {
      auctionId: parsed.data.auctionId,
      bidderId: (session.user as any).id,
      maxAmountCents: parsed.data.maxAmountCents,
      active: true,
    },
    update: { maxAmountCents: parsed.data.maxAmountCents, active: true },
  });

  revalidatePath(`/auctions/${parsed.data.auctionId}`);
  return { ok: true };
}
