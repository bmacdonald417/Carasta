# Carmunity mobile-safe API (JSON)

Base URL: same origin as the Carasta deployment (e.g. `https://…`). All responses are JSON.

## Auth (Phase 2)

- **Today:** `getToken` / JWT **subject** from the **NextAuth session cookie** on the request (`Cookie` header), via `NEXTAUTH_SECRET`.
- **Flutter:** must send a session cookie **or** a future **Bearer** scheme once implemented. Unauthenticated requests return **401** `{ "ok": false, "error": "Unauthorized" }`.

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

**Images:** `imageUrl` must be a URL the server can persist (usually **https** to a publicly reachable object). **Binary uploads** are not handled by this route; mobile apps should obtain `imageUrl` via a future **upload/presign** API (see Phase 3 notes) or any other server-approved source.

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

## Error envelope

Failures use:

```json
{ "ok": false, "error": "Human-readable message" }
```

with an appropriate HTTP status.
