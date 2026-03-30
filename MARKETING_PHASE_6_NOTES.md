# Marketing Phase 6 — AuctionAnalytics rollups + retention prep

**Date:** 2026-03-30  
**Scope:** Daily rollups for **VIEW** / **SHARE_CLICK**, safer dedupe, hybrid seller reads, manual backfill/prune tooling, **LinkedIn** traffic source. No cron, no auction/bid/buy-now/community/campaign action changes.

---

## Schema & migration

| Change | Detail |
|--------|--------|
| **`AuctionAnalytics`** | `id`, `auctionId`, `day` (`Date` / `@db.Date`, UTC calendar day), `views`, `shareClicks`, `lastEventAt?`, `createdAt`, `updatedAt`; `@@unique([auctionId, day])`, FK `Auction` cascade delete |
| **`MarketingTrafficSource.LINKEDIN`** | `ALTER TYPE ... ADD VALUE 'LINKEDIN'` |

**Migration folder:** `prisma/migrations/20260330200000_marketing_auction_analytics_rollup`

**Deploy:** `npx prisma migrate deploy` (or `db push` in dev), then **`npm run marketing:backfill-analytics`** once so historical `TrafficEvent` rows populate rollups. New events also increment rollups on ingest.

---

## How rollups work

1. **Ingest:** After a **non-skipped** `TrafficEvent` insert for **VIEW** or **SHARE_CLICK**, `tryIncrementAuctionAnalyticsRollup` upserts the UTC **day** row (`lib/marketing/increment-auction-analytics-rollup.ts`). Failures are logged; the API still returns success so tracking is not blocked by rollup errors.

2. **Backfill:** `recomputeAllAuctionAnalyticsFromTrafficEvents()` deletes **all** `AuctionAnalytics` rows, then rebuilds from `TrafficEvent` grouped by `auctionId` + UTC date (`lib/marketing/backfill-auction-analytics.ts`). Idempotent reruns correct drift.

3. **Reads:** `getViewShareTotalsForAuctionIds` sums rollup counts per auction when **any** rollup row exists for that auction; otherwise it falls back to raw `TrafficEvent` counts (pre-backfill / local dev). Used for:

   - Seller marketing overview **total views** / **total share clicks**
   - Overview **auction table** per-listing totals
   - Auction drill-down **headline** totals

   Still read directly from **`TrafficEvent`:** `viewsLast24h`, `viewsLast7d`, **bySource**, **byEventType**, **recentEvents**, **shareTarget** distribution, **lastMarketingActivityAt** (any event type).

---

## Retention policy (recommended)

- **Raw `TrafficEvent`:** Default recommendation **90–365 days** for production (tune by volume); store policy in ops runbooks. This phase does **not** auto-delete in app code.
- **Rollups `AuctionAnalytics`:** Cheap to retain longer; can mirror listing lifecycle or be kept for reporting.
- **After pruning raw events:** Either run **backfill** again so rollups reflect only remaining rows, or accept rollups as cumulative history — document which model you use before first prune.

**Manual prune:** `scripts/prune-traffic-events.ts` — requires `TRAFFIC_EVENT_PRUNE_ENABLED=true`; optional `TRAFFIC_EVENT_PRUNE_DRY_RUN=true`, `TRAFFIC_EVENT_RETENTION_DAYS` (default `365`). Wrapper: `npm run marketing:prune-traffic-events`.

---

## Dedupe / visitor hygiene

- **`normalizeMarketingVisitorKey`:** trim, max 128 chars, minimum length 8 (invalid → treated as absent).
- **VIEW / SHARE_CLICK dedupe:** uses Prisma **JSON path** filters on `metadata` (`visitorKey`, `shareTarget`) instead of scanning a capped batch of rows — fewer missed duplicates under bursty traffic.

No Redis, no new **IP-based** rate limits in this PR (optional follow-on).

---

## LinkedIn source mapping

- **`utm_source`** containing `linkedin` → `LINKEDIN`.
- **Referrer** `linkedin.com`, `lnkd.in` → `LINKEDIN`.
- **`marketingSourceLabel`** updated for UI.

Existing tracked links already use `utm_source=linkedin` in `build-marketing-links.ts`.

---

## Follow-ons (after Phase 7)

Phase 7 added **manual Carmunity promote** from marketing drill-down — see `MARKETING_PHASE_7_NOTES.md`. Remaining ideas for **PR 8+**:

- Saved **UTM presets** (manual apply to copy/links).
- **BID_CLICK** or funnel events (product-gated).
- Optional ingestion **throttle** / sampling if volume grows.
