import {
  MarketingTrafficSource,
  MarketingTrafficEventType,
} from "@prisma/client";

export function formatMarketingDateTime(d: Date): string {
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatMarketingDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function marketingSourceLabel(source: MarketingTrafficSource): string {
  switch (source) {
    case MarketingTrafficSource.DIRECT:
      return "Direct / typed URL";
    case MarketingTrafficSource.INSTAGRAM:
      return "Instagram";
    case MarketingTrafficSource.FACEBOOK:
      return "Facebook";
    case MarketingTrafficSource.LINKEDIN:
      return "LinkedIn";
    case MarketingTrafficSource.TIKTOK:
      return "TikTok";
    case MarketingTrafficSource.EMAIL:
      return "Email";
    case MarketingTrafficSource.CARMUNITY:
      return "Carmunity / community";
    case MarketingTrafficSource.UNKNOWN:
      return "Unknown";
    default:
      return source;
  }
}

export function marketingEventTypeLabel(
  eventType: MarketingTrafficEventType
): string {
  switch (eventType) {
    case MarketingTrafficEventType.VIEW:
      return "Page view";
    case MarketingTrafficEventType.SHARE_CLICK:
      return "Share click";
    case MarketingTrafficEventType.BID_CLICK:
      return "Bid click";
    case MarketingTrafficEventType.EXTERNAL_REFERRAL:
      return "External referral";
    default:
      return eventType;
  }
}

/** Human label for bid-intent metadata from the auction detail client. */
export function marketingBidUiSurfaceLabel(surface: string): string {
  switch (surface) {
    case "quick_bid":
      return "Quick bid";
    case "custom_bid":
      return "Custom bid";
    case "auto_bid":
      return "Auto-bid";
    case "signup_cta":
      return "Sign up to bid";
    default:
      return surface || "—";
  }
}

export function shareTargetLabel(target: string): string {
  switch (target) {
    case "twitter":
      return "X (Twitter)";
    case "facebook":
      return "Facebook";
    case "linkedin":
      return "LinkedIn";
    case "copy_link":
      return "Copy link";
    default:
      return target;
  }
}
