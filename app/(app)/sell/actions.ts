"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ConditionGrade, Prisma } from "@prisma/client";
import {
  createAuctionSchema,
  createAuctionDraftSchema,
  type CreateAuctionInput,
  type CreateAuctionDraftInput,
} from "@/lib/validations/auction";

/** Imperfection in new format. Legacy: string[] also supported. */
type ImperfectionInput =
  | { location: string; description: string; severity: "minor" | "moderate" | "major" }[]
  | string[];

function toImperfectionsJson(
  imperfections: ImperfectionInput | undefined
): Prisma.InputJsonValue | undefined {
  if (!imperfections?.length) return undefined;
  return imperfections as unknown as Prisma.InputJsonValue;
}

export async function createAuction(input: CreateAuctionInput) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const parsed = createAuctionSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ");
    return { ok: false, error: msg };
  }

  const data = parsed.data;
  const sellerId = (session.user as any).id;
  const buyNowExpiresAt =
    data.buyNowPriceCents != null ? data.buyNowExpiresAt : null;

  const auction = await prisma.$transaction(async (tx) => {
    const a = await tx.auction.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description ?? null,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim ?? null,
        mileage: data.mileage ?? null,
        vin: data.vin ?? null,
        reservePriceCents: data.reservePriceCents ?? null,
        buyNowPriceCents: data.buyNowPriceCents ?? null,
        buyNowExpiresAt,
        startAt: data.startAt,
        endAt: data.endAt,
        status: "LIVE",
        conditionGrade: data.conditionGrade ?? null,
        conditionSummary: data.conditionSummary ?? null,
        imperfections: toImperfectionsJson(data.imperfections as ImperfectionInput),
      },
    });

    if (data.imageUrls.length > 0) {
      await tx.auctionImage.createMany({
        data: data.imageUrls.map((url, i) => ({
          auctionId: a.id,
          url,
          sortOrder: i,
        })),
      });
    }

    if (data.damageImages?.length) {
      await tx.auctionDamageImage.createMany({
        data: data.damageImages.map((d) => ({
          auctionId: a.id,
          label: d.label,
          imageUrl: d.imageUrl,
        })),
      });
    }

    return a;
  });

  // CONDITION_REPORT_QUALITY applied when auction transitions SOLD (see executeBuyNow)
  // TODO: when bid-based auction ends SOLD, apply CONDITION_REPORT_QUALITY there

  revalidatePath("/auctions");
  return { ok: true, auctionId: auction.id };
}

export async function saveAuctionDraft(input: CreateAuctionDraftInput) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const parsed = createAuctionDraftSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join("; ");
    return { ok: false, error: msg };
  }

  const data = parsed.data;
  const sellerId = (session.user as any).id;
  const startAt = data.startAt ?? new Date();
  const endAt = data.endAt ?? new Date(startAt.getTime() + 7 * 24 * 60 * 60 * 1000);
  const buyNowExpiresAt =
    data.buyNowPriceCents != null && data.startAt
      ? new Date(data.startAt.getTime() + 24 * 60 * 60 * 1000)
      : null;

  const auction = await prisma.$transaction(async (tx) => {
    const a = await tx.auction.create({
      data: {
        sellerId,
        title: data.title.trim() || "Untitled listing",
        description: data.description ?? null,
        year: data.year,
        make: data.make.trim() || "TBD",
        model: data.model.trim() || "TBD",
        trim: data.trim ?? null,
        mileage: data.mileage ?? null,
        vin: data.vin ?? null,
        reservePriceCents: data.reservePriceCents ?? null,
        buyNowPriceCents: data.buyNowPriceCents ?? null,
        buyNowExpiresAt,
        startAt,
        endAt,
        status: "DRAFT",
        conditionGrade: data.conditionGrade ?? null,
        conditionSummary: data.conditionSummary ?? null,
        imperfections: toImperfectionsJson(data.imperfections as ImperfectionInput),
      },
    });

    if (data.imageUrls?.length) {
      await tx.auctionImage.createMany({
        data: data.imageUrls.map((url, i) => ({
          auctionId: a.id,
          url,
          sortOrder: i,
        })),
      });
    }

    if (data.damageImages?.length) {
      await tx.auctionDamageImage.createMany({
        data: data.damageImages.map((d) => ({
          auctionId: a.id,
          label: d.label,
          imageUrl: d.imageUrl,
        })),
      });
    }

    return a;
  });

  revalidatePath("/sell");
  return { ok: true, auctionId: auction.id };
}
