# Marketing Phase 22 — Admin marketing summary tooling

**Date:** 2026-03-30  
**Scope:** **Admin-only**, **read-only** platform marketing dashboard. **No** schema migrations, **no** seller marketing page redesigns, **no** auction/bid/buy-now/campaign/community mutation paths.

---

## What was added

| Area | Detail |
|------|--------|
| **Route** | **`/admin/marketing`** — `app/(admin)/admin/marketing/page.tsx` (`dynamic = "force-dynamic"`). |
| **Data** | **`getAdminMarketingPlatformSummary()`** in **`lib/marketing/get-admin-marketing-platform-summary.ts`**. |
| **Discovery** | Card link from **`app/(admin)/admin/page.tsx`** → Marketing summary. |

---

## Helper: `getAdminMarketingPlatformSummary`

- **`marketingFeatureEnabled`** — **`isMarketingEnabled()`** (env flag).
- **Totals:** `TrafficEvent` row count; counts for **VIEW** / **SHARE_CLICK** / **BID_CLICK**; **`AuctionAnalytics`** sums (views, share clicks) + day-row count; campaign **total** + **ACTIVE** count; **`Notification`** rows whose `type` starts with **`MARKETING_NOTIFICATION_PREFIX`**.
- **Top auctions (15):** raw SQL `GROUP BY auctionId` by event volume, enriched with **`getViewShareTotalsForAuctionIds`**, bid-click groupBy, and auction title/status/seller handle.
- **Top sellers (15):** raw SQL join **`TrafficEvent` → `Auction`**, `GROUP BY sellerId`, handle from **`User`**.
- **Recent campaigns (12):** `prisma.campaign.findMany` ordered by **`updatedAt` desc**, with auction title and seller handle.

---

## Admin page UI

- KPI grid for the totals above; banner when marketing feature flag is off.
- Tables: **Top listings** (engagement), **Top sellers**, **Recent campaigns** (status, type, seller, listing link).
- **Links:** **`/auctions/[id]`** and **`/u/[handle]`** (public listing + profile) only — no owner-only seller marketing URLs.

---

## Admin-only protection

Unchanged from existing admin surface:

- **`middleware.ts`** — **`/admin/*`** requires session with **`role === ADMIN`**.
- **`app/(admin)/admin/layout.tsx`** — **`getSession()`**; non-admin → redirect sign-in.

No new auth primitives; the marketing page inherits the admin layout.

---

## Seller-facing impact

**None.** Seller routes, components, and commerce actions were not modified for this phase (aside from **admin home** adding one staff-only link card).

---

## PR 23 (exact next best step)

Implemented as **Phase 23** — see **`MARKETING_PHASE_23_NOTES.md`**. **PR 24:** optional **admin CSV snapshot** or extra read-only breakdowns (e.g. **EXTERNAL_REFERRAL** in windows).
