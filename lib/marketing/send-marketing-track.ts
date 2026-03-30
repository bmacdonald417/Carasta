import type { MarketingTrackPayload } from "@/lib/marketing/track-payload-types";

const VISITOR_KEY_STORAGE = "carasta_mk_v1";

export function getOrCreateMarketingVisitorKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let k = window.sessionStorage.getItem(VISITOR_KEY_STORAGE);
    if (!k || k.length < 8) {
      k =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
      window.sessionStorage.setItem(VISITOR_KEY_STORAGE, k);
    }
    return k;
  } catch {
    return "";
  }
}

/**
 * Fire-and-forget marketing track. Never throws; safe to call from UI.
 */
export function sendMarketingTrack(payload: MarketingTrackPayload): void {
  if (typeof window === "undefined") return;

  const visitorKey = payload.visitorKey || getOrCreateMarketingVisitorKey();
  const bodyObj = {
    auctionId: payload.auctionId,
    eventType: payload.eventType,
    visitorKey: visitorKey.length >= 8 ? visitorKey : undefined,
    metadata: {
      ...payload.metadata,
      ...(visitorKey.length >= 8 ? { visitorKey } : {}),
    },
  };

  try {
    const body = JSON.stringify(bodyObj);
    const blob = new Blob([body], { type: "application/json" });
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const ok = navigator.sendBeacon("/api/marketing/track", blob);
      if (ok) return;
    }
    void fetch("/api/marketing/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // silent
  }
}
