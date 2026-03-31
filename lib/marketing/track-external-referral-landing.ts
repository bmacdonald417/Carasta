import { sendMarketingTrack } from "@/lib/marketing/send-marketing-track";

/**
 * Known paid/ads click-id query keys (lowercase). Presence indicates a likely
 * external paid landing; we do not store these values in TrafficEvent metadata
 * (only path/referrer/currentUrl per sanitize rules).
 */
export const EXTERNAL_MARKETING_CLICK_ID_PARAMS = [
  "gclid",
  "fbclid",
  "msclkid",
  /** X / Twitter Ads click id — same conservative key-only detection as other entries. */
  "twclid",
] as const;

const CLICK_ID_SET = new Set<string>(EXTERNAL_MARKETING_CLICK_ID_PARAMS);

/**
 * True when the current URL query includes any utm_* parameter (case-insensitive keys).
 * Conservative campaign / external link signal for optional EXTERNAL_REFERRAL beacons.
 */
export function urlHasUtmAttributionParams(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of Array.from(p.keys())) {
      if (k.toLowerCase().startsWith("utm_")) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * True when the query includes a supported click-id parameter (case-insensitive key).
 * See EXTERNAL_MARKETING_CLICK_ID_PARAMS.
 */
export function urlHasClickIdAttributionParams(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = new URLSearchParams(window.location.search);
    for (const k of Array.from(p.keys())) {
      if (CLICK_ID_SET.has(k.toLowerCase())) return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * True when the URL should trigger the default auction-detail EXTERNAL_REFERRAL beacon:
 * any utm_* param OR a supported click-id param.
 */
export function urlHasExternalMarketingAttributionParams(): boolean {
  return (
    urlHasUtmAttributionParams() || urlHasClickIdAttributionParams()
  );
}

/**
 * Fire-and-forget EXTERNAL_REFERRAL for an auction landing (same transport as sendMarketingTrack).
 *
 * When to call: only with an explicit external-attribution signal (e.g. UTM or click-id on URL,
 * or a custom integration). See MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md.
 *
 * VIEW still fires separately where listing VIEW tracking runs; this event is additive for
 * attribution, not a replacement for VIEW.
 */
export function sendMarketingTrackExternalReferralLanding(params: {
  auctionId: string;
  visitorKey?: string;
}): void {
  sendMarketingTrack({
    auctionId: params.auctionId,
    eventType: "EXTERNAL_REFERRAL",
    visitorKey: params.visitorKey,
    metadata: {
      path: typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer:
        typeof document !== "undefined" && document.referrer
          ? document.referrer
          : undefined,
      currentUrl:
        typeof window !== "undefined" ? window.location.href : undefined,
    },
  });
}
