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
  variant: MarketingLinkVariant
): string {
  const path = `/auctions/${auctionId}`;
  const base = `${origin.replace(/\/$/, "")}${path}`;

  if (variant === "default") return base;

  const utmSource = UTM_BY_VARIANT[variant];
  const utmMedium =
    variant === "email" ? "email" : variant === "carmunity" ? "community" : "social";

  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: `listing_${auctionId}`,
  });

  return `${base}?${params.toString()}`;
}

export type MarketingLinkKit = Record<MarketingLinkVariant, string>;

export function buildMarketingLinkKit(
  auctionId: string,
  origin?: string
): MarketingLinkKit {
  const o = origin ?? getPublicSiteOrigin();
  return {
    default: buildTrackedAuctionUrl(o, auctionId, "default"),
    instagram: buildTrackedAuctionUrl(o, auctionId, "instagram"),
    facebook: buildTrackedAuctionUrl(o, auctionId, "facebook"),
    linkedin: buildTrackedAuctionUrl(o, auctionId, "linkedin"),
    email: buildTrackedAuctionUrl(o, auctionId, "email"),
    carmunity: buildTrackedAuctionUrl(o, auctionId, "carmunity"),
  };
}
