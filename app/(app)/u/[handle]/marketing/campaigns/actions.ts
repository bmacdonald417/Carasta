"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import {
  marketingCampaignFormSchema,
  parseOptionalDatetimeInput,
} from "@/lib/validations/campaign";

type ActionResult = { ok: true } | { ok: false; error: string };

async function loadMarketingOwner(handle: string) {
  if (!isMarketingEnabled()) return null;
  const session = await getSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user || user.id !== (session.user as any).id) return null;
  return user;
}

async function assertSellerOwnsAuction(sellerId: string, auctionId: string) {
  const auction = await prisma.auction.findFirst({
    where: { id: auctionId, sellerId },
    select: { id: true },
  });
  return !!auction;
}

function revalidateMarketingPaths(handle: string, auctionId: string) {
  const base = `/u/${handle}/marketing`;
  revalidatePath(base);
  revalidatePath(`${base}/campaigns`);
  revalidatePath(`${base}/auctions/${auctionId}`);
}

export async function createMarketingCampaign(
  handle: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const parsed = marketingCampaignFormSchema.safeParse({
    name: formData.get("name"),
    auctionId: formData.get("auctionId"),
    type: formData.get("type"),
    status: formData.get("status"),
    startAt: parseOptionalDatetimeInput(formData.get("startAt")),
    endAt: parseOptionalDatetimeInput(formData.get("endAt")),
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(" ");
    return { ok: false, error: msg || "Invalid input." };
  }

  const data = parsed.data;
  const owns = await assertSellerOwnsAuction(user.id, data.auctionId);
  if (!owns) return { ok: false, error: "That listing is not yours." };

  await prisma.campaign.create({
    data: {
      userId: user.id,
      auctionId: data.auctionId,
      name: data.name,
      type: data.type,
      status: data.status,
      startAt: data.startAt ?? null,
      endAt: data.endAt ?? null,
    },
  });

  revalidateMarketingPaths(handle, data.auctionId);
  return { ok: true };
}

export async function updateMarketingCampaign(
  handle: string,
  campaignId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: user.id },
    select: { auctionId: true },
  });
  if (!existing) return { ok: false, error: "Campaign not found." };

  const parsed = marketingCampaignFormSchema.safeParse({
    name: formData.get("name"),
    auctionId: formData.get("auctionId"),
    type: formData.get("type"),
    status: formData.get("status"),
    startAt: parseOptionalDatetimeInput(formData.get("startAt")),
    endAt: parseOptionalDatetimeInput(formData.get("endAt")),
  });

  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(" ");
    return { ok: false, error: msg || "Invalid input." };
  }

  const data = parsed.data;
  const owns = await assertSellerOwnsAuction(user.id, data.auctionId);
  if (!owns) return { ok: false, error: "That listing is not yours." };

  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      auctionId: data.auctionId,
      name: data.name,
      type: data.type,
      status: data.status,
      startAt: data.startAt ?? null,
      endAt: data.endAt ?? null,
    },
  });

  revalidateMarketingPaths(handle, data.auctionId);
  if (existing.auctionId !== data.auctionId) {
    revalidateMarketingPaths(handle, existing.auctionId);
  }
  return { ok: true };
}

export async function deleteMarketingCampaign(
  handle: string,
  campaignId: string
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const existing = await prisma.campaign.findFirst({
    where: { id: campaignId, userId: user.id },
    select: { auctionId: true },
  });
  if (!existing) return { ok: false, error: "Campaign not found." };

  await prisma.campaign.delete({ where: { id: campaignId } });

  revalidateMarketingPaths(handle, existing.auctionId);
  return { ok: true };
}
