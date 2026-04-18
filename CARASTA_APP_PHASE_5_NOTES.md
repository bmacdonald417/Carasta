# Carmunity Flutter — Phase 5 (real media upload for posts)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-13

## 1. Upload contract chosen

**Authenticated multipart upload:** `POST /api/carmunity/media/upload` with form field **`file`**, returning `{ ok, imageUrl }`. Fits the existing Next.js app without adding cloud SDKs; files are stored under `public/uploads/carmunity/` and served as static URLs. See **`CARMUNITY_MEDIA_UPLOAD_CONTRACT.md`** for limits, env, and production caveats.

Post creation still uses **`POST /api/carmunity/posts`** with JSON `{ content?, imageUrl? }` — **no duplicated** create logic (`createCarmunityPost` unchanged).

## 2. Backend files created

| File | Role |
|------|------|
| `lib/carmunity/carmunity-image-upload.ts` | Max size, allowed MIME, relative path helper for uploads. |
| `app/api/carmunity/media/upload/route.ts` | Multipart handler, auth, write to `public/`, JSON response. |
| `public/uploads/carmunity/.gitkeep` | Keeps upload directory in git while ignoring user files. |

## 3. Backend files modified

| File | Change |
|------|--------|
| `.gitignore` | Ignore `public/uploads/carmunity/*` except `.gitkeep`. |
| `.env.example` | Document optional `CARMUNITY_MEDIA_PUBLIC_BASE_URL`. |

## 4. Flutter files created

| File | Role |
|------|------|
| `carmunity_app/lib/core/media/api_carmunity_media_upload.dart` | `CarmunityMediaUploadPort` → multipart `POST /api/carmunity/media/upload`. |

## 5. Flutter files modified

| File | Change |
|------|--------|
| `carmunity_app/lib/core/network/api_client.dart` | `postMultipart` for `FormData` + image bytes. |
| `carmunity_app/lib/core/media/carmunity_media_upload_port.dart` | Docstring (no staged reference). |
| `carmunity_app/lib/shared/state/providers.dart` | `carmunityMediaUploadPortProvider` → `ApiCarmunityMediaUpload`. |
| `carmunity_app/lib/features/create/presentation/create_post_screen.dart` | Upload progress line, copy, busy states, gallery vs URL behavior. |
| `carmunity_app/pubspec.yaml` | `http_parser` for multipart `MediaType`. |

## 6. Flutter files removed

| File | Reason |
|------|--------|
| `carmunity_app/lib/core/media/staged_carmunity_media_upload.dart` | Replaced by real API-backed upload. |

## 7. Documentation created/updated

| File | Change |
|------|--------|
| `CARMUNITY_MEDIA_UPLOAD_CONTRACT.md` | **New** — API, storage, env, limits, out-of-scope. |
| `CARMUNITY_MOBILE_API_CONTRACT.md` | Media upload endpoint + post image guidance. |

## 8. What is now truly live

- **Create post → gallery photo:** bytes upload to Carasta, then `createPost` with returned **`imageUrl`**.
- **Create post → optional image URL:** still supported (manual `https` URL).
- **Create post → text only:** unchanged.
- **Share link flow:** unchanged (still `createPost(content: …)` only).

## 9. What remains staged / out of scope

- **Create tab → “Media upload”** hub tile: still a **staged** shell (binary pipeline beyond post images) unless product redefines it.
- **Video**, **multi-attachment posts**, **downloadable attachments**, **rich link previews** — not implemented; see `CARMUNITY_MEDIA_UPLOAD_CONTRACT.md` and Phase 3 share-link notes.

## 10. Env / storage requirements

- **Local:** `next dev` — uploads land under `public/uploads/carmunity/`; **`imageUrl`** uses request origin unless `CARMUNITY_MEDIA_PUBLIC_BASE_URL` / `NEXT_PUBLIC_SITE_URL` is set.
- **Production:** Ephemeral disks on many hosts **lose** `public/` uploads; set **`CARMUNITY_MEDIA_PUBLIC_BASE_URL`** to a durable CDN/origin or replace the route with object storage while preserving the JSON contract.

## 11. Validation

Run from repo root and `carmunity_app/`:

- `npm run lint`
- `npx tsc --noEmit`
- `cd carmunity_app && flutter pub get && flutter analyze && flutter test`

Manual: sign in → Create → Post → pick image → publish → feed/detail shows image URL from your host.

## 12. Recommendation for Phase 6

1. **Durable object storage** — Implement S3/R2/UploadThing (or presigned PUT) behind the same `imageUrl` contract; keep Flutter port boundary.
2. **Optional:** Wire Create **Media** hub to the same upload port or retire the placeholder.
3. **Link previews** — Backend `linkUrl` + OG or client unfurl, separate from upload.
4. **Video** — New contract + transcoding; do not overload the post-image route.
