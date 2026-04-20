"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const patchSchema = z
  .object({
    auctionId: z.string().min(1),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(20000).optional().nullable(),
    conditionSummary: z.string().max(8000).optional().nullable(),
  })
  .refine(
    (d) =>
      d.title !== undefined ||
      d.description !== undefined ||
      d.conditionSummary !== undefined,
    { message: "Nothing to update." }
  );

/**
 * Seller-only: update title/description/conditionSummary for DRAFT auctions (My Listings AI apply).
 */
export async function updateDraftListingCopy(input: unknown) {
  const session = await getSession();
  const sellerId = (session?.user as { id?: string } | undefined)?.id;
  if (!sellerId) return { ok: false as const, error: "Sign in required." };

  const parsed = patchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues.map((e) => e.message).join("; "),
    };
  }

  const { auctionId, title, description, conditionSummary } = parsed.data;

  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { id: true, status: true, seller: { select: { handle: true } } },
  });
  if (!auction) return { ok: false as const, error: "Listing not found." };
  if (auction.status !== "DRAFT") {
    return {
      ok: false as const,
      error: "Only draft listings can be updated from here. Live listings cannot be edited in bulk yet.",
    };
  }

  const data: {
    title?: string;
    description?: string | null;
    conditionSummary?: string | null;
  } = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (conditionSummary !== undefined) data.conditionSummary = conditionSummary;

  await prisma.auction.update({
    where: { id: auctionId },
    data,
  });

  const handle = auction.seller.handle;
  revalidatePath(`/u/${handle}/listings`);
  revalidatePath(`/auctions/${auctionId}`);
  revalidatePath("/auctions");

  return { ok: true as const };
}
