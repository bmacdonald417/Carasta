# Forums API (JSON) — Carasta

Base URL: same origin as the web app (e.g. `https://…/api/forums/...`). Responses are JSON unless noted.

## Auth

- **Read** endpoints: **no** session required (public).
- **Write** endpoints: **`getJwtSubjectUserId`** — NextAuth JWT from `Cookie: next-auth.session-token=…` (or future Bearer).  
- **401:** `{ "ok": false, "error": "Unauthorized" }`

---

## GET `/api/forums/spaces`

List active forum spaces (e.g. Mechanics Corner, Gear Interests).

**200**

```json
{
  "ok": true,
  "spaces": [
    {
      "id": "…",
      "slug": "mechanics-corner",
      "title": "Mechanics Corner",
      "description": "…",
      "sortOrder": 0,
      "categoryCount": 2
    }
  ]
}
```

---

## GET `/api/forums/spaces/[slug]`

Space detail with categories and **thread counts** per category.

**200**

```json
{
  "ok": true,
  "space": {
    "id": "…",
    "slug": "mechanics-corner",
    "title": "Mechanics Corner",
    "description": "…",
    "sortOrder": 0,
    "categories": [
      {
        "id": "…",
        "slug": "general",
        "title": "General",
        "description": null,
        "sortOrder": 0,
        "threadCount": 12,
        "metadata": null
      }
    ]
  }
}
```

**404** — unknown or inactive slug: `{ "ok": false, "error": "Forum space not found." }`

---

## GET `/api/forums/categories/[categoryId]/threads`

Paginated threads for a category, newest activity first.

**Query**

| Param | Description |
|-------|-------------|
| `take` | Optional; 1–50, default **20** |
| `cursor` | Optional; **thread id** of the last item from the previous page |

**200**

```json
{
  "ok": true,
  "threads": [
    {
      "id": "…",
      "title": "Thread title",
      "replyCount": 3,
      "lastActivityAt": "2026-04-14T12:00:00.000Z",
      "createdAt": "2026-04-13T10:00:00.000Z",
      "author": {
        "id": "…",
        "handle": "trackdaytom",
        "name": "Tom",
        "avatarUrl": null
      }
    }
  ],
  "nextCursor": "… or null"
}
```

**404** — `{ "ok": false, "error": "Category not found." }`

---

## GET `/api/forums/threads/[id]`

Thread detail with replies (oldest reply first).

**200**

```json
{
  "ok": true,
  "thread": {
    "id": "…",
    "title": "…",
    "body": "…",
    "replyCount": 2,
    "locked": false,
    "lastActivityAt": "…",
    "createdAt": "…",
    "category": {
      "id": "…",
      "slug": "general",
      "title": "General",
      "space": { "id": "…", "slug": "mechanics-corner", "title": "Mechanics Corner" }
    },
    "author": { "id": "…", "handle": "…", "name": "…", "avatarUrl": null },
    "replies": [
      {
        "id": "…",
        "body": "…",
        "createdAt": "…",
        "author": { "id": "…", "handle": "…", "name": "…", "avatarUrl": null }
      }
    ]
  }
}
```

**404** — `{ "ok": false, "error": "Thread not found." }`

---

## POST `/api/forums/threads`

Create a thread (**signed in**).

**Body**

```json
{
  "categoryId": "cuid",
  "title": "Thread title",
  "body": "Markdown or plain text — stored as-is (no server-side MD rendering in this contract)."
}
```

**200**

```json
{ "ok": true, "threadId": "…" }
```

**400** — validation / inactive space / missing category  
**401** — not signed in

---

## POST `/api/forums/threads/[id]/replies`

Add a reply (**signed in**).

**Body** (either field accepted)

```json
{ "body": "Reply text" }
```

or

```json
{ "content": "Reply text" }
```

**200**

```json
{ "ok": true, "replyId": "…", "replyCount": 4 }
```

**400** — empty body / validation  
**403** — thread locked: `{ "ok": false, "error": "This thread is locked." }`  
**404** — thread missing  
**401** — not signed in

---

## Error envelope

Failures use:

```json
{ "ok": false, "error": "Human-readable message" }
```

with an appropriate HTTP status.
