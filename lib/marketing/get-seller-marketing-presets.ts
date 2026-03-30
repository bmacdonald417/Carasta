import { prisma } from "@/lib/db";
import type { MarketingPreset } from "@prisma/client";

export async function getMarketingPresetsForUser(
  userId: string
): Promise<MarketingPreset[]> {
  return prisma.marketingPreset.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
}

export async function getMarketingPresetForSellerEdit(
  userId: string,
  presetId: string
): Promise<MarketingPreset | null> {
  return prisma.marketingPreset.findFirst({
    where: { id: presetId, userId },
  });
}
