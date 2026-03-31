# Marketing Phase 23 — Admin time-bounded marketing aggregates

**Date:** 2026-03-30  
**Scope:** **Admin-only** rolling **7-** and **30-day** marketing metrics on **`/admin/marketing`**. **No** Prisma schema changes, **no** seller or core commerce edits.

---

## Helper changes (`get-admin-marketing-platform-summary.ts`)

| Addition | Behavior |
|----------|----------|
| **`AdminMarketingRecentWindow`** | `trafficEventRows`, `viewEvents`, `shareClickEvents`, `bidClickEvents`, `campaignsUpdated` (`updatedAt >= cutoff`), `campaignsCreated` (`createdAt >= cutoff`), `marketingNotificationsCreated` (type prefix + `createdAt`). |
| **`loadRecentWindow(cutoff)`** | Single cutoff → one parallel batch of counts + `TrafficEvent.groupBy` by `eventType`. |
| **`recentActivity`** | `{ last7Days, last30Days }` using rolling windows from **server `Date.now()`** (168h / 720h). |
| **`AdminMarketingTopAuctionWindowRow`** | Per-listing **7-day** `TrafficEvent` totals + VIEW / SHARE_CLICK / BID_CLICK in window (not rollups). |
| **`topAuctionsLast7Days` / `topSellersLast7Days`** | Top **10** by raw event volume in 7 days (`$queryRaw` + same enrichment patterns as lifetime tops). |

Lifetime totals and **all-time** top tables are unchanged in meaning; the summary type now includes the new fields.

---

## Page changes (`admin/marketing/page.tsx`)

1. **Recent activity** — bordered section with **Last 7 days** and **Last 30 days** stat panels (same metrics as `AdminMarketingRecentWindow`).
2. **All-time platform totals** — existing KPI card grid (label added).
3. **Last 7 days — leaders** — two tables: top listings (window breakdown) and top sellers.
4. **All-time leaders** — existing lifetime top listings / sellers (subtitles note **lifetime**).
5. **Recent campaign updates** — unchanged.

---

## PR 24

Implemented as **Phase 24** — **`MARKETING_PHASE_24_NOTES.md`**.

## PR 25 (suggested next step)

Add **EXTERNAL_REFERRAL** (and other event types) to admin window stats and CSV, or a small **admin marketing JSON** endpoint for integrations — still read-only and admin-only.
