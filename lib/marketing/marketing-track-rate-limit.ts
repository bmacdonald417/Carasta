/**
 * Best-effort, in-memory rate limiting for `POST /api/marketing/track`.
 *
 * **Role:** Burst/noise guard *before* DB dedupe (`track-marketing-event-server`). Does not
 * replace per-event dedupe windows; complements them for obvious abuse.
 *
 * **Limits (per-instance only):** Not coordinated across serverless instances or horizontal
 * scale — each replica has its own counters. Still useful to cap per-node load and catch
 * runaway clients; production should also use edge/WAF limits (**`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`**).
 *
 * **Key:** Client IP (from proxy headers when present) + optional authenticated `userId`
 * (JWT sub), so NAT’d browsers don’t all share one anonymous bucket when logged in.
 */

export type MarketingTrackEventType =
  | "VIEW"
  | "SHARE_CLICK"
  | "BID_CLICK"
  | "EXTERNAL_REFERRAL";

/** Fixed windows aligned to wall clock (simple eviction). */
const WINDOW_MS = 10_000;

const LIMITS: Record<MarketingTrackEventType, number> = {
  VIEW: 45,
  SHARE_CLICK: 18,
  BID_CLICK: 18,
  EXTERNAL_REFERRAL: 30,
};

type WindowCounts = {
  view: number;
  share: number;
  bid: number;
  externalReferral: number;
};

const store = new Map<string, WindowCounts>();

function windowStart(now: number): number {
  return Math.floor(now / WINDOW_MS) * WINDOW_MS;
}

function fieldForEvent(
  eventType: MarketingTrackEventType
): keyof WindowCounts {
  switch (eventType) {
    case "VIEW":
      return "view";
    case "SHARE_CLICK":
      return "share";
    case "BID_CLICK":
      return "bid";
    case "EXTERNAL_REFERRAL":
      return "externalReferral";
  }
}

function pruneStore(now: number): void {
  const oldestKeep = windowStart(now) - WINDOW_MS;
  for (const key of Array.from(store.keys())) {
    const ws = Number(key.split("\0")[2]);
    if (!Number.isFinite(ws) || ws < oldestKeep) {
      store.delete(key);
    }
  }
}

/**
 * Conservative client IP for rate limiting (first hop in X-Forwarded-For when present).
 */
export function getMarketingTrackClientIp(req: {
  headers: Headers;
}): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 128);
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);
  return null;
}

export type MarketingTrackRateLimitResult = {
  allowed: boolean;
};

/**
 * @param ip - From `getMarketingTrackClientIp`; null uses bucket key `unknown`.
 * @param userId - JWT sub when logged in; null uses `anon` in the key.
 */
export function checkMarketingTrackRateLimit(
  ip: string | null,
  userId: string | null,
  eventType: MarketingTrackEventType
): MarketingTrackRateLimitResult {
  const now = Date.now();
  const ws = windowStart(now);
  const ipPart = ip?.trim() || "unknown";
  const idPart = userId?.trim() || "anon";
  const mapKey = `${ipPart}\0${idPart}\0${ws}`;

  if (store.size > 8000) {
    pruneStore(now);
  }

  let entry = store.get(mapKey);
  if (!entry) {
    entry = { view: 0, share: 0, bid: 0, externalReferral: 0 };
    store.set(mapKey, entry);
  }

  const field = fieldForEvent(eventType);
  const limit = LIMITS[eventType];
  if (entry[field] >= limit) {
    return { allowed: false };
  }
  entry[field] += 1;
  return { allowed: true };
}
