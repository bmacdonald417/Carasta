# Marketing Phase 17 — Observability for `/api/marketing/track`

**Date:** 2026-03-30  
**Scope:** **Lightweight** structured logging + **per-process in-memory counters** for the marketing track route. **No** schema, **no** new telemetry vendors, **no** change to HTTP status bodies or seller UI.

---

## What was added

| Piece | Path |
|--------|------|
| Helper | **`lib/marketing/marketing-track-observability.ts`** |
| Instrumentation | **`app/api/marketing/track/route.ts`** |

## Outcomes tracked

| `outcome` | When | Default log line? |
|-----------|------|-------------------|
| **`feature_disabled`** | `MARKETING_ENABLED` off → **204** | Yes |
| **`body_parse_failed`** | Invalid JSON → **400** | Yes |
| **`validation_failed`** | Zod reject → **400** | Yes |
| **`route_rate_limited`** | In-app limiter → **200** `{ ok: true }` | No (counter only) |
| **`auction_not_found`** | Unknown `auctionId` → **400** | Yes |
| **`event_deduped`** | `recordTrafficEvent` returned `skipped: true` → **200** | No (counter only) |
| **`event_inserted`** | New `TrafficEvent` row → **200** | No (counter only) |
| **`server_error`** | Uncaught → **500** | Yes |

**Dimensions (when known):** `eventType` (`VIEW` | `SHARE_CLICK` | `BID_CLICK`), `authMode` (`authenticated` | `anonymous` | `unknown`), optional **`source`** (validated `MarketingTrafficSource` string — never raw payload).

## Env vars

| Variable | Effect |
|----------|--------|
| **`MARKETING_TRACK_OBSERVABILITY_VERBOSE=1`** (or `true` / `yes`) | Emit **`console.info`** for **every** outcome (including inserts, dedupe, rate limit). **High volume** — use staging or short windows. |

If unset, hot paths stay **counter-only** for logs; aggregate by reading **`getMarketingTrackObservabilitySnapshot()`** in-process (debugging / future wiring — not exposed as an HTTP route in this PR).

## Log format

Single line, grep-friendly prefix:

```text
[marketing-track] {"outcome":"validation_failed","authMode":"anonymous"}
```

## Limitations

- **Per-instance:** Counters are **not** shared across horizontal replicas (same caveat as Phase 12 limiter).
- **Dedupe visibility** requires **`recordTrafficEvent`** return value — implemented **without** changing insert/dedupe semantics.
- **No** IPs, user ids, auction ids, or `visitorKey` in logs (by design).
- **`insert_failed`** is not distinct from **`server_error`** here (Prisma errors surface as **500** + `server_error`).

## PR 18 (suggested next step)

**Product or ops slice:** e.g. **seller marketing dashboard refinements**, **TrafficEvent retention / privacy operator doc**, or a **small protected admin read-only** metrics route that returns JSON from **`getMarketingTrackObservabilitySnapshot()`** — **one PR**, still no auction/bid/community core changes.
