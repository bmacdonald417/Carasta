# Carmunity mobile-safe API (JSON)

Base URL: same origin as the Carasta deployment (e.g. `https://…`). All responses are JSON.

## Auth (Phase 2)

- **Today:** `getToken` / JWT **subject** from the **NextAuth session cookie** on the request (`Cookie` header), via `NEXTAUTH_SECRET`.
- **Flutter:** must send a session cookie **or** a future **Bearer** scheme once implemented. Unauthenticated requests return **401** `{ "ok": false, "error": "Unauthorized" }`.

## Endpoints

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
