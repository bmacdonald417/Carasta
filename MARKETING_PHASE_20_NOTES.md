# Marketing Phase 20 — Seller marketing CSV export / reporting

**Date:** 2026-03-30  
**Scope:** **Seller-only**, **on-demand** CSV downloads for marketing overview listings, single-auction marketing detail, and campaigns. **No** PDF/XLSX, **no** scheduled delivery, **no** stored reports, **no** schema change.

---

## Exports

| Export | Route | UI entry |
|--------|--------|----------|
| **Listings (overview)** | **`GET /api/u/[handle]/marketing/export/auctions`** | Marketing overview → **Your Listings** → **Export listings CSV** |
| **Campaigns** | **`GET /api/u/[handle]/marketing/export/campaigns`** | Marketing overview → **Campaigns** → **Export CSV** |
| **Single auction** | **`GET /api/u/[handle]/marketing/export/auctions/[auctionId]`** | Listing marketing page → **Export CSV** (header) |

## Protection

- **`MARKETING_ENABLED`** — off → **404** JSON (same as marketing pages).
- **Session** — not signed in → **401** `{ ok: false }`.
- **Ownership** — URL **`handle`** must match the signed-in user (by id); otherwise **404** `{ ok: false }`.
- **Auction CSV** — **`getSellerMarketingAuctionDetail`** enforces **`sellerId`**; missing/wrong auction → **404**.

## Response

- **`Content-Type: text/csv; charset=utf-8`**
- **UTF-8 BOM** prefix for Excel-friendly open.
- **`Content-Disposition: attachment`** with a safe filename.

## CSV scope / limitations

- **Overview listings:** Up to **`SELLER_MARKETING_AUCTION_EXPORT_LIMIT` (500)** rows, same shape as overview cards + **active campaign count** (status **ACTIVE** only).
- **Campaigns:** Up to **2000** rows, newest **`updatedAt`** first.
- **Auction file:** Wide table; **`section`** column distinguishes **`summary`**, **`totals`**, **`by_source`**, **`by_event_type`**, **`share_target`**, **`recent_event`** (last 50), **`linked_promo_post`**, **`campaign`**. See **`lib/marketing/export-seller-auction-marketing-csv.ts`**.

## Code layout

| Piece | Path |
|--------|------|
| CSV escaping | **`lib/marketing/csv-utils.ts`** |
| Auth gate | **`lib/marketing/marketing-export-auth.ts`** |
| Builders | **`export-seller-marketing-overview-csv.ts`**, **`export-seller-auction-marketing-csv.ts`**, **`export-seller-campaigns-csv.ts`** |
| Campaign list helper | **`getSellerCampaignsForExport`** in **`get-seller-campaigns.ts`** |
| Row limit hook | **`getSellerMarketingAuctionRows(..., { limit })`** in **`get-seller-marketing-auction-rows.ts`** |

## PR 21 (implemented)

**UX polish:** **`MARKETING_PHASE_21_NOTES.md`**.

## PR 22 (suggested next step)

Next roadmap product slice — **one PR**.
