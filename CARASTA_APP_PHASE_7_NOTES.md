# Carmunity — Phase 7 (mobile auth hardening + watchlist foundation)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-13

## Summary

Phase 7 strengthens **authenticated JSON APIs** for Carmunity by accepting **NextAuth-compatible JWTs** via `Authorization: Bearer`, adds **credential-based mobile token exchange** for password users, introduces **`AuctionWatch`** persistence and **watch/unwatch/watchlist** routes, and wires the Flutter app to a real **Save / Saved** flow plus a light **Saved auctions** entry under Profile.

**Not in scope:** bidding, buy-now execution, duplicated auction business logic in Flutter, fake auth or fake persistence.

---

## 1. Auth improvements

| Area | Change |
|------|--------|
| **`getJwtSubjectUserId`** | Resolves user id from session **cookie** (`getToken`) or **`Authorization: Bearer <jwt>`** (`decode` with `NEXTAUTH_SECRET`). Subject from `sub` or `id`. |
| **`mintCarmunityAccessToken`** | Shared helper using `next-auth/jwt` `encode`, **30-day** maxAge aligned with session intent. |
| **`POST /api/auth/mobile/token`** | Email + password → `{ ok, accessToken, userId, handle }` for users with `passwordHash` (same bcrypt check as credentials sign-in). **OAuth-only accounts** cannot use this route until a separate bridge exists. |
| **Demo / dev** | Demo session minting reuses `mintCarmunityAccessToken` (no divergent encoding). |
| **Flutter** | `AuthService.signInWithAccessToken` / `applyBearerJwtAndUserId`; `CarmunityAuthRepository.exchangeMobileToken`; dev session screen performs exchange with `ScaffoldMessenger` captured before `await` to satisfy async context linting. |

**Honest gaps:** Google/OAuth mobile sign-in still needs either webview cookie flow, token paste for testing, or a future **OAuth code → JWT** endpoint. Rate limiting and abuse controls for `/api/auth/mobile/token` should be applied at the edge in production.

---

## 2. Watchlist backend / data

| Piece | Role |
|-------|------|
| **`AuctionWatch` (Prisma)** | `userId`, `auctionId`, `@@unique([userId, auctionId])`. **Separate** from `GarageCar` (garage/dream inventory). |
| **`lib/auctions/auction-watch-service.ts`** | `watchAuction`, `unwatchAuction`, `isWatchingAuction`, `listWatchedAuctionSummaries` — thin Prisma only, no bid logic. |
| **`GET/POST/DELETE /api/auctions/[id]/watch`** | Auth required; GET returns `{ ok, watching }`. |
| **`GET /api/carmunity/watchlist`** | `{ ok, items[], auctionIds[] }` for list UI. |
| **`GET /api/auctions/[id]`** | Additive **`watching: boolean`** when viewer is signed in (cookie or Bearer). |

Full request/response notes: **`CARMUNITY_AUCTION_WATCHLIST_CONTRACT.md`**. Auth transport details: **`CARMUNITY_MOBILE_AUTH_BRIDGE.md`**.

---

## 3. Backend files created

| File |
|------|
| `lib/auth/carmunity-access-token.ts` |
| `app/api/auth/mobile/token/route.ts` |
| `lib/auctions/auction-watch-service.ts` |
| `app/api/auctions/[id]/watch/route.ts` |
| `app/api/carmunity/watchlist/route.ts` |

---

## 4. Backend files modified

| File | Change |
|------|--------|
| `lib/auth/api-user.ts` | Bearer JWT support alongside cookie. |
| `app/api/carmunity/demo-session/route.ts` | Use `mintCarmunityAccessToken`. |
| `app/api/auctions/[id]/route.ts` | `NextRequest`, `watching` for authenticated viewer. |
| `prisma/schema.prisma` | `AuctionWatch` model; relations on `User` and `Auction`. |

---

## 5. Flutter files created

