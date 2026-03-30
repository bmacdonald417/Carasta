# Marketing Phase 11 — Structured Carmunity ↔ auction linkage

**Date:** 2026-04-01  
**Scope:** Optional **`Post.auctionId`** for posts created via **seller marketing → Promote to Carmunity**; seller-only **linked promo list** on the auction marketing drill-down. **No** explore feed redesign, **no** requirement that community posts reference auctions, **no** public listing page changes in this PR.

---

## Schema

| Change | Detail |
|--------|--------|
| **`Post.auctionId`** | Nullable `String?`, FK → **`Auction.id`**, **`onDelete: SetNull`** |
| **`Auction.promoPosts`** | Reverse relation name **`AuctionPromoPosts`** |
| **Index** | **`Post_auctionId_idx`** |

**Migration:** `20260401153000_post_auction_link`

Existing rows: **`auctionId` null** — valid. Seed and **`createPost`** (`explore/actions.ts`) unchanged (omit field → null).

---

## Where `auctionId` is set

Only **`publishCarmunityPromoPost`** in **`app/(app)/u/[handle]/marketing/auctions/carmunity-promo-actions.ts`**, after the same **`sellerId === session user`** checks as before. Value is the **current listing id** from the verified auction row.

---

## Seller surfacing

- **`getSellerMarketingAuctionDetail`** loads **`linkedPromoPosts`**: `where: { auctionId, authorId: sellerId }`, `orderBy: createdAt desc`, `take: 20`, with trimmed **content preview** (text posts) and **`imageUrl`** for thumb.
- **`AuctionLinkedPromoPostsSection`** on **`/u/[handle]/marketing/auctions/[auctionId]`** — empty state copy + list with **View on Carmunity** → **`/explore/post/[id]`**.

---

## Backward compatibility

- **`/explore`** **`createPost`**, feed API, post detail page: no required changes; Prisma adds nullable column.
- Historical posts without **`auctionId`** behave as before.
- **Caption link** inside content remains the public human signal; FK is for **traceability** and future product use.

---

## PR 12 (next best step)

**Edge / WAF (or app-layer) rate limiting** for **`POST /api/marketing/track`**, **or** lightweight **seller marketing notifications** / digest — pick **one** slice per PR.
