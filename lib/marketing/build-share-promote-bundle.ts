import type { MarketingPreset } from "@prisma/client";
import {
  buildMarketingLinkKit,
  type MarketingLinkKit,
  type MarketingLinkVariant,
} from "@/lib/marketing/build-marketing-links";
import {
  generateSellerShareCopy,
  type SellerShareAuctionInput,
  type SellerShareCopyPack,
} from "@/lib/marketing/generate-share-copy";
import type { MarketingLinkRowDef } from "@/lib/marketing/share-promote-types";

const SOURCE_TO_VARIANT: Record<string, MarketingLinkVariant> = {
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
  email: "email",
  carmunity: "carmunity",
};

export function marketingLinkRowsFromKit(kit: MarketingLinkKit): MarketingLinkRowDef[] {
  return [
    { label: "Public listing", url: kit.default },
    { label: "Instagram", url: kit.instagram },
    { label: "Facebook", url: kit.facebook },
    { label: "LinkedIn", url: kit.linkedin },
    { label: "Email", url: kit.email },
    { label: "Carmunity", url: kit.carmunity },
  ];
}

export type SharePromotePresetBundlePayload = {
  id: string;
  name: string;
  isDefault: boolean;
  linkRows: MarketingLinkRowDef[];
  copyPack: SellerShareCopyPack;
  copyVariant: "short" | "long" | "ending_soon";
};

/**
 * Deterministic link rows + copy for Share & Promote. Preset applies shared
 * `utm_campaign` across tracked links and aligns caption URLs with `source`.
 */
export function buildSharePromoteBundle(
  auctionId: string,
  auction: SellerShareAuctionInput,
  origin: string,
  preset: MarketingPreset | null
): {
  linkRows: MarketingLinkRowDef[];
  copyPack: SellerShareCopyPack;
  copyVariant: "short" | "long" | "ending_soon" | null;
} {
  const campaign =
    preset?.campaignLabel != null && preset.campaignLabel.trim() !== ""
      ? preset.campaignLabel.trim()
      : null;

  const kit = buildMarketingLinkKit(auctionId, origin, campaign);
  const linkRows = marketingLinkRowsFromKit(kit);

  let captionBaseUrl = kit.default;
  if (preset) {
    const v = SOURCE_TO_VARIANT[preset.source];
    if (v) captionBaseUrl = kit[v];
  }

  const baseCopy = generateSellerShareCopy(auction, kit, {
    captionBaseUrl,
    emailBodyUrl: kit.email,
  });

  const copyPack: SellerShareCopyPack = preset
    ? {
        ...baseCopy,
        hashtagsLine: preset.includeHashtags ? baseCopy.hashtagsLine : "",
        keywordsLine: preset.includeKeywords ? baseCopy.keywordsLine : "",
      }
    : baseCopy;

  const copyVariant = preset
    ? (preset.copyVariant as "short" | "long" | "ending_soon")
    : null;

  return { linkRows, copyPack, copyVariant };
}

export function buildPresetBundlesForAuction(
  auctionId: string,
  auction: SellerShareAuctionInput,
  origin: string,
  presets: MarketingPreset[]
): SharePromotePresetBundlePayload[] {
  return presets.map((p) => {
    const { linkRows, copyPack, copyVariant } = buildSharePromoteBundle(
      auctionId,
      auction,
      origin,
      p
    );
    return {
      id: p.id,
      name: p.name,
      isDefault: p.isDefault,
      linkRows,
      copyPack,
      copyVariant: copyVariant ?? "short",
    };
  });
}
