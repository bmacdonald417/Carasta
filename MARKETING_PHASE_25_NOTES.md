# Marketing Phase 25 — EXTERNAL_REFERRAL for admin analytics

**Date:** 2026-03-30  
**Scope:** **EXTERNAL_REFERRAL** end-to-end for **ingest + admin reporting**. **No** new Prisma enum migration — **`MarketingTrafficEventType.EXTERNAL_REFERRAL`** already existed in schema.

---

## Schema

**Unchanged** — enum value was already defined; no migration.

---

## Ingestion (`POST /api/marketing/track`)

| Piece | Change |
|-------|--------|
| **`lib/validations/marketing.ts`** | **`eventType`** includes **`EXTERNAL_REFERRAL`**. |
| **`app/api/marketing/track/route.ts`** | Maps body string to **`MarketingTrafficEventType.EXTERNAL_REFERRAL`**. |
| **`lib/marketing/marketing-track-rate-limit.ts`** | **`EXTERNAL_REFERRAL`** bucket (limit **30** / 10s window per IP+user key). |
| **`lib/marketing/marketing-track-observability.ts`** | **`MarketingTrackEventLabel`** includes **`EXTERNAL_REFERRAL`**. |
| **`lib/marketing/sanitize-marketing-metadata.ts`** | Allowed keys: **path**, **referrer**, **currentUrl** (same as VIEW). |
| **`lib/marketing/track-marketing-event-server.ts`** | Dedupe via **`findRecentUserOrVisitorKeyedDuplicate`** (VIEW uses it too); **60s / 90s** windows for EXTERNAL_REFERRAL; **no** **`AuctionAnalytics`** rollup for this type (unchanged rollup rules). |

---

## Admin read path

**`lib/marketing/get-admin-marketing-platform-summary.ts`**

- **`totals.externalReferralEvents`** — all-time count from global **`groupBy` eventType**.
- **`AdminMarketingRecentWindow.externalReferralEvents`** — **`loadRecentWindow`**.
- **`AdminMarketingTopAuctionRow.externalReferrals`** — **`groupBy`** per top lifetime auction.
- **`AdminMarketingTopAuctionWindowRow.externalReferralEvents`** — from existing 7d **`auctionId`+`eventType`** breakdown.

---

## CSV

- **`export-admin-marketing-summary-csv.ts`** — **`external_referral_events`** for **all_time**, **last_7_days**, **last_30_days**.
- **`export-admin-marketing-tops-last-7-csv.ts`** — **`external_referral_events`** column on top listings block.

---

## Admin UI

**`app/(admin)/admin/marketing/page.tsx`** — **External referral events** in **Recent activity** panels and all-time KPIs; **Ext ref** column on **last 7 days** and **lifetime** top-listings tables.

---

## Seller-facing UI

**Unchanged** — seller marketing pages were not edited. Listing drill-downs that already iterate **`MarketingTrafficEventType`** will include **EXTERNAL_REFERRAL** in type breakdowns when rows exist (**`get-seller-marketing-auction-detail`** uses **`Object.values(MarketingTrafficEventType)`**).

---

## PR 26 (exact next best step)

Add **`GET /api/admin/marketing/snapshot.json`** with **`requireAdminMarketingCsvAccess`**-style auth, **`JSON`** body from **`getAdminMarketingPlatformSummary()`** (dates as ISO strings), for BI/tools — **or** ship a tiny client **`trackExternalReferral`** + runbook note for UTM/referrer landings.
