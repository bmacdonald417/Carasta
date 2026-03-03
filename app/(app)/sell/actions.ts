"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

type CreateInput = {
  title: string;
  description?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  vin?: string;
  reservePriceCents?: number;
  buyNowPriceCents?: number;
  buyNowExpiresAt?: Date;
  startAt: Date;
  endAt: Date;
  imageUrls: string[];
};

export async function createAuction(input: CreateInput) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const sellerId = (session.user as any).id;
  const buyNowExpiresAt =
    input.buyNowPriceCents != null ? input.buyNowExpiresAt : null;

  const auction = await prisma.auction.create({
    data: {
      sellerId,
      title: input.title,
      description: input.description ?? null,
      year: input.year,
      make: input.make,
      model: input.model,
      trim: input.trim ?? null,
      mileage: input.mileage ?? null,
      vin: input.vin ?? null,
      reservePriceCents: input.reservePriceCents ?? null,
      buyNowPriceCents: input.buyNowPriceCents ?? null,
      buyNowExpiresAt,
      startAt: input.startAt,
      endAt: input.endAt,
      status: "LIVE",
    },
  });

  if (input.imageUrls.length > 0) {
    await prisma.auctionImage.createMany({
      data: input.imageUrls.map((url, i) => ({
        auctionId: auction.id,
        url,
        sortOrder: i,
      })),
    });
  }

  revalidatePath("/auctions");
  return { ok: true, auctionId: auction.id };
}

export async function saveAuctionDraft(
  input: Omit<CreateInput, "startAt" | "endAt"> & { startAt?: Date; endAt?: Date }
) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const sellerId = (session.user as any).id;
  const buyNowExpiresAt =
    input.buyNowPriceCents != null && input.startAt
      ? new Date(input.startAt.getTime() + 24 * 60 * 60 * 1000)
      : null;

  const startAt = input.startAt ?? new Date();
  const endAt = input.endAt ?? new Date(startAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  const auction = await prisma.auction.create({
    data: {
      sellerId,
      title: input.title.trim() || "Untitled listing",
      description: input.description ?? null,
      year: input.year,
      make: input.make.trim() || "TBD",
      model: input.model.trim() || "TBD",
      trim: input.trim ?? null,
      mileage: input.mileage ?? null,
      vin: input.vin ?? null,
      reservePriceCents: input.reservePriceCents ?? null,
      buyNowPriceCents: input.buyNowPriceCents ?? null,
      buyNowExpiresAt,
      startAt,
      endAt,
      status: "DRAFT",
    },
  });

  if (input.imageUrls?.length) {
    await prisma.auctionImage.createMany({
      data: input.imageUrls.map((url, i) => ({
        auctionId: auction.id,
        url,
        sortOrder: i,
      })),
    });
  }

  revalidatePath("/sell");
  return { ok: true, auctionId: auction.id };
}
