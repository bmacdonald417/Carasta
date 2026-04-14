# Carmunity Flutter — Phase 2 (engagement)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-14

## 1. Flutter files created

| File | Role |
|------|------|
| `lib/shared/dto/post_detail_dto.dart` | `PostDetailDto`, `CommentDto` for `GET /api/carmunity/posts/[id]`. |
| `lib/features/home/presentation/post_detail_screen.dart` | Full post detail UI (media, like, follow, comments, composer). |
| `lib/features/home/presentation/post_detail_notifier.dart` | `StateNotifier` + `postDetailNotifierProvider` (load, optimistic like/follow, comment + silent refresh). |
| `lib/features/home/presentation/widgets/sign_in_required_hint.dart` | Banner when no mutation session. |
| `lib/features/profile/presentation/dev_session_screen.dart` | Provisional cookie + user id entry (`/you/dev-session`). |

## 2. Flutter files modified

| File | Change |
|------|--------|
| `lib/app/config/app_config.dart` | `DEV_USER_ID`, `DEV_NEXTAUTH_SESSION_TOKEN`, `DEV_SESSION_COOKIE_NAME` (`--dart-define`). |
| `lib/shared/services/auth_service.dart` | Cookie header + `canPerformMutations`, build-time defaults, `applyDevSessionFields`. |
| `lib/core/network/api_client.dart` | `Cookie` header injection; `delete()` for unlike / unfollow. |
| `lib/core/network/api_exception.dart` | `isUnauthorized` (401). |
| `lib/features/home/data/carmunity_repository.dart` | `fetchPostDetail`, like/unlike, comment, follow/unfollow, createPost (unused in UI). |
| `lib/features/home/presentation/widgets/feed_post_card.dart` | `ConsumerStatefulWidget` + optimistic like + engagement callback. |
| `lib/features/home/presentation/home_screen.dart` | Following banner copy; invalidate feed after detail / card engagement. |
| `lib/app/router/app_router.dart` | `PostDetailScreen`, `DevSessionScreen` routes. |
| `lib/app/router/routes.dart` | `AppRoutes.devSession`. |
| `lib/features/profile/presentation/profile_screen.dart` | Link to Developer session. |
| `carmunity_app/README.md` | Provisional auth instructions. |

## 3. Removed

- `lib/features/home/presentation/post_detail_placeholder_screen.dart` (replaced by `post_detail_screen.dart`).

## 4. Backend files added (read contract for detail)

| File | Role |
|------|------|
| `lib/carmunity/post-read-service.ts` | `getCarmunityPostDetailJson` (post, comments, `liked`, `viewerFollowsAuthor`). |
| `app/api/carmunity/posts/[id]/route.ts` | `GET` JSON detail (no duplicate mutation logic). |

Contract updates: `CARMUNITY_MOBILE_API_CONTRACT.md` (GET section).

## 5. Engagement features wired

- **Post detail** — `GET /api/carmunity/posts/[id]` via repository; Riverpod `postDetailNotifierProvider`.  
- **Like / unlike** — `POST` / `DELETE` …`/like` with optimistic UI on detail and feed card; rollback on `ApiException`.  
- **Comments** — list from GET payload; `POST` …`/comments` then silent refresh; empty state when none.  
- **Follow / unfollow** — `POST` / `DELETE` …`/users/[id]/follow`; hidden when `AuthService.userId == authorId`; optimistic toggle with rollback.  
- **Feed** — like on card; open detail refreshes feed on return; `onEngagementChanged` invalidates `homeFeedProvider`.

## 6. Provisional auth (how it works)

- **Mutation gate:** `AuthService.canPerformMutations` is true if **Bearer** or **session `Cookie`** header is set on `ApiClient`.  
- **Sources:** (1) `--dart-define` values applied in `AuthService()` constructor from `AppConfig`, (2) **You → Developer session** (`applyDevSessionFields`).  
- **User id:** Required for following feed + self-follow UX; set via defines or Developer session.  
- **No** login UI, **no** hardcoded secrets; session is **in-memory** only unless you add persistence later.

## 7. API / product gaps

- **Bearer issuance** — not implemented; Flutter must send cookies today (or future `Authorization: Bearer` once backend accepts it).  
- **CORS** — cross-origin Flutter web / different API host may need server config + credentials.  
- **Create post from app** — repository method exists; UI not in this phase.  
- **Threaded / nested comments** — not supported; flat list only.

## 8. Blocked until real Bearer (or equivalent)

- Cookie-less native clients without WebView or manual paste.  
- Secure, rotatable tokens tied to device registration.  
- Optional: unified `401` refresh / sign-out UX.

## 9. Recommended Phase 3

> **Post creation + media + polish** — Wire **Create → Post** to `POST /api/carmunity/posts` with composer validation only (server remains source of truth). Add image URL or presigned upload when backend exposes it. Improve profile read APIs (`GET` user by handle) for “You” tab. Consider `revalidatePath` / tag revalidation for web ISR after API mutations.

## 10. Validation

- **TypeScript:** `npx tsc --noEmit` (repo root) — pass.  
- **Flutter:** run locally: `flutter pub get`, `flutter analyze`, `flutter test` (Dart was not available in the agent environment).
