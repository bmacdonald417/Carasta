"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { marketingPresetFormSchema } from "@/lib/validations/marketing-preset";

type ActionResult = { ok: true } | { ok: false; error: string };

async function loadMarketingOwner(handle: string) {
  if (!isMarketingEnabled()) return null;
  const session = await getSession();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user || user.id !== (session.user as { id: string }).id) return null;
  return user;
}

function revalidatePresetPaths(handle: string) {
  revalidatePath(`/u/${handle}/marketing`);
  revalidatePath(`/u/${handle}/marketing/presets`);
  revalidatePath(`/u/${handle}/marketing/auctions`);
}

function parsePresetForm(formData: FormData) {
  return marketingPresetFormSchema.safeParse({
    name: formData.get("name"),
    source: formData.get("source"),
    medium: formData.get("medium"),
    campaignLabel: formData.get("campaignLabel") ?? undefined,
    copyVariant: formData.get("copyVariant"),
    includeHashtags: formData.get("includeHashtags") === "on",
    includeKeywords: formData.get("includeKeywords") === "on",
    isDefault: formData.get("isDefault") === "on",
  });
}

export async function createMarketingPreset(
  handle: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const parsed = parsePresetForm(formData);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(" ");
    return { ok: false, error: msg || "Invalid input." };
  }

  const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (d.isDefault) {
      await tx.marketingPreset.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    await tx.marketingPreset.create({
      data: {
        userId: user.id,
        name: d.name,
        source: d.source,
        medium: d.medium,
        campaignLabel: d.campaignLabel ?? null,
        copyVariant: d.copyVariant,
        includeHashtags: d.includeHashtags,
        includeKeywords: d.includeKeywords,
        isDefault: d.isDefault,
      },
    });
  });

  revalidatePresetPaths(handle);
  return { ok: true };
}

export async function updateMarketingPreset(
  handle: string,
  presetId: string,
  formData: FormData
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const existing = await prisma.marketingPreset.findFirst({
    where: { id: presetId, userId: user.id },
  });
  if (!existing) return { ok: false, error: "Preset not found." };

  const parsed = parsePresetForm(formData);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join(" ");
    return { ok: false, error: msg || "Invalid input." };
  }

  const d = parsed.data;

  await prisma.$transaction(async (tx) => {
    if (d.isDefault) {
      await tx.marketingPreset.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    await tx.marketingPreset.update({
      where: { id: presetId },
      data: {
        name: d.name,
        source: d.source,
        medium: d.medium,
        campaignLabel: d.campaignLabel ?? null,
        copyVariant: d.copyVariant,
        includeHashtags: d.includeHashtags,
        includeKeywords: d.includeKeywords,
        isDefault: d.isDefault,
      },
    });
  });

  revalidatePresetPaths(handle);
  return { ok: true };
}

export async function deleteMarketingPreset(
  handle: string,
  presetId: string
): Promise<ActionResult> {
  const user = await loadMarketingOwner(handle);
  if (!user) return { ok: false, error: "Not allowed." };

  const res = await prisma.marketingPreset.deleteMany({
    where: { id: presetId, userId: user.id },
  });
  if (res.count === 0) return { ok: false, error: "Preset not found." };

  revalidatePresetPaths(handle);
  return { ok: true };
}
