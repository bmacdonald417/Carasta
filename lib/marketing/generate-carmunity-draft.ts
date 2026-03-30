import type { MarketingLinkKit } from "@/lib/marketing/build-marketing-links";
import { generateSellerShareCopy } from "@/lib/marketing/generate-share-copy";

/** Use the community UTM link in draft copy so Carmunity traffic is attributed consistently. */
function rewriteListingUrlsToCarmunity(
  text: string,
  kit: MarketingLinkKit
): string {
  const carmunity = kit.carmunity;
  const others = [
    kit.default,
    kit.instagram,
    kit.facebook,
    kit.linkedin,
    kit.email,
  ].filter((u) => u && u !== carmunity);
  let out = text;
  for (const u of others) {
    out = out.split(u).join(carmunity);
  }
  return out;
}

export const CARMUNITY_PROMO_TEMPLATES = [
  "new_listing",
  "ending_soon",
  "featured",
] as const;

export type CarmunityPromoTemplate = (typeof CARMUNITY_PROMO_TEMPLATES)[number];

type AuctionDraftInput = {
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  mileage: number | null;
  status: string;
  endAt: Date;
  highBidCents: number;
};

export type CarmunityDraftPack = {
  defaultTemplate: CarmunityPromoTemplate;
  promoHeadline: string;
  listingUrl: string;
  hashtagsLine: string;
  primaryImageUrl: string | null;
  templates: Record<
    CarmunityPromoTemplate,
    { label: string; description: string; body: string }
  >;
};

/**
 * Deterministic Carmunity post drafts from listing facts + tracked community link.
 * Reuses `generateSellerShareCopy` so tone stays aligned with Share & Promote.
 */
export function generateCarmunityDraft(input: {
  auction: AuctionDraftInput;
  links: MarketingLinkKit;
  primaryImageUrl: string | null;
}): CarmunityDraftPack {
  const share = generateSellerShareCopy(input.auction, input.links);
  const listingUrl = input.links.carmunity;
  const vehicle = [
    input.auction.year,
    input.auction.make,
    input.auction.model,
    input.auction.trim?.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const rawBodies: Record<CarmunityPromoTemplate, string> = {
    new_listing: [
      `Sharing with Carmunity — ${vehicle} just went live on Carasta.`,
      "",
      share.longCaption.trim(),
      "",
      share.hashtagsLine,
    ].join("\n"),
    ending_soon: [share.endingSoonCaption.trim(), "", share.hashtagsLine].join(
      "\n"
    ),
    featured: [
      `Spotlight pick — ${input.auction.title}.`,
      "",
      `This ${vehicle} is up for auction on Carasta — worth a look if you're hunting something special.`,
      "",
      `Listing (with photos & details):\n${listingUrl}`,
      "",
      share.hashtagsLine,
    ].join("\n"),
  };

  const templates: CarmunityDraftPack["templates"] = {
    new_listing: {
      label: "New listing",
      description: "Announce a fresh live auction to the community.",
      body: rewriteListingUrlsToCarmunity(rawBodies.new_listing, input.links),
    },
    ending_soon: {
      label: "Ending soon",
      description: "Urgency-focused; best when the clock is running down.",
      body: rewriteListingUrlsToCarmunity(rawBodies.ending_soon, input.links),
    },
    featured: {
      label: "Featured pick",
      description: "Highlight a standout listing in an enthusiast tone.",
      body: rewriteListingUrlsToCarmunity(rawBodies.featured, input.links),
    },
  };

  return {
    defaultTemplate: "new_listing",
    promoHeadline: vehicle || input.auction.title,
    listingUrl,
    hashtagsLine: share.hashtagsLine,
    primaryImageUrl: input.primaryImageUrl,
    templates,
  };
}
