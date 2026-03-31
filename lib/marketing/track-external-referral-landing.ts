import { sendMarketingTrack } from "@/lib/marketing/send-marketing-track";

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
 * Fire-and-forget EXTERNAL_REFERRAL for an auction landing (same transport as sendMarketingTrack).
 *
 * When to call: only with an explicit external-attribution signal (e.g. UTM on URL, or a custom
 * integration). See MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md.
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
