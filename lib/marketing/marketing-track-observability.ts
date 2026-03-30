/**
 * Lightweight observability for **`POST /api/marketing/track`**.
 *
 * - **In-memory counters** (per Node instance): outcome × eventType × authMode — bounded key space.
 * - **Structured logs** (`console.info`): anomalies by default; **every** request when
 *   **`MARKETING_TRACK_OBSERVABILITY_VERBOSE=1`** (or `true`).
 *
 * **Privacy:** No IPs, user ids, auction ids, visitorKey, or raw body. Optional **`source`**
 * is the normalized enum string from the validated body only.
 *
 * @see `MARKETING_PHASE_17_NOTES.md`
 */

export type MarketingTrackObserveOutcome =
  | "feature_disabled"
  | "body_parse_failed"
  | "validation_failed"
  | "route_rate_limited"
  | "auction_not_found"
  | "event_deduped"
  | "event_inserted"
  | "server_error";

export type MarketingTrackEventLabel = "VIEW" | "SHARE_CLICK" | "BID_CLICK";

export type MarketingTrackAuthMode = "authenticated" | "anonymous" | "unknown";

export type MarketingTrackObserveContext = {
  outcome: MarketingTrackObserveOutcome;
  /** Set when known from validated body or Prisma path. */
  eventType?: MarketingTrackEventLabel;
  authMode: MarketingTrackAuthMode;
  /** `MarketingTrafficSource` string when client sent `source` on a validated body. */
  source?: string;
};

const counter = new Map<string, number>();

function counterKey(c: MarketingTrackObserveContext): string {
  const et = c.eventType ?? "_";
  return `${c.outcome}|${et}|${c.authMode}`;
}

function isVerboseLogging(): boolean {
  const v = process.env.MARKETING_TRACK_OBSERVABILITY_VERBOSE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

/**
 * Outcomes that emit a log line **without** verbose mode (client/ops anomalies only).
 * `event_inserted`, `route_rate_limited`, and `event_deduped` are **counter-only** by default
 * to avoid log volume on hot paths.
 */
function shouldLogLine(outcome: MarketingTrackObserveOutcome): boolean {
  if (isVerboseLogging()) return true;
  return (
    outcome === "feature_disabled" ||
    outcome === "body_parse_failed" ||
    outcome === "validation_failed" ||
    outcome === "auction_not_found" ||
    outcome === "server_error"
  );
}

/**
 * Record one request outcome (counters + optional structured log).
 */
export function observeMarketingTrackRequest(ctx: MarketingTrackObserveContext): void {
  const key = counterKey(ctx);
  counter.set(key, (counter.get(key) ?? 0) + 1);

  if (!shouldLogLine(ctx.outcome)) return;

  const payload: Record<string, string> = {
    outcome: ctx.outcome,
    authMode: ctx.authMode,
  };
  if (ctx.eventType) payload.eventType = ctx.eventType;
  if (ctx.source) payload.source = ctx.source;

  console.info("[marketing-track]", JSON.stringify(payload));
}

/**
 * Snapshot of in-memory counters for this process (e.g. debugging, future metrics wiring).
 * Keys are `outcome|eventType|authMode` with `eventType` `_` when unknown.
 */
export function getMarketingTrackObservabilitySnapshot(): Record<string, number> {
  const out: Record<string, number> = {};
  const keys = Array.from(counter.keys()).sort();
  for (const k of keys) {
    out[k] = counter.get(k) ?? 0;
  }
  return out;
}
