import { MarketingTrafficSource } from "@prisma/client";

/** Best-effort UTM / referrer mapping; defaults to UNKNOWN when uncertain. */
export function inferMarketingSourceFromSignals(input: {
  explicit?: MarketingTrafficSource;
  currentUrl?: string;
  referrer?: string;
}): MarketingTrafficSource {
  if (
    input.explicit &&
    input.explicit !== MarketingTrafficSource.UNKNOWN
  ) {
    return input.explicit;
  }

  try {
    if (input.currentUrl) {
      const url = new URL(input.currentUrl);
      const utm = (
        url.searchParams.get("utm_source") || ""
      ).toLowerCase();
      const fromUtm = mapUtmFragment(utm);
      if (fromUtm) return fromUtm;
    }
  } catch {
    // ignore malformed URL
  }

  try {
    if (input.referrer) {
      const host = new URL(input.referrer).hostname.toLowerCase();
      if (host.includes("facebook.com") || host.includes("fb.com")) {
        return MarketingTrafficSource.FACEBOOK;
      }
      if (host.includes("instagram.com")) {
        return MarketingTrafficSource.INSTAGRAM;
      }
      if (host.includes("tiktok.com")) {
        return MarketingTrafficSource.TIKTOK;
      }
      if (host.includes("linkedin.com") || host.includes("lnkd.in")) {
        return MarketingTrafficSource.LINKEDIN;
      }
      if (
        host.includes("t.co") ||
        host.includes("twitter.com") ||
        host.includes("x.com")
      ) {
        return MarketingTrafficSource.UNKNOWN;
      }
    }
  } catch {
    // ignore
  }

  return MarketingTrafficSource.UNKNOWN;
}

function mapUtmFragment(
  raw: string
): MarketingTrafficSource | null {
  if (!raw) return null;
  if (raw.includes("facebook") || raw === "fb") {
    return MarketingTrafficSource.FACEBOOK;
  }
  if (raw.includes("instagram") || raw === "ig") {
    return MarketingTrafficSource.INSTAGRAM;
  }
  if (raw.includes("linkedin")) {
    return MarketingTrafficSource.LINKEDIN;
  }
  if (raw.includes("tiktok")) {
    return MarketingTrafficSource.TIKTOK;
  }
  if (
    raw.includes("email") ||
    raw.includes("newsletter") ||
    raw === "mail"
  ) {
    return MarketingTrafficSource.EMAIL;
  }
  if (raw.includes("carmunity") || raw.includes("explore")) {
    return MarketingTrafficSource.CARMUNITY;
  }
  return null;
}
