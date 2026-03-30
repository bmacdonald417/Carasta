# Marketing Phase 7 — Carmunity draft promotion (manual publish)

**Date:** 2026-03-30  
**Scope:** Seller-only **Promote to Carmunity** on the auction marketing drill-down: deterministic drafts, editable caption, template tabs, preview, **manual** publish into the existing **`Post`** model. No automation, scheduling, or campaign-triggered posting.

---

## Schema

**No schema change.** `Post` remains `authorId`, `content`, `imageUrl` (optional). Auction linkage is via **URL inside caption** (Carmunity-tracked link from `buildMarketingLinkKit`), not an FK.

---

## Draft generation

- **`lib/marketing/generate-carmunity-draft.ts`** — builds a `CarmunityDraftPack`: three templates (**New listing**, **Ending soon**, **Featured pick**), promo headline, hashtags line, `listingUrl` (`utm` carmunity variant), primary image URL when available.
- Reuses **`generateSellerShareCopy`** for facts and tone; rewrites embedded listing URLs to **`links.carmunity`** so attribution matches community traffic.

---

## Publish path

- **`app/(app)/u/[handle]/marketing/auctions/carmunity-promo-actions.ts`** — server action **`publishCarmunityPromoPost`**:
  - Requires **`MARKETING_ENABLED`**, session, and **profile handle** match session user.
  - Loads auction with **`sellerId === session user`**; rejects otherwise.
  - **`prisma.post.create`** with seller as **`authorId`**, edited **caption**, optional **first listing photo** (`includeAuctionImage`) — image URL taken **only** from DB (`AuctionImage`), never from raw client input.
  - **`revalidatePath("/explore")`** and marketing auction page.

Does **not** reuse `createPost` from `explore/actions.ts` to keep auction ownership checks in one place; behavior mirrors it (`content` + optional `imageUrl`).

---

## UI

- **`components/marketing/carmunity-promo-panel.tsx`** (client) — tabs, textarea, include-photo checkbox, preview, publish + link to `/explore`.
- **`components/marketing/carmunity-post-preview.tsx`** — read-only community-style card.
- **`app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`** — renders panel after **Share & Promote**.
- **`getSellerMarketingAuctionDetail`** — adds **`auction.primaryImageUrl`** (first `AuctionImage`) for draft + checkbox.

---

## Limitations

- **No `Post` ↔ `Auction` FK** — deep links, analytics fusion, or “promoted listing” badges are future work.
- **One primary photo** only (first by `sortOrder`); no gallery picker.
- **Template switch** replaces caption (edits lost when changing tab); intentional for simplicity.
- Historical community **`createPost`** flow on `/explore` unchanged.

---

## Follow-ons (after Phase 8)

Phase 8 added **`BID_CLICK`** intent — see **`MARKETING_PHASE_8_NOTES.md`**. Further ideas:

- Saved **UTM presets** (manual) tied to campaigns or share kit.
- **IP-based** or sampled ingest throttles if volume grows.
- Optional **`Post.auctionId`** FK if product wants structured linkage.
