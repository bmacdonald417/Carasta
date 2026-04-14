# Carmunity Flutter — Phase 3 (create + media foundation)

**Branch:** `feature/carmunity-phase-2-engagement` (Phase 3 work continues here)  
**Date:** 2026-04-14

## 1. Files created (Flutter)

| File | Role |
|------|------|
| `carmunity_app/lib/core/media/carmunity_upload_result.dart` | Sealed results for photo upload (`Success` / `Unavailable`). |
| `carmunity_app/lib/core/media/carmunity_media_upload_port.dart` | Port for uploading bytes → public `imageUrl`. |
| `carmunity_app/lib/core/media/staged_carmunity_media_upload.dart` | Honest no-op until backend upload/presign exists. |
| `carmunity_app/lib/core/media/media_picker_service.dart` | Thin `image_picker` wrapper (gallery/camera). |
| `carmunity_app/lib/core/utils/url_normalization.dart` | Client-side http(s) URL normalization for share-link flow. |
| `carmunity_app/lib/shared/models/shared_link_draft.dart` | Caption + URL → single `content` string for API. |
| `carmunity_app/lib/features/create/presentation/create_hub_screen.dart` | Create tab hub (Post, Share link, Forum, Media). |
| `carmunity_app/lib/features/create/presentation/create_post_screen.dart` | Standard post composer → `POST /api/carmunity/posts`. |
| `carmunity_app/lib/features/create/presentation/share_link_post_screen.dart` | Share external URL as a text post (no OG preview). |
| `carmunity_app/lib/features/create/presentation/create_forum_thread_placeholder_screen.dart` | Staged forum creation UX. |
| `carmunity_app/lib/features/create/presentation/create_media_placeholder_screen.dart` | Staged media hub UX. |

## 2. Files modified (Flutter)

| File | Change |
|------|--------|
| `carmunity_app/pubspec.yaml` | Added `image_picker`. |
| `carmunity_app/lib/features/home/data/carmunity_repository.dart` | `createPost` trims inputs; omits empty strings from JSON. |
| `carmunity_app/lib/shared/state/providers.dart` | `carmunityMediaUploadPortProvider`, `mediaPickerServiceProvider`. |
| `carmunity_app/lib/app/router/app_router.dart` | `/create` hub + nested `post`, `share-link`, `forum-thread`, `media`. |
| `carmunity_app/lib/app/router/routes.dart` | `createPost`, `createShareLink`, `createForumThread`, `createMedia`. |

## 3. Files removed

| File | Reason |
|------|--------|
| `carmunity_app/lib/features/create/presentation/create_screen.dart` | Replaced by `create_hub_screen.dart` + routes. |

## 4. Creation flows

### Live (real API)

- **Post** (`/create/post`) — `POST /api/carmunity/posts` with optional `content`, optional `imageUrl`. Gallery pick shows a **local preview**; binary upload goes through `CarmunityMediaUploadPort` (staged → user must paste a **public HTTPS image URL** or post text-only). No client-side duplication of server validation messages; errors come from API `error` strings.
- **Share link** (`/create/share-link`) — Normalizes URL + optional caption into a single `content` string (same POST). **No** link preview metadata from server; documented as backend gap.

### Staged (polished placeholders)

- **Forum thread** — Explains missing mobile forum API; no fake submit.
- **Media upload** — Explains presign/upload requirement; points to this doc.

## 5. Upload architecture decisions

- **Ports:** `CarmunityMediaUploadPort` + `CarmunityUploadResult` keep upload logic swappable without touching composers.
- **Staged implementation:** `StagedCarmunityMediaUpload` performs **no** network upload; returns `CarmunityUploadUnavailable` with a clear message. **No fake “uploaded” state.**
- **Picker:** `MediaPickerService` uses `image_picker` for photos only; video explicitly out of scope for Phase 3.
- **Honest path for images today:** users paste a hosted `imageUrl` that the existing API already accepts.

## 6. Backend / API gaps

| Gap | Notes |
|-----|--------|
| **Binary image upload** | No presigned PUT/S3 (or equivalent) route in Carasta for Carmunity posts yet. Needed before replacing staged uploader. |
| **Link preview / OG** | Posts are plain `content` + optional `imageUrl`; no `linkUrl` field or unfurl pipeline. Share-link flow stores URL in text. |
| **Forum thread JSON API** | Not present for mobile; placeholder only. |
| **Video** | Out of scope; do not extend upload port for video until product + backend agree. |

### Recommended backend contract for Phase 4 (upload)

1. `POST /api/carmunity/media/presign` (or similar) authenticated like other Carmunity routes: returns `{ uploadUrl, publicUrl, headers? }` or multipart endpoint.
2. Flutter: implement `CarmunityMediaUploadPort` with real HTTP PUT/post + return `publicUrl` for `createPost(imageUrl: ...)`.
3. Optional: extend `Post` model + APIs for **link** metadata if previews are required (separate from Phase 3).

## 7. Feed / navigation after create

- On success: `ref.invalidate(homeFeedProvider)` and `ref.invalidate(carmunityMeProvider)`, then `context.go(AppRoutes.postDetail(postId))` so the user lands on the new post detail (predictable, no optimistic list surgery).

## 8. Auth

- Unchanged provisional strategy: `AuthService.canPerformMutations` gates publish; `SignInRequiredHint` on composers; 401 surfaces via `ApiException` / snackbars.

## 9. Validation run

- `flutter pub get` — OK  
- `flutter analyze` — no errors (infos only, e.g. `prefer_const_constructors` elsewhere)  
- `flutter test` — pass  

## 10. Recommended Phase 4

- Implement real `CarmunityMediaUploadPort` against a Carasta presign/upload route; keep composers unchanged aside from DI.
- Optional: `GET /api/carmunity/me` enhancements already used on **You**; add public profile by handle if needed for deep links.
- Link previews: server-side unfurl + optional `linkPreview` object in post JSON when product is ready.
