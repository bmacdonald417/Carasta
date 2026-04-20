# Carmunity Phase O — Notification completion + mobile social parity

## 1. Files created

| Path | Purpose |
|------|---------|
| `app/api/notifications/read-all/route.ts` | `POST` marks all unread notifications for the viewer (mobile parity with web server action). |
| `app/api/forums/me/saved-threads/route.ts` | `GET` paginated saved discussion threads (`ForumThreadSubscription`) for the signed-in user. |
| `carmunity_app/lib/features/notifications/data/notifications_repository.dart` | Dio client for `/api/notifications`, unread count, mark read, mark all read. |
| `carmunity_app/lib/features/notifications/presentation/notification_navigation.dart` | Payload → `go_router` / `url_launcher` (same rules as web `NotificationDropdown`). |
| `carmunity_app/lib/features/forums/dto/saved_thread_subscription_dto.dart` | DTO for saved-thread rows. |

## 2. Files modified

### Web (Next.js / Prisma)

- `app/api/notifications/route.ts` — uses `getJwtSubjectUserId` (cookie **or** `Authorization: Bearer` JWT) instead of cookie-only `getToken`.
- `app/api/notifications/unread-count/route.ts` — same JWT parity.
- `app/api/notifications/list/route.ts` — same (deprecated list route).
- `app/api/notifications/[id]/read/route.ts` — same.
- `app/api/user/carmunity-onboarding/route.ts` — `GET`/`PATCH` use `getJwtSubjectUserId` so Carmunity mobile Bearer sessions work.
- `app/api/explore/feed/route.ts` — adds `tab=latest` chronological feed (unblocks mobile “Latest” tab).

### Mobile (Flutter)

- `carmunity_app/lib/core/network/api_client.dart` — adds `patch()`.
- `carmunity_app/lib/features/home/data/carmunity_repository.dart` — `fetchLatest`, `fetchCarmunityOnboarding`, `patchCarmunityOnboarding`.
- `carmunity_app/lib/features/forums/data/forum_repository.dart` — `fetchSavedThreadSubscriptions`.
- `carmunity_app/lib/shared/dto/notification_summary.dart` — `fromJson`.
- `carmunity_app/lib/shared/state/providers.dart` — `notificationsRepositoryProvider`, `notificationUnreadCountProvider`, `savedThreadSubscriptionsProvider`; `homeFeedProvider` uses latest API.
- `carmunity_app/lib/features/home/presentation/home_screen.dart` — unread badge + removed “Latest” placeholder; real latest feed.
- `carmunity_app/lib/features/notifications/presentation/notifications_screen.dart` — full inbox UI (pull-to-refresh, infinite scroll, mark read on open, mark all read).
- `carmunity_app/lib/features/profile/presentation/profile_screen.dart` — “Saved discussions” list from API.
- `carmunity_app/lib/features/profile/presentation/settings_placeholder_screen.dart` — Carmunity onboarding prefs + reset/complete (PATCH contract).
- `carmunity_app/lib/shared/services/push_notification_service.dart` — extension-point documentation + inbox explainer string.
- `carmunity_app/lib/main.dart` — calls `PushNotificationService.initialize()` (no-op today, central hook).
- `carmunity_app/pubspec.yaml` — adds `url_launcher` for web-relative `href` fallbacks.

## 3. How mobile notifications work

1. `ApiClient` sends `Authorization: Bearer <jwt>` when `AuthService.bearerToken` is set (same as other Carmunity APIs).
2. `NotificationsRepository` calls:
   - `GET /api/notifications?take=&cursorCreatedAt=&cursorId=` (cursor pagination matches web).
   - `GET /api/notifications/unread-count`
   - `PATCH /api/notifications/:id/read`
   - `POST /api/notifications/read-all`
3. `NotificationsScreen` loads the first page, supports **pull-to-refresh** and **near-end scroll** to load more, marks items read when opened, and exposes **Mark all read**.

## 4. How parity is achieved

| Area | Parity mechanism |
|------|------------------|
| Auth for APIs | `getJwtSubjectUserId` on notifications + onboarding routes (Bearer + cookie). |
| Ordering / pagination | Same cursor semantics as web (`createdAt` + `id` desc, `take` capped at 50). |
| Read/unread | Same Prisma `Notification.readAt` updates. |
| Navigation | `notification_navigation.dart` mirrors web payload keys (`threadId`, `postId`, `auctionId`, `href`, `marketingHref`) + common `/discussions/...` path shape. |
| Latest feed | `tab=latest` added server-side; mobile uses same `GET /api/explore/feed` as web would. |
| Saved threads | New `GET /api/forums/me/saved-threads` backed by `ForumThreadSubscription`. |
| Settings / onboarding | Mobile PATCHes the same `/api/user/carmunity-onboarding` schema as web. |

## 5. What still differs intentionally

- **UI** is not pixel-matched to web (by design).
- **Lower gear** structured editor is not fully reproduced — settings screen documents raw prefs and supports **gear slugs** + reset/complete; advanced lower-category editing remains easier on web.
- **Marketing-only URLs** without a known path shape open in an external browser (`url_launcher`).
- **Push delivery** is still not implemented — inbox is HTTP-driven.

## 6. Push-readiness notes

- `PushNotificationService` documents how Phase P should map push payloads → the same navigation helper as in-app rows.
- Prisma `Notification` already stores `type` + JSON `payloadJson` suitable for templating push bodies.
- Recommended next step: device token registration endpoint + FCM/APNs wiring behind the same user id.

## 7. Recommended Phase P

1. Implement `POST /api/carmunity/push-tokens` (or similar) + store per user/device.
2. Wire FCM (Android) + APNs (iOS) + optional Windows toast; call `PushNotificationService.registerDeviceToken`.
3. Server-side: enqueue push when inserting `Notification` rows for high-signal types (mentions, saved-thread replies).
4. Add integration tests for `/api/notifications` JWT parity.

## Validation

- `npm run lint` — pass (existing img warnings only).
- `npx tsc --noEmit` — pass after list-route fix.
- `flutter analyze` — **not run** on this machine (Flutter SDK not on `PATH`). Run locally after `flutter pub get`.
