# Carmunity mobile-safe API (JSON)

Base URL: same origin as the Carasta deployment (e.g. `https://…`). All responses are JSON.

## Auth (Phase 2 + Phase 7)

- **Cookie:** NextAuth session JWT via `Cookie` (same as web) — `getToken` with `NEXTAUTH_SECRET`.
- **Bearer (Phase 7):** `Authorization: Bearer <jwt>` where `<jwt>` is the same encoded token the server would put in the session (from `mintCarmunityAccessToken`, web session, or **`POST /api/auth/mobile/token`**). `decode` + `sub` / `id` resolves the user id.
- **Flutter:** send **Bearer** for mobile credential sign-in; cookie remains valid for dev paste flows. Unauthenticated calls to protected routes return **401** `{ "ok": false, "error": "Unauthorized" }`.

### POST `/api/auth/mobile/token`

Exchange **email + password** for a JWT (users with `passwordHash` only).

**Body:** `{ "email": "string", "password": "string" }`

**200:** `{ "ok": true, "accessToken": "…", "userId": "…", "handle": "…" }`  
**400** — invalid body  
**401** — invalid credentials (includes OAuth-only accounts without a password)  
**500** — server cannot mint (`NEXTAUTH_SECRET` missing)

Details: **`CARMUNITY_MOBILE_AUTH_BRIDGE.md`**.

## Endpoints

### GET `/api/carmunity/posts/:id`

Post detail for mobile clients: author, content, image, counts, `liked` / `viewerFollowsAuthor` when the session resolves a viewer, and ordered `comments[]`.

**200**

```json
{
  "ok": true,
  "post": {
    "id": "…",
    "authorId": "…",
    "auctionId": null,
    "content": "…",
    "imageUrl": null,
    "createdAt": "…ISO…",
    "author": { "id": "…", "handle": "…", "name": "…", "avatarUrl": null },
    "liked": false,
    "likeCount": 0,
    "commentCount": 0,
    "viewerFollowsAuthor": false,
    "comments": [
      {
        "id": "…",
        "content": "…",
        "createdAt": "…ISO…",
        "author": { "id": "…", "handle": "…", "name": "…", "avatarUrl": null }
      }
    ]
  }
}
```

**404** — post not found  
**401** — not required for read; viewer-specific flags default when unauthenticated.

---

### POST `/api/carmunity/posts`

Create post (same rules as web: text and/or image URL).

**Body:**

```json
{ "content": "optional string", "imageUrl": "optional string" }
```

Omitted keys are treated as “not provided” for that field.

**200**

```json
{ "ok": true, "postId": "…" }
```

**400** — validation / empty body  
**401** — not signed in

**Link / share posts (Phase 3 mobile):** There is no separate `linkUrl` field. Clients that “share a link” typically send a **single `content` string** containing the URL (and optional caption), e.g. `"Check this out\n\nhttps://example.com/article"`. **Open Graph / link preview metadata is not returned** by this endpoint; enrichment remains a future backend + schema concern.

**Images:** `imageUrl` must be a URL the server can persist (usually **https** to a publicly reachable object). **Binary uploads** are not handled by this route; obtain `imageUrl` via **`POST /api/carmunity/media/upload`** (multipart) or another server-approved source. See **`CARMUNITY_MEDIA_UPLOAD_CONTRACT.md`**.

---

### POST `/api/carmunity/media/upload`

Authenticated **multipart** upload for post images. Returns a public `imageUrl` for use with **`POST /api/carmunity/posts`**.

**Body:** `multipart/form-data` — field name **`file`**.

**200**

```json
{ "ok": true, "imageUrl": "https://…/uploads/carmunity/…/….jpg" }
```

**400** — missing file, wrong type, too large, empty file  
**401** — not signed in

Full rules (MIME, size limits, storage, env): **`CARMUNITY_MEDIA_UPLOAD_CONTRACT.md`**.

---

### POST `/api/carmunity/posts/:id/like`

**200**

```json
{ "ok": true, "likeCount": 12, "liked": true }
```

**404** — post not found  
**401** — not signed in

### DELETE `/api/carmunity/posts/:id/like`

**200**

```json
{ "ok": true, "likeCount": 11, "liked": false }
```

**404** — post not found  
**401** — not signed in

---

### POST `/api/carmunity/posts/:id/comments`

**Body:**

```json
{ "content": "Comment text" }
```

**200**

```json
{ "ok": true, "commentId": "…", "commentCount": 5 }
```

**400** — empty content / invalid body  
**404** — post not found  
**401** — not signed in

---

### POST `/api/carmunity/users/:id/follow`

`:id` is the **target user’s** id (`User.id`).

**200**

```json
{ "ok": true }
```

**400** — cannot follow self  
**404** — user not found  
**401** — not signed in

### DELETE `/api/carmunity/users/:id/follow`

**200**

```json
{ "ok": true }
```

**401** — not signed in

---

### GET `/api/carmunity/watchlist`

Saved auctions for the signed-in user (Carmunity).

**200**

```json
{
  "ok": true,
  "items": [
    {
      "id": "…",
      "title": "…",
      "endAt": "…ISO…",
      "imageUrl": null,
      "status": "LIVE"
    }
  ],
  "auctionIds": ["…"]
}
```

**401** — not signed in

Full field semantics: **`CARMUNITY_AUCTION_WATCHLIST_CONTRACT.md`**.

### GET `/api/auctions/:id/watch`

**200:** `{ "ok": true, "watching": true | false }`  
**401** — not signed in

### POST `/api/auctions/:id/watch`

**200:** `{ "ok": true }`  
**404** — auction not found  
**401** — not signed in

### DELETE `/api/auctions/:id/watch`

**200:** `{ "ok": true }`  
**401** — not signed in

---

## Error envelope

Failures use:

```json
{ "ok": false, "error": "Human-readable message" }
```

with an appropriate HTTP status.
