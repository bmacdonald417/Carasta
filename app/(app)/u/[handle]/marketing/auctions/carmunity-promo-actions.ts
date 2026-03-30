"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";

const MAX_CAPTION_LENGTH = 8_000;

export async function publishCarmunityPromoPost(input: {
  handle: string;
  auctionId: string;
  content: string;
  includeAuctionImage: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isMarketingEnabled()) {
    return { ok: false, error: "Marketing is not available." };
  }

  const session = await getSession();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to publish." };
  }

  const userId = (session.user as { id: string }).id;
  const owner = await prisma.user.findUnique({
    where: { handle: input.handle.toLowerCase() },
    select: { id: true },
  });
  if (!owner || owner.id !== userId) {
    return { ok: false, error: "Not allowed." };
  }

  const auction = await prisma.auction.findFirst({
    where: { id: input.auctionId, sellerId: userId },
    select: {
      id: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });
  if (!auction) {
    return { ok: false, error: "Listing not found." };
  }

  const content = input.content.trim();
  if (content.length > MAX_CAPTION_LENGTH) {
    return { ok: false, error: "Caption is too long." };
  }

  const imageUrl =
    input.includeAuctionImage && auction.images[0]?.url
      ? auction.images[0].url
      : null;

  if (!content && !imageUrl) {
    return {
      ok: false,
      error: "Add a caption or include the listing photo.",
    };
  }

  await prisma.post.create({
    data: {
      authorId: userId,
      auctionId: auction.id,
      content: content || null,
      imageUrl,
    },
  });

  revalidatePath("/explore");
  revalidatePath(`/u/${input.handle}/marketing/auctions/${input.auctionId}`);
  return { ok: true };
}
