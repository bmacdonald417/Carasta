# Carmunity — auctions (mobile read API)

Carmunity consumes the **same** Carasta discovery APIs as the web marketing auctions UI. No duplicated auction rules in the app.

## Browse / search

**`GET /api/auctions/search`**

- Query parameters, sort semantics, and response shape: **`AUCTION_SEARCH_ARCHITECTURE.md`**.
- Success: `{ "ok": true, "results": [...], "pagination": {...}, "meta": {...} }`.
- Failure: `{ "ok": false, "error": "search_failed" }` with **500**.

### Mobile notes

- **Price sort** (`PRICE_ASC` / `PRICE_DESC`) uses **reserve / list proxy** (reserve then buy-now), not live high bid — documented in architecture.
- **`HIGHEST_BID`** may set `pagination.highBidSortTruncated: true`; clients should surface a short disclaimer (Carmunity does on browse).
- **`featuredOnly`**: accepted by the API; **no `Auction.featured` column yet** — may not narrow results.

## Detail (read-only)

**`GET /api/auctions/[id]`**

- **200** — JSON object with `ok: true` and listing fields including:
  - Vehicle: `title`, `description`, `year`, `make`, `model`, `trim`, `mileage`, `conditionGrade`, `conditionSummary`, `locationZip`, `latitude`, `longitude`
  - Commerce signals: `status`, `startAt`, `endAt`, `createdAt`, `highBidCents`, `highBidderHandle`, `bidCount`, `reservePriceCents`, `buyNowPriceCents`, `buyNowExpiresAt`, `reserveMeterPercent`
  - `images[]`: `{ id, url, sortOrder }`
  - `seller`: `{ id, handle, name, avatarUrl }`
  - **Phase 7:** `watching` — `true` / `false` when the viewer is authenticated (cookie or Bearer); `false` when unauthenticated.
- **404** — `{ "error": "Not found" }` (Dio/ApiClient typically surfaces as client error).

## Watchlist (Phase 7)

Authenticated save/watch (no bids). See **`CARMUNITY_AUCTION_WATCHLIST_CONTRACT.md`**.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auctions/[id]/watch` | `{ ok, watching }` |
| POST | `/api/auctions/[id]/watch` | Save / watch |
| DELETE | `/api/auctions/[id]/watch` | Unsave / unwatch |
| GET | `/api/carmunity/watchlist` | List saved summaries + `auctionIds` |

### Still out of scope

- **Bid placement** and **buy-now execution** — require dedicated commerce APIs and server-side auction rules; not part of Phase 7.
