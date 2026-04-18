# Carmunity Flutter — Phase 4 (forums)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-13

## 1. Flutter files created

| File | Role |
|------|------|
| `carmunity_app/lib/features/forums/data/forum_repository.dart` | Reads/writes forum JSON APIs; maps to DTOs; no UI parsing. |
| `carmunity_app/lib/features/forums/dto/forum_author_dto.dart` | Author snapshot for threads/replies. |
| `carmunity_app/lib/features/forums/dto/forum_space_dto.dart` | `ForumSpaceDto` + `ForumSpaceDetailDto` (space + categories). |
| `carmunity_app/lib/features/forums/dto/forum_category_dto.dart` | Category within a space. |
| `carmunity_app/lib/features/forums/dto/forum_thread_summary_dto.dart` | Thread row in category list. |
| `carmunity_app/lib/features/forums/dto/forum_reply_dto.dart` | Flat reply line items. |
| `carmunity_app/lib/features/forums/dto/forum_thread_detail_dto.dart` | Thread + nested replies + space/category refs. |
| `carmunity_app/lib/core/utils/forum_formatting.dart` | Relative / absolute date helpers for forum UI. |
| `carmunity_app/lib/features/forums/presentation/forums_screen.dart` | Forums tab: spaces grid/cards from API. |
| `carmunity_app/lib/features/forums/presentation/forum_space_screen.dart` | Space detail: categories → thread list routes. |
| `carmunity_app/lib/features/forums/presentation/forum_category_threads_screen.dart` | Paginated thread list + FAB to create thread. |
| `carmunity_app/lib/features/forums/presentation/forum_thread_detail_screen.dart` | Thread body, flat replies, reply composer. |
| `carmunity_app/lib/features/create/presentation/create_forum_thread_screen.dart` | `POST /api/forums/threads` with space/category pick or `?categoryId=`. |

## 2. Flutter files modified

| File | Change |
|------|--------|
| `carmunity_app/lib/shared/state/providers.dart` | `forumRepositoryProvider`, `forumSpacesProvider`, `forumSpaceDetailProvider`. |
| `carmunity_app/lib/app/router/routes.dart` | `forumSpace`, `forumCategoryThreads`, `forumThread`; forum paths aligned to backend slugs/ids. |
| `carmunity_app/lib/app/router/app_router.dart` | Routes for space, category threads, thread detail, create forum thread. |
| `carmunity_app/lib/features/create/presentation/create_hub_screen.dart` | Forum thread tile is **Live**; copy updated; navigates to real composer. |

## 3. Flutter files removed

| File | Reason |
|------|--------|
| `carmunity_app/lib/features/forums/presentation/forum_category_placeholder_screen.dart` | Replaced by real category thread list. |
| `carmunity_app/lib/features/forums/presentation/forum_thread_placeholder_screen.dart` | Replaced by `forum_thread_detail_screen.dart`. |
| `carmunity_app/lib/features/create/presentation/create_forum_thread_placeholder_screen.dart` | Replaced by `create_forum_thread_screen.dart`. |

## 4. Forum screens and flows (live)

1. **Forums tab** → **Spaces** (`GET /api/forums/spaces`) — Mechanics Corner and Gear Interests appear when returned by the API (seeded on backend).
2. **Space** (`GET /api/forums/spaces/[slug]`) — Categories list; navigate to category thread list.
3. **Category threads** (`GET /api/forums/categories/[categoryId]/threads`) — Title, author, reply count, last activity; load more via cursor; FAB → create thread with `categoryId` query.
4. **Thread detail** (`GET /api/forums/threads/[id]`) — Title, body, author, flat replies, reply field (`POST .../replies`); sign-in hint when not authenticated.
5. **Create thread** (`POST /api/forums/threads`) — From Create hub or from category FAB; optional pre-selected category via query.

Forums are **not** modeled as feed `Post`s; repository only calls `/api/forums/*`.

## 5. APIs consumed

| Method | Path |
|--------|------|
| GET | `/api/forums/spaces` |
| GET | `/api/forums/spaces/[slug]` |
| GET | `/api/forums/categories/[categoryId]/threads` |
| GET | `/api/forums/threads/[id]` |
| POST | `/api/forums/threads` |
| POST | `/api/forums/threads/[id]/replies` |

Contract reference: `FORUMS_API_CONTRACT.md`.

## 6. Create → Forum thread

- **Create tab** → **Forum thread** → `AppRoutes.createForumThread` (`/create/forum-thread`).
- User picks **space** then **category** (or opens from a category with `?categoryId=` so category is fixed).
- On success: `context.go(AppRoutes.forumThread(newId))`; relevant forum providers invalidated.

## 7. Profile / feed integration (Phase 4)

- No merge of forums into the main feed; entry points remain **Forums tab** and **Create hub** only.

## 8. Blockers / gaps

| Item | Notes |
|------|--------|
| **Backend / env** | App must point `ApiClient` base URL at a Carasta instance with forum routes seeded (`Mechanics Corner`, `Gear Interests`). |
| **Auth** | Same provisional session as Phase 2/3; mutations require `AuthService.canPerformMutations`. |
| **`flutter analyze`** | May still report `info`-level lints (e.g. `prefer_const_constructors`) in files outside Phase 4 scope. |

## 9. Recommendation for Phase 5

1. **Presigned media upload** — Implement real `CarmunityMediaUploadPort` when `POST /api/carmunity/media/presign` (or equivalent) exists; keep Create → Post / Share link aligned.
2. **Forum polish (optional)** — Thread search, pinning, or read-state if product requires; keep moderation tooling minimal unless backend expands.
3. **Deep links** — Optional `go_router` query preservation for sharing thread URLs inside the app.
4. **Notifications** — Forum reply/mention hooks only after backend events exist.

## 10. Validation

Recommended local checks:

```bash
cd carmunity_app
flutter pub get
flutter analyze
flutter test
```

Manual: Forums tab → spaces → categories → threads → detail → reply; Create → Forum thread; category FAB → create with pre-selected category.

If Flutter is unavailable in CI, the above still documents the intended verification steps.
