# Carmunity by Carasta — Phase 1 (App Foundation)

**Date:** 2026-04-13  
**Code:** `carmunity_app/` (Flutter)

---

## 1. Structure created

Enterprise-style layout under `carmunity_app/lib/`:

| Area | Purpose |
|------|---------|
| `app/` | `CarmunityApp`, `go_router` setup, theme tokens, `AppConfig` |
| `core/network/` | `ApiClient` (Dio), `ApiException` |
| `core/utils/` | `responsive_layout.dart` (breakpoints, max content width) |
| `features/home/` | Home feed UI, `CarmunityRepository`, trending integration |
| `features/forums/` | Forums hub + category/thread placeholders |
| `features/create/` | Create menu scaffold |
| `features/auctions/` | Browse scaffold, `AuctionRepository` stub |
| `features/profile/` | You tab, garage/settings placeholders |
| `features/notifications/` | In-app notifications placeholder + push hook |
| `shared/dto/` | `UserSummary`, `PostSummary`, `AuctionSummary`, `NotificationSummary` |
| `shared/services/` | `AuthService` (token placeholder), `PushNotificationService` (no-op hook) |
| `shared/state/` | Riverpod providers (`apiClient`, repositories, `homeFeedProvider`) |

**Bootstrap:** If `ios/` or `windows/` folders are absent locally, run `flutter create . --platforms=ios,windows` inside `carmunity_app/`.

---

## 2. Theme / navigation approach

- **Theme:** Dark-first premium palette in `app/theme/` (`app_colors.dart`, `app_spacing.dart`, `app_typography.dart`, `app_theme.dart`). Material 3, card-forward surfaces, copper accent.
- **Navigation:** `go_router` with `StatefulShellRoute.indexedStack` for five branches (Home, Forums, Create, Auctions, You). **NavigationRail** when width ≥ 900px; **NavigationBar** on narrow screens.
- **Deep links (structure only):** Root-level `/post/:id` and `/auction/:id` map to the same placeholder detail screens as nested routes; OS-level `carasta://` registration is Phase 2+.

---

## 3. API client approach

- **`AppConfig`:** `API_BASE_URL` and `APP_ENV` via `--dart-define` (see `README.md`).
- **`ApiClient`:** Dio with JSON headers; `AuthService.bearerToken` injected as `Authorization: Bearer` when set (Phase 2).
- **Repositories:** Domain-specific classes call HTTP only — **no** duplicated business rules.

---

## 4. First integration slice

- **Endpoint:** `GET /api/explore/feed?tab=trending` (optional `userId` for `liked` flags).
- **Flow:** `CarmunityRepository.fetchTrending` → `homeFeedProvider` → `HomeScreen` (Trending segment) with loading / error / empty / success, pull-to-refresh, `FeedPostCard` list; tap opens `/home/post/:id` placeholder.
- **Following:** Calls `tab=following` when `AuthService.userId` is set; otherwise empty state + copy (no auth UI yet).
- **Latest:** UI segment reserved; **no backend `tab=latest`** today — banner + empty explanation until the platform adds a chronological mode.

---

## 5. Known blockers for Phase 2

| Blocker | Impact |
|---------|--------|
| **Mobile auth contract** | Following feed, notifications, mutations need Bearer (or equivalent) accepted by Next.js routes. |
| **Mutations as Server Actions** | Create/like/comment/bid require REST (or tRPC) on the server; app should only call those APIs. |
| **`tab=latest` on feed** | “Latest” segment needs a server sort (`createdAt` desc) or dedicated route. |
| **Forum models/APIs** | Thread lists and create-thread are placeholders only. |
| **Auction browse** | Wire `GET /api/auctions/search` + DTO mapping; detail may need richer than `GET /api/auctions/[id]`. |
| **Push** | `PushNotificationService` is a stub; FCM/APNs + token registration TBD. |

---

## 6. Exact next recommended prompt

Use this as the next Cursor task (paste into Agent mode):

> **Phase 2 — Carmunity engagement + auth spike**  
> In `carmunity_app`, add: (1) secure token storage placeholder and login UI shell that sets `AuthService` session; (2) wire **Following** feed when `userId` is available; (3) post detail screen fetching a single post if/when a read API exists, else document the required `GET /api/explore/post/:id` contract; (4) do **not** implement like/comment until server exposes mobile-safe POST endpoints.  
> Coordinate with backend: Bearer JWT validation on `GET /api/notifications/list` and new REST routes for Carmunity mutations.

---

## 7. Validation (local)

From `carmunity_app/`:

```bash
flutter pub get
flutter analyze
flutter test
flutter run --dart-define=API_BASE_URL=http://localhost:3000
```

*(CI/agents without Flutter SDK cannot run these commands; developers run them on machine.)*
