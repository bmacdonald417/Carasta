# Carmunity auction watchlist (API contract)

User-specific **save/watch** for auctions. **Auth required** for mutations and for viewer-specific read flags. **No bidding** and no duplication of auction pricing logic — only `AuctionWatch` rows and auction existence checks.

## Data model

- **`AuctionWatch`** (`prisma/schema.prisma`): `userId`, `auctionId`, `createdAt`, `@@unique([userId, auctionId])`.
- Distinct from **`GarageCar`** (owner inventory / dream garage). Watchlist is **interest in live listings**, not owned vehicles.

## `GET /api/auctions/[id]` (detail)

When the request resolves a viewer (cookie or Bearer), response includes:

```json
{
  "ok": true,
  "watching": true,
  "id": "…",
  …
}
```

- **`watching`**: `false` if unauthenticated or not watching.

## `GET /api/auctions/[id]/watch`

**401** — not signed in.

**200:**

```json
{ "ok": true, "watching": true }
```

## `POST /api/auctions/[id]/watch`

Creates or idempotently ensures a watch row.

**401** — not signed in.

**404** — `{ "ok": false, "error": "Auction not found." }` (or same shape as `watchAuction` returns) if auction id does not exist.

**200:**

```json
{ "ok": true }
```

## `DELETE /api/auctions/[id]/watch`

Removes watch row if present (idempotent).

**401** — not signed in.

**200:**

```json
{ "ok": true }
```

## `GET /api/carmunity/watchlist`

Lists saved auctions for the signed-in user (newest watch first).

**401** — not signed in.

**200:**

```json
{
  "ok": true,
  "items": [
    {
      "id": "<auctionId>",
      "title": "…",
      "endAt": "…ISO…",
      "imageUrl": "https://…" | null,
      "status": "LIVE"
    }
  ],
  "auctionIds": ["<auctionId>", "…"]
}
```

`auctionIds` mirrors `items[].id` for cheap client caching.

## Auth header

All routes above accept **`Cookie`** (NextAuth session) or **`Authorization: Bearer <jwt>`** as documented in **`CARMUNITY_MOBILE_AUTH_BRIDGE.md`**.

## Operational note

After pulling schema changes, run **`npx prisma generate`** and apply migrations / `db push` so `AuctionWatch` exists in the database.
