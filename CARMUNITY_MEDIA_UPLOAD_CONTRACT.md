# Carmunity media upload (Phase 5)

## Contract chosen: authenticated multipart upload

**`POST /api/carmunity/media/upload`**

- **Auth:** Same as other Carmunity JSON routes — session cookie and/or JWT via `getJwtSubjectUserId` (`NEXTAUTH_SECRET`). **401** `{ "ok": false, "error": "Unauthorized" }` when missing.
- **Body:** `multipart/form-data` with a single file field named **`file`**.
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
- **Max size:** **5 MiB** (`CARMUNITY_IMAGE_MAX_BYTES` in `lib/carmunity/carmunity-image-upload.ts`).
- **200**

```json
{ "ok": true, "imageUrl": "https://your-host/uploads/carmunity/…/….jpg" }
```

- **400** — empty file, wrong type, too large, missing `file` field — `{ "ok": false, "error": "…" }`.

The returned `imageUrl` is suitable for **`POST /api/carmunity/posts`** `{ "imageUrl": "…" }`. Post creation rules are unchanged (`createCarmunityPost` in `lib/carmunity/engagement-service.ts`).

## Storage model (current)

- Files are written under **`public/uploads/carmunity/{userId}/{uuid}.{ext}`** and served as static assets from the Next.js site origin.
- **`imageUrl` absolute base** resolution order:
  1. `CARMUNITY_MEDIA_PUBLIC_BASE_URL` (optional CDN or canonical site URL, no trailing slash)
  2. else `NEXT_PUBLIC_SITE_URL`
  3. else **`Origin` derived from the incoming request** (`new URL(req.url).origin`) — best for local/dev when the app uses `http://10.0.2.2:3000` etc.

## Operational notes

- **Ephemeral filesystem:** On serverless hosts (e.g. Vercel), the filesystem is not durable; uploads can disappear between invocations. For production, point **`CARMUNITY_MEDIA_PUBLIC_BASE_URL`** at a stable origin backed by object storage, or replace this route with presigned S3/R2/UploadThing while keeping the same JSON response shape.
- **Request body limits:** Some platforms cap request bodies below 5 MiB; if deploy fails large uploads, lower `CARMUNITY_IMAGE_MAX_BYTES` or raise the platform limit.
- **Git:** User content under `public/uploads/carmunity/` is **gitignored** (directory kept via `.gitkeep`).

## Not in scope (Phase 5)

- Video, multi-file attachments, or progressive/resumable uploads.
- Link preview / OG enrichment (still plain `Post.content`).
- A separate “Media library” product surface — the Create tab **Media upload** entry may remain a staged shell until Phase 6+.

## Future: presigned flow (optional)

If you add **`POST /api/carmunity/media/presign`**, the Flutter `CarmunityMediaUploadPort` can swap to PUT-to-storage without changing `createPost` or engagement service rules, as long as the final `imageUrl` remains an `https` URL the API accepts.
