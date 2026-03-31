# Marketing Phase 26 — Admin marketing JSON snapshot

**Date:** 2026-03-30  
**Scope:** **`GET /api/admin/marketing/snapshot`** — same aggregates as **`/admin/marketing`**, **JSON** for tools/BI. **No** schema change, **no** seller commerce changes.

---

## Route

| Method | Path | Handler |
|--------|------|---------|
| **GET** | **`/api/admin/marketing/snapshot`** | `app/api/admin/marketing/snapshot/route.ts` |

**Headers (200 / 304):** **`ETag`**, **`Cache-Control: private, max-age=15`**. **200** also sets **`Content-Type: application/json; charset=utf-8`**.

**Conditional GET:** **`If-None-Match`** matching **`ETag`** → **304** empty body (auth still required). **ETag** hashes JSON **without `generatedAt`** so unchanged metrics can revalidate without a full body. See **Phase 28** / **`MARKETING_PHASE_28_NOTES.md`**.

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

## PR 27

Implemented as **Phase 27** — **`MARKETING_PHASE_27_NOTES.md`** and **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`**.

## PR 28

Implemented as **Phase 28** — **`MARKETING_PHASE_28_NOTES.md`**.

## PR 29 (suggested next step)

Optional **`gclid` / `fbclid`** (or similar) alongside UTM in **`AuctionViewTracker`**, or snapshot **Vary** / **Accept** negotiation — still low-risk and documented.