| File |
|------|
| `carmunity_app/lib/features/auctions/dto/auction_watch_summary_dto.dart` |
| `carmunity_app/lib/features/auctions/presentation/saved_auctions_screen.dart` |

---

## 6. Flutter files modified (representative)

| File | Change |
|------|--------|
| `carmunity_app/lib/shared/services/auth_service.dart` | Bearer-first helpers; clear cookie header when applying Bearer from these paths. |
| `carmunity_app/lib/features/auth/data/carmunity_auth_repository.dart` | `exchangeMobileToken`. |
| `carmunity_app/lib/shared/state/providers.dart` | Watchlist / watched-id providers. |
| `carmunity_app/lib/features/auctions/dto/auction_detail_dto.dart` | `watching`. |
| `carmunity_app/lib/features/auctions/data/auction_repository.dart` | `watchAuction`, `unwatchAuction`, `fetchWatchlist`, `fetchWatchlistAuctionIds`. |
| `carmunity_app/lib/features/auctions/presentation/auction_detail_screen.dart` | Save / Saved + auth messaging. |
| `carmunity_app/lib/features/auctions/presentation/auctions_screen.dart` | Subtle saved indicator on cards. |
| `carmunity_app/lib/features/profile/presentation/profile_screen.dart` | “Saved auctions” + invalidate watches on sign-out. |
| `carmunity_app/lib/features/profile/presentation/dev_session_screen.dart` | Email/password exchange + lint fix. |
| `carmunity_app/lib/features/profile/presentation/carmunity_demo_sign_in.dart` | Bearer sign-in; invalidate watch providers. |
| `carmunity_app/lib/app/router/app_router.dart`, `carmunity_app/lib/core/routing/routes.dart` | `/you/saved-auctions`. |

---

## 7. What is live now

- Protected Carmunity-style routes accept **cookie session** or **Bearer JWT** (same encoded token shape as NextAuth session JWT).
- Password users can obtain a JWT via **`POST /api/auth/mobile/token`** and use it from the app.
- Users can **watch / unwatch** auctions; detail shows **`watching`**; browse can reflect saved state; **Saved auctions** list via **`GET /api/carmunity/watchlist`**.

---

## 8. Remaining blockers before bidding

- **No bid placement or buy-now APIs** in this phase.
- **OAuth-only** users need a different mobile auth path than email/password exchange.
- **Database:** apply schema (`prisma migrate` / `db push`) and run **`npx prisma generate`** where the environment allows (Windows file locks on `query_engine` can cause EPERM until processes release the DLL).
- **Production hardening:** rate limits, monitoring, and HTTPS-only token exchange.

---

## 9. Recommendation for Phase 8

1. **Bidding / buy-now (server-authoritative):** new authenticated routes that reuse existing Prisma `Bid` and auction status rules; Flutter thin clients with clear error envelopes.  
2. **OAuth mobile bridge** (optional parallel): authorization-code or refresh path that mints the same `mintCarmunityAccessToken` JWT for Google users.  
3. **Watchlist polish:** pull-to-refresh on saved list, empty states, optional pagination if watch lists grow large.

---

## 10. Validation (this environment)

| Command | Result |
|---------|--------|
| `npm run lint` | Passed (existing Next.js `<img>` warnings only). |
| `npx tsc --noEmit` | Passed after fixing `req` / `_req` in watch route POST/DELETE. |
| `flutter analyze` / `flutter test` | **Flutter CLI not on PATH** in this agent shell; run locally after `flutter pub get`. |

---

## 11. Related docs

- `CARMUNITY_MOBILE_API_CONTRACT.md` — updated Auth + watchlist endpoints.  
- `CARMUNITY_AUCTIONS_MOBILE_CONTRACT.md` — `watching` + watch routes.  
- `CARMUNITY_MOBILE_AUTH_BRIDGE.md` — auth contract for mobile.  
- `CARMUNITY_AUCTION_WATCHLIST_CONTRACT.md` — watchlist API only.
