# Auction search & discovery — architecture

**Status:** Production path uses **PostgreSQL + Prisma** behind a stable **service layer** and **`GET /api/auctions/search`**. The same contract supports the Next.js **web** UI and future **mobile** clients without response shapes that embed HTML or server-only types.

## Layers

| Layer | Location | Role |
|--------|----------|------|
| **Service** | `lib/search/auction-search-service.ts` | `AuctionSearchInput` → `AuctionSearchResult`; builds `Prisma.AuctionWhereInput` via `buildAuctionSearchWhere()`; executes `searchAuctions()`. |
| **HTTP API** | `app/api/auctions/search/route.ts` | Query-string → input mapping; JSON response; **USD dollars** for `priceMin` / `priceMax` converted to **cents** internally. |
| **Web UI** | `app/(marketing)/auctions/page.tsx` + `auction-filters.tsx` | Server Component calls `searchAuctions()`; URL query params stay in sync with filters (pagination resets when filters change). |

## API contract (`GET /api/auctions/search`)

### Success (`200`)

```json
{
  "ok": true,
  "results": [
    {
      "id": "…",
      "title": "…",
      "year": 1999,
      "make": "…",
      "model": "…",
      "trim": null,
      "status": "LIVE",
      "endAt": "…ISO…",
      "startAt": "…ISO…",
      "createdAt": "…ISO…",
      "reservePriceCents": null,
      "buyNowPriceCents": 5000000,
      "mileage": 45000,
      "conditionGrade": "EXCELLENT",
      "locationZip": "90210",
      "latitude": null,
      "longitude": null,
      "highBidCents": 1200000,
      "bidCount": 3,
      "images": [{ "id": "…", "url": "…", "sortOrder": 0 }],
      "seller": { "handle": "…" }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 24,
    "total": 42,
    "highBidSortTruncated": false
  },
  "meta": {
    "engine": "prisma",
    "applied": { }
  }
}
```

- **`results`**: JSON-serializable only (ISO date strings, numbers, no Prisma types).
- **`pagination.highBidSortTruncated`**: `true` when sort is **`HIGHEST_BID`** and the filtered row count exceeds the in-memory scan cap (see service constant). Clients should show a disclaimer or refine filters.
- **`meta.applied`**: Echo of resolved filters for debugging (not a substitute for request validation docs).

### Error (`500`)

```json
{ "ok": false, "error": "search_failed" }
```

### Query parameters

| Param | Notes |
|-------|--------|
| `q` / `query` | Substring match on title / make / model (case-insensitive). |
| `make`, `model` | Exact match (case-insensitive). |
| `yearMin`, `yearMax` | Inclusive. |
| `priceMin`, `priceMax` | **USD dollars** (e.g. `25000`); stored as cents server-side. |
| `mileageMin`, `mileageMax` | Odometer. |
| `location` | OR match on `locationZip`, `title`, `description` (substring, case-insensitive). Not geo radius. |
| `condition` | `CONCOURS` \| `EXCELLENT` \| `VERY_GOOD` \| `GOOD` \| `FAIR`. |
| `featuredOnly` / `featured` | Accepted (`1` / `true`); **no DB field yet** — does not narrow results until a future migration. |
| `noReserve`, `endingSoon` | `1` / `true` / `yes`. |
| `status` | Defaults **`LIVE`**; `ENDED`, `SOLD` supported. |
| `sort` | `ENDING_SOON` \| `NEWEST` \| `PRICE_ASC` \| `PRICE_DESC` \| `HIGHEST_BID` (aliases: `ending`, `newest`, `highest`, `price_asc`, `price_desc`). |
| `page`, `pageSize` | `page` ≥ 1; `pageSize` ≤ 100 (default 24 on API). |
| `zip`, `radius` | Existing bounding-box filter (miles); requires known zip in geo helper. |

## Sort semantics

| Sort | Implementation note |
|------|----------------------|
| **ENDING_SOON** | `endAt` ascending. |
| **NEWEST** | `createdAt` descending. |
| **PRICE_ASC / PRICE_DESC** | `reservePriceCents` then `buyNowPriceCents` with null ordering — **list/reserve proxy**, not “current high bid.” Documented for mobile/BI. |
| **HIGHEST_BID** | Fetches up to **N** rows (cap in service), ordered by `endAt` for the candidate pool, then sorts by computed high bid in memory. **Approximate** for large result sets; use **`highBidSortTruncated`**. |

## Future: Elasticsearch / Algolia / OpenSearch

1. **Keep** `AuctionSearchInput` and **`AuctionSearchHit`** (or a thin mapper from engine docs → hits).
2. **Replace** `searchAuctions()` internals with HTTP/gRPC to the search cluster; retain `buildAuctionSearchWhere()` for **admin backfill** or **reconciliation** jobs if needed.
3. **Facet payloads**: extend `AuctionSearchResult.facets` (optional) without breaking `results` / `pagination`.
4. **Full-text / fuzzy / geo radius**: belong in the dedicated engine; map latitude/longitude + radius there instead of zip boxes when ready.

## Related files

- `lib/auction-queries.ts` — other list helpers (homepage, etc.); not replaced by search service but can call it later.
- `MARKETING_HANDOFF_INDEX.md` — marketing APIs are separate; auction search is discovery, not ingest.
- **Carmunity (Flutter)** — browse uses this route; detail uses `GET /api/auctions/[id]`. See `CARMUNITY_AUCTIONS_MOBILE_CONTRACT.md` and `CARASTA_APP_PHASE_6_NOTES.md`.
