# Marketing Phase 24 — Admin marketing CSV exports

**Date:** 2026-03-30  
**Scope:** **ADMIN**-only CSV downloads aligned with **`/admin/marketing`**. **No** schema changes, **no** seller surfaces, **no** commerce actions.

---

## Routes

| Method | Path | File |
|--------|------|------|
| **GET** | **`/api/admin/marketing/export/summary`** | `app/api/admin/marketing/export/summary/route.ts` |
| **GET** | **`/api/admin/marketing/export/tops-last-7`** | `app/api/admin/marketing/export/tops-last-7/route.ts` |

Responses: **`text/csv; charset=utf-8`**, UTF-8 BOM, **`Content-Disposition: attachment`**, filename stamp `admin-marketing-summary-YYYYMMDDTHHMMZ.csv` / `admin-marketing-tops-last-7-…csv`, **`Cache-Control: no-store`**.

---

## Auth

**`requireAdminMarketingCsvAccess()`** (`lib/marketing/admin-marketing-export-auth.ts`): **`getSession()`** from **`lib/auth`** and **`session.user.role === "ADMIN"`**. Otherwise **401** JSON `{ "ok": false }`.

**Note:** **`middleware.ts`** only matches **`/admin/:path*`** (pages), not **`/api/admin/*`**, so API routes must enforce admin themselves (same idea as seller CSV routes enforcing ownership).

---

## CSV contents

**Summary** (`buildAdminMarketingSummaryCsv`): three-column **`scope`**, **`metric`**, **`value`**.

- **`meta`:** `exported_at_iso`, `marketing_feature_enabled`
- **`all_time`:** traffic row count, VIEW / SHARE_CLICK / BID_CLICK, rollup view/share sums, `AuctionAnalytics` day-row count, campaigns total/active, marketing notification total
- **`last_7_days` / `last_30_days`:** window traffic + campaign updated/created + marketing notifications created (same semantics as dashboard)

**Tops last 7** (`buildAdminMarketingTopsLast7Csv`): block title row, header row, data rows for top listings; blank line; block title, headers, rows for top sellers (matches on-page tables).

Data source: **`getAdminMarketingPlatformSummary()`** (fresh query per download).

---

## UI

**`app/(admin)/admin/marketing/page.tsx`** — two outline **Export** buttons next to the page title ( **`Button` + `Download`** icon, same pattern as seller marketing CSV links).

---

## PR 25

Implemented as **Phase 25** — **`MARKETING_PHASE_25_NOTES.md`**.

## PR 26 (suggested next step)

**`GET /api/admin/marketing/snapshot.json`** (ADMIN session) mirroring **`getAdminMarketingPlatformSummary`**, or documented client beacon for **EXTERNAL_REFERRAL** on listing landings — still read-only / low-risk.
