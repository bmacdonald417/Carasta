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
  submitFeedbackSchema,
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
    const { broadcastBidUpdate, broadcastActivityEvent } = await import("@/lib/pusher");
    const live = await getAuctionLiveData(parsed.data.auctionId);
    if (live) broadcastBidUpdate(parsed.data.auctionId, live);
    const { prisma } = await import("@/lib/db");
    const auction = await prisma.auction.findUnique({
      where: { id: parsed.data.auctionId },
      select: { title: true, endAt: true },
    });
    if (auction) {
      broadcastActivityEvent({
        type: "new_bid",
        auctionId: parsed.data.auctionId,
        auctionTitle: auction.title,
        timestamp: new Date().toISOString(),
      });
      const hoursLeft = (auction.endAt.getTime() - Date.now()) / (60 * 60 * 1000);
      if (hoursLeft > 0 && hoursLeft < 24) {
        broadcastActivityEvent({
          type: "ending_soon",
          auctionId: parsed.data.auctionId,
          auctionTitle: auction.title,
          timestamp: new Date().toISOString(),
        });
      }
    }
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
    const { broadcastBidUpdate, broadcastActivityEvent } = await import("@/lib/pusher");
    const live = await getAuctionLiveData(parsed.data.auctionId);
    if (live) broadcastBidUpdate(parsed.data.auctionId, live);
    const { prisma } = await import("@/lib/db");
    const auction = await prisma.auction.findUnique({
      where: { id: parsed.data.auctionId },
      select: { title: true, endAt: true },
    });
    if (auction) {
      broadcastActivityEvent({
        type: "new_bid",
        auctionId: parsed.data.auctionId,
        auctionTitle: auction.title,
        timestamp: new Date().toISOString(),
      });
      const hoursLeft = (auction.endAt.getTime() - Date.now()) / (60 * 60 * 1000);
      if (hoursLeft > 0 && hoursLeft < 24) {
        broadcastActivityEvent({
          type: "ending_soon",
          auctionId: parsed.data.auctionId,
          auctionTitle: auction.title,
          timestamp: new Date().toISOString(),
        });
      }
    }
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

export async function submitAuctionFeedback(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };

  const parsed = submitFeedbackSchema.safeParse({
    auctionId: formData.get("auctionId"),
    rating: formData.get("rating"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const { prisma } = await import("@/lib/db");
  const { applyReputationEvent } = await import("@/lib/reputation");
  const userId = (session.user as any).id;

  const auction = await prisma.auction.findUnique({
    where: { id: parsed.data.auctionId },
    select: {
      id: true,
      status: true,
      sellerId: true,
      buyerId: true,
      buyNowPriceCents: true,
      reservePriceCents: true,
    },
  });

  if (!auction) return { ok: false, error: "Auction not found." };
  if (auction.status !== "SOLD" || !auction.buyerId) {
    return { ok: false, error: "Feedback is only allowed after a completed sale." };
  }

  const isBuyer = userId === auction.buyerId;
  const isSeller = userId === auction.sellerId;
  if (!isBuyer && !isSeller) {
    return { ok: false, error: "Only the buyer or seller can leave feedback." };
  }

  const toUserId = isBuyer ? auction.sellerId : auction.buyerId;

  const existing = await prisma.auctionFeedback.findUnique({
    where: {
      auctionId_fromUserId: {
        auctionId: parsed.data.auctionId,
        fromUserId: userId,
      },
    },
  });
  if (existing) return { ok: false, error: "You have already left feedback for this auction." };

  await prisma.auctionFeedback.create({
    data: {
      auctionId: parsed.data.auctionId,
      fromUserId: userId,
      toUserId,
      rating: parsed.data.rating as "POSITIVE" | "NEGATIVE",
      note: parsed.data.note?.trim() || null,
    },
  });

  const salePriceCents = auction.buyNowPriceCents ?? auction.reservePriceCents ?? 0;
  const eventType = parsed.data.rating === "POSITIVE" ? "POSITIVE_FEEDBACK" : "NEGATIVE_FEEDBACK";
  await applyReputationEvent({
    userId: toUserId,
    type: eventType,
    salePriceCents,
    meta: { auctionId: auction.id },
  });

  revalidatePath(`/auctions/${parsed.data.auctionId}`);
  return { ok: true };
}
