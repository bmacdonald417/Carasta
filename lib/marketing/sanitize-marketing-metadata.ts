import { MarketingTrafficEventType } from "@prisma/client";

/**
 * Per-field caps (chars). URLs/referrer may be long; everything else stays small.
 *
 * @see `TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md` — what may appear in persisted `TrafficEvent.metadata`
 */
const MAX_LEN: Record<string, number> = {
  path: 512,
  shareTarget: 64,
  bidUiSurface: 48,
  currentUrl: 2048,
  referrer: 2048,
};

/** Hard cap on total characters stored across all metadata string values. */
const MAX_METADATA_STRING_CHARS_TOTAL = 4096;

function keysForEvent(eventType: MarketingTrafficEventType): readonly string[] {
  switch (eventType) {
    case MarketingTrafficEventType.VIEW:
      return ["path", "referrer", "currentUrl"];
    case MarketingTrafficEventType.SHARE_CLICK:
      return ["path", "referrer", "currentUrl", "shareTarget"];
    case MarketingTrafficEventType.BID_CLICK:
      return ["path", "referrer", "currentUrl", "bidUiSurface"];
    default:
      return [];
  }
}

function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max);
}

/**
 * Keeps only event-appropriate, low-cardinality string fields.
 * Never trusts client-supplied `visitorKey` here — the server injects a normalized key separately.
 */
export function sanitizeMarketingMetadata(
  eventType: MarketingTrafficEventType,
  meta: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!meta) return undefined;

  const allowed = keysForEvent(eventType);
  const out: Record<string, unknown> = {};
  let totalChars = 0;

  for (const key of allowed) {
    const v = meta[key];
    if (typeof v !== "string") continue;

    let s = v.trim();
    if (!s) continue;

    const max = MAX_LEN[key] ?? 512;
    s = clip(s, max);

    if (key === "shareTarget" || key === "bidUiSurface") {
      s = s.toLowerCase();
    }

    if (totalChars + s.length > MAX_METADATA_STRING_CHARS_TOTAL) break;
    totalChars += s.length;
    out[key] = s;
  }

  return Object.keys(out).length ? out : undefined;
}
