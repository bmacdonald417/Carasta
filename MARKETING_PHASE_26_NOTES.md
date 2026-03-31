# Marketing Phase 26 — Admin marketing JSON snapshot

**Date:** 2026-03-30  
**Scope:** **`GET /api/admin/marketing/snapshot`** — same aggregates as **`/admin/marketing`**, **JSON** for tools/BI. **No** schema change, **no** seller commerce changes.

---

## Route

| Method | Path | Handler |
|--------|------|---------|
| **GET** | **`/api/admin/marketing/snapshot`** | `app/api/admin/marketing/snapshot/route.ts` |

**Headers:** **`Content-Type: application/json; charset=utf-8`**, **`Cache-Control: no-store`**.

---

## Auth

**`requireAdminMarketingCsvAccess()`** (`lib/marketing/admin-marketing-export-auth.ts`): **`getSession()`** + **`role === ADMIN`**. Otherwise **401** JSON **`{ "ok": false }`**.

**Calling from scripts:** send the same session cookie the browser uses after admin sign-in, or run from a context that can attach **NextAuth** session cookies. **`middleware.ts`** does not match **`/api/admin/*`**, so the route enforces admin itself.

---

## Payload

Built by **`buildAdminMarketingSnapshotJson()`** (`lib/marketing/admin-marketing-snapshot-json.ts`) from **`getAdminMarketingPlatformSummary()`**.

| Field | Description |
|-------|-------------|
| **`ok`** | Always **`true`** on 200. |
| **`generatedAt`** | ISO timestamp when the snapshot was built. |
| **`note`** | Internal-use disclaimer (no public API contract). |
| **`marketingEnabled`** | **`MARKETING_ENABLED`** flag (alias of summary’s **`marketingFeatureEnabled`**). |
| **`totals`** | All-time traffic breakdowns, rollups, campaigns, notifications (**includes `externalReferralEvents`**). |
| **`recentActivity`** | **`last7Days`** / **`last30Days`** window objects (same fields as dashboard, including external referrals). |
| **`topAuctions`** | Lifetime top listings (rollup views/shares + bid/external counts). |
| **`topSellers`** | Lifetime top sellers by event volume. |
| **`topAuctionsLast7Days`** | 7-day top listings with per-type counts. |
| **`topSellersLast7Days`** | 7-day top sellers. |
| **`recentCampaigns`** | Recent campaign rows; **`updatedAt`** is an **ISO string** (only Date serialized in payload). |

IDs and handles are opaque identifiers suitable for joining in BI; **no** seller-only URLs are added. Consumers can build public paths as **`/auctions/{auctionId}`** and **`/u/{handle}`** if needed.

---

## UI

**`/admin/marketing`** — **JSON snapshot** button (new tab) next to CSV exports.

---

## PR 27 (exact next best step)

Publish a short **runbook** (or extend **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`**) for firing **`EXTERNAL_REFERRAL`** on external listing landings, and optionally a **one-line** `fetch('/api/marketing/track', …)` helper in app code — **or** add **ETag** / **`If-None-Match`** on **`/api/admin/marketing/snapshot`** for efficient polling.
