# Carmunity Flutter — Phase 6 (auctions mobile experience)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-13

## 1. Flutter files created

| File | Role |
|------|------|
| `carmunity_app/lib/features/auctions/dto/auction_image_dto.dart` | Image row from search/detail JSON. |
| `carmunity_app/lib/features/auctions/dto/auction_seller_dto.dart` | Seller hit (search) vs seller detail (detail API). |
| `carmunity_app/lib/features/auctions/dto/auction_list_item_dto.dart` | `results[]` mapping for browse cards. |
| `carmunity_app/lib/features/auctions/dto/auction_search_page_dto.dart` | Results + pagination (+ `highBidSortTruncated`). |
| `carmunity_app/lib/features/auctions/dto/auction_detail_dto.dart` | `GET /api/auctions/[id]` mapping. |
| `carmunity_app/lib/features/auctions/dto/auction_filter_state.dart` | Filter/sort state + `toQueryParams` aligned to search API. |
| `carmunity_app/lib/core/utils/auction_formatting.dart` | USD from cents, bid line, end urgency, dates, condition label. |
| `carmunity_app/lib/features/auctions/presentation/auction_filter_sheet.dart` | Modal filters/sort sheet. |
| `carmunity_app/lib/features/auctions/presentation/auction_detail_screen.dart` | Read-only detail, gallery, seller, disabled CTAs. |
| `CARMUNITY_AUCTIONS_MOBILE_CONTRACT.md` | Mobile-facing summary for search + detail (this repo). |

## 2. Flutter files modified

| File | Change |
|------|--------|
| `carmunity_app/lib/features/auctions/data/auction_repository.dart` | `searchAuctions`, `getAuctionDetail` — real APIs, DTO mapping. |
| `carmunity_app/lib/features/auctions/presentation/auctions_screen.dart` | Real browse: grid (wide) / list, pull-to-refresh, load more, filters. |
| `carmunity_app/lib/shared/state/providers.dart` | `auctionFilterProvider` (`StateProvider<AuctionFilterState>`). |
| `carmunity_app/lib/app/router/app_router.dart` | Detail + deep link use `AuctionDetailScreen`. |

## 3. Flutter files removed

| File | Reason |
|------|--------|
| `carmunity_app/lib/features/auctions/presentation/auction_detail_placeholder_screen.dart` | Replaced by `auction_detail_screen.dart`. |

## 4. Backend files modified

| File | Change |
|------|--------|
| `app/api/auctions/[id]/route.ts` | Additive JSON for mobile: `ok`, vehicle fields, `images[]`, full `seller`, timestamps, condition/location, etc. Existing numeric bid fields retained. |

## 5. APIs consumed

| Method | Path | Use |
|--------|------|-----|
| GET | `/api/auctions/search` | Browse, filters, sort, pagination, load more. |
| GET | `/api/auctions/[id]` | Detail (read-only). |

See **`AUCTION_SEARCH_ARCHITECTURE.md`** and **`CARMUNITY_AUCTIONS_MOBILE_CONTRACT.md`**.

## 6. What is live (browse / detail / filters)

- **Auctions tab:** real data from search; image-first cards; bid line + end urgency + ZIP + seller handle; responsive **2-column grid** when wide.
- **Filters sheet:** sort, status (LIVE/ENDED/SOLD), text query, year/price/mileage ranges, location, zip+radius, condition, no-reserve, ending-soon, featured-only (with honest subtitle).
- **Pagination:** **Load more** button (no speculative auto-infinite scroll).
- **Detail:** hero gallery (PageView), metadata, reserve meter, buy-now line, description/condition, seller card.
- **CTAs:** **Save to watchlist** and **Bid or buy on Carasta web** are **disabled** with tooltips (watchlist-ready / web handoff).

## 7. Intentionally out of scope

- **Bidding**, **buy-now execution**, **watchlist API** — not implemented; no client-side auction rules.
- **Merging auctions into Carmunity feed** — auctions stay in the Auctions tab (+ existing `/auction/:id` deep link).
- **Saved searches** — not built; filter state is in-memory per session (`StateProvider`).

## 8. Backend / API gaps noted

- **`featuredOnly`** still has **no DB backing** (per architecture doc).
- **Detail** before this phase omitted images/vehicle copy; route is now extended — ensure **deploy** includes updated `route.ts`.
- **Seller profile** deep link in-app — no dedicated user profile route yet; detail shows seller card only.

## 9. Validation

```bash
cd carmunity_app
flutter pub get
flutter analyze
flutter test
```

Manual: Auctions tab loads; filters apply; tap card → detail; `/auction/:id` deep link (if used).

## 10. Recommendation for Phase 7

1. **Authenticated mobile bid/buy** — only behind explicit, audited API routes; reuse server bid services (no duplicated rules).
2. **Watchlist** — backend model + `POST/DELETE` endpoints; wire `AuctionDetailScreen` CTA to repository method.
3. **Seller profile** — `go_router` route to public profile by `userId` or handle if/when API exists.
4. **Optional:** infinite scroll with `ScrollController` instead of explicit load-more; image caching (`cached_network_image`) if needed.
