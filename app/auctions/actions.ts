"use server";

import { getSession } from "@/lib/auth";
import { placeBidAndProcess, buyNow } from "@/lib/auction-utils";
import { nextMinBidCents } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const placeBidSchema = z.object({
  auctionId: z.string(),
  amountCents: z.number().int().positive(),
});

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
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

const quickBidSchema = z.object({
  auctionId: z.string(),
  currentHighCents: z.number().int().nonnegative(),
});

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
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

const buyNowSchema = z.object({ auctionId: z.string() });

export async function executeBuyNow(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "You must be signed in." };

  const parsed = buyNowSchema.safeParse({ auctionId: formData.get("auctionId") });
  if (!parsed.success) return { ok: false, error: "Invalid input." };

  const result = await buyNow(parsed.data.auctionId, (session.user as any).id);
  if (result.ok) {
    revalidatePath(`/auctions/${parsed.data.auctionId}`);
    revalidatePath("/auctions");
  }
  return result;
}

const autoBidSchema = z.object({
  auctionId: z.string(),
  maxAmountCents: z.number().int().positive(),
});

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
