import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";

export type MarketingLinkVariant =
  | "default"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "email"
  | "carmunity";

/** utm_source values aligned with `resolve-marketing-source` / UTM parsing. */
const UTM_BY_VARIANT: Record<Exclude<MarketingLinkVariant, "default">, string> =
  {
    instagram: "instagram",
    facebook: "facebook",
    linkedin: "linkedin",
    email: "email",
    carmunity: "carmunity",
  };

export function buildTrackedAuctionUrl(
  origin: string,
  auctionId: string,
  variant: MarketingLinkVariant,
  utmCampaignOverride?: string | null
): string {
  const path = `/auctions/${auctionId}`;
  const base = `${origin.replace(/\/$/, "")}${path}`;

  if (variant === "default") return base;

  const utmSource = UTM_BY_VARIANT[variant];
  const utmMedium =
    variant === "email" ? "email" : variant === "carmunity" ? "community" : "social";

  const utmCampaign =
    utmCampaignOverride?.trim() || `listing_${auctionId}`;

  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
  });

  return `${base}?${params.toString()}`;
}

export type MarketingLinkKit = Record<MarketingLinkVariant, string>;

export function buildMarketingLinkKit(
  auctionId: string,
  origin?: string,
  utmCampaignOverride?: string | null
): MarketingLinkKit {
  const o = origin ?? getPublicSiteOrigin();
  const c = utmCampaignOverride ?? null;
  return {
    default: buildTrackedAuctionUrl(o, auctionId, "default"),
    instagram: buildTrackedAuctionUrl(o, auctionId, "instagram", c),
    facebook: buildTrackedAuctionUrl(o, auctionId, "facebook", c),
    linkedin: buildTrackedAuctionUrl(o, auctionId, "linkedin", c),
    email: buildTrackedAuctionUrl(o, auctionId, "email", c),
    carmunity: buildTrackedAuctionUrl(o, auctionId, "carmunity", c),
  };
}
