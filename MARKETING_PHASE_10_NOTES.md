# Marketing Phase 10 — Ingestion hardening

**Date:** 2026-03-30  
**Scope:** Tighter **dedupe windows**, explicit **dedupe keys**, **event-scoped metadata** sanitization, **visitorKey** normalization, and clearer **retention / prune** operations. **No** schema changes, **no** Redis, **no** seller marketing UI changes, **no** auction/bid/buy-now/campaign/community server action changes.

---

## Throttle / dedupe (database-window)

Constants live in `lib/marketing/track-marketing-event-server.ts` (exported for tests/docs).

| Event | Window | Identity |
|--------|--------|----------|
| **VIEW** (logged-in) | **60s** | `auctionId` + `userId` |
| **VIEW** (anonymous) | **90s** | `auctionId` + `userId` null + `metadata.visitorKey` (server-injected, normalized) |
| **SHARE_CLICK** | **8s** | Same as VIEW, plus **`shareTarget`** in metadata |
| **BID_CLICK** | **12s** | Same as VIEW, plus **`bidUiSurface`** in metadata |

**Semantics preserved:** skipped duplicates still return **`{ ok: true }`** from the HTTP API (existing behavior); rollup increment only runs on insert.

**VIEW without `userId` and without a usable `visitorKey`:** still **not** deduped (cannot attribute safely). Client normally supplies a sessionStorage key via `sendMarketingTrack`.

**Sampling:** **Not implemented.** Throttle-only keeps seller metrics easy to explain and avoids under-counting views without a clear product rule. Revisit only if raw `TrafficEvent` volume forces it.

---

## Metadata guardrails

### Request validation (`lib/validations/marketing.ts`)

- At most **12** metadata keys.
- Keys: `[a-zA-Z][a-zA-Z0-9_]{0,63}`.
- Values: **strings only**, each ≤ **4096** chars (non-strings rejected).

### Persistence (`lib/marketing/sanitize-marketing-metadata.ts`)

Allowed keys depend on **`eventType`**:

| Event | Allowed keys |
|--------|----------------|
| **VIEW** | `path`, `referrer`, `currentUrl` |
| **SHARE_CLICK** | `path`, `referrer`, `currentUrl`, `shareTarget` |
| **BID_CLICK** | `path`, `referrer`, `currentUrl`, `bidUiSurface` |

- Strings are **trimmed**; empty strings dropped.
- `shareTarget` and `bidUiSurface` stored **lowercase**.
- Per-field max lengths: `path` 512, `shareTarget` 64, `bidUiSurface` 48, `currentUrl`/`referrer` 2048.
- **Total** stored string characters across metadata (before adding server `visitorKey`) capped at **4096**; excess fields are skipped in insertion order.

**`visitorKey`:** Never taken from client `metadata` for persistence. The API body’s top-level `visitorKey` is normalized in `visitor-key.ts` and merged server-side into `metadata` for dedupe/query only.

---

## Visitor key normalization (`lib/marketing/visitor-key.ts`)

- Strip ASCII control characters.
- Trim, collapse **whitespace** (removed entirely for a stable token), **lowercase**, slice to **128** chars, minimum length **8** or treated as absent.

---

## Retention / prune

| Variable | Role | Default |
|----------|------|---------|
| `TRAFFIC_EVENT_PRUNE_ENABLED` | Required **`true`** for **destructive** prune | — |
| `TRAFFIC_EVENT_RETENTION_DAYS` | Delete rows older than this many days | **365** |
| `TRAFFIC_EVENT_PRUNE_DRY_RUN` | If `true`, count only (same as CLI `--dry-run`) | — |

**Scripts:**

- **Dry-run (no enable flag):** `npm run marketing:prune-traffic-events:dry-run` or `npx ts-node -P tsconfig.scripts.json scripts/prune-traffic-events.ts --dry-run`
- **Delete:** `TRAFFIC_EVENT_PRUNE_ENABLED=true` + `npm run marketing:prune-traffic-events`
- **Optional:** `--days 180` on the script CLI overrides retention for that run.

**Never** runs on app startup. After large deletes, see Phase 6 notes on **AuctionAnalytics** alignment / backfill.

---

## Known limitations

- Dedupe is still **single-DB**, not distributed (same as Phase 2).
- No IP-based limiting in-app (privacy + scope); **PR 11** may add edge/WAF guidance.
- Anonymous VIEW without visitorKey remains a possible spam path; mitigated by client key generation when storage works.

---

## PR 11 (next best step)

Choose **one** slice: **structured `Post.auctionId`** (optional FK) for Carmunity/listing linkage, **or** **edge / WAF rate limiting** documentation + config for `POST /api/marketing/track`, **or** optional **BID_CLICK** rollup column if daily aggregates should match raw intent volume.
