# Carmunity Phase M — Auction + social integration

## 1. Files created

- `prisma/migrations/20260418120000_forum_thread_auction_id/migration.sql` — adds nullable `ForumThread.auctionId` FK to `Auction`, index.
- `lib/forums/auction-discussion-constants.ts` — slugs for the dedicated discussion bucket (`listings-auctions` / `listing-chat`).
- `lib/forums/auction-discussion.ts` — queries (threads for an auction, counts, reaction sums), `createAuctionDiscussionThread`, `listDiscussedLiveAuctions` (Explore crossover).
- `app/api/auctions/[id]/discussion-thread/route.ts` — authenticated `POST` to create a listing-linked thread (defaults + optional body).
- `components/auction/AuctionDiscussPanel.tsx` — client UI: “Discuss this auction”, list up to 3 threads, start/add thread.
- `components/discussions/DiscussionAuctionContextCard.tsx` — compact listing card on thread pages when a thread is tied to an auction.
- `components/explore/DiscussedAuctionsStrip.tsx` — Explore module for LIVE auctions with recent linked discussion.

## 2. Files modified

- `prisma/schema.prisma` — `ForumThread.auctionId` + relations; `Auction.discussionThreads`.
- `prisma/seed.ts` — ensures `ForumSpace` **listings-auctions** and `ForumCategory` **listing-chat** (idempotent upserts).
- `lib/forums/forum-service.ts` — `getForumThreadDetail` includes optional `auction` payload (title, image, bids snippet, status).
- `app/(marketing)/auctions/[id]/page.tsx` — discussion panel + seller trust (badges, reputation, all-time thread/reply counts).
- `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` — renders auction context card when linked.
- `app/(marketing)/explore/page.tsx` — loads `listDiscussedLiveAuctions`.
- `app/(marketing)/explore/community-feed.tsx` — renders `DiscussedAuctionsStrip`.

## 3. Data model changes

| Change | Notes |
|--------|--------|
| `ForumThread.auctionId` | Optional `String?`, FK → `Auction.id`, `ON DELETE SET NULL`. |
| Index | `@@index([auctionId])` for listing lookups. |
| `Auction.discussionThreads` | Reverse relation for clarity / future admin tools. |

No changes to `User`, `Post`, or duplicate identity models.

## 4. How auction → discussion linking works

1. **Taxonomy:** Threads created from an auction are stored in **Listings & auctions → Listing discussion** (`listings-auctions` / `listing-chat`), created by seed alongside legacy spaces.
2. **Creation:** Signed-in users `POST /api/auctions/[id]/discussion-thread` with optional `{ title?, body? }`. Server builds safe defaults (title `Discussion: …`, body includes listing path) unless overridden.
3. **Persistence:** `createAuctionDiscussionThread` writes `ForumThread` with `auctionId` set and `categoryId` resolved from the taxonomy above.
4. **Visibility:** Draft auctions only allow the seller to create (same visibility rule as auction detail). LIVE/ENDED/SOLD follow normal thread visibility rules (`isHidden`, blocks, etc.).

## 5. How discussion → auction linking works

- `getForumThreadDetail` loads `auction` when `auctionId` is set.
- Thread page renders **`DiscussionAuctionContextCard`**: image, title, vehicle line, high bid / reserve (when present), LIVE status hint in auction red, link to `/auctions/[id]`.

## 6. Seller / community trust signals (auction detail)

- **Unified profile link** — unchanged path `/u/[handle]`.
- **Reputation score** — existing `User.reputationScore` (transparent integer).
- **Collector tier** — existing `ReputationBadge`.
- **Carmunity badges** — up to 8 recent `UserBadge` names via `DiscussionAuthorBadges` (copper styling).
- **Discussion footprint** — all-time counts: threads authored + replies in Discussions (`_count.forumThreads`, `_count.forumReplies`). No synthetic “trust score”.

## 7. Social proof surfaced (accurate only)

| Surface | Data |
|---------|------|
| Auction detail panel | Thread count (non-hidden `auctionId` match), sum of **thread-level** reactions across those threads, up to 3 thread links with reply + reaction counts per thread. |
| Explore strip | LIVE auctions with `endAt` in the future, at least one linked thread with `lastActivityAt` in the last **14 days**; per-auction **total** linked thread count (non-hidden) via `groupBy`. |

Not shown: fake urgency, watchers-as-“social proof”, or metrics without DB backing.

## 8. Intentionally deferred

- Burying auction CTAs inside bid UI (kept separate to avoid noisy urgency).
- Reply-level reaction totals on auction cards (would require heavier aggregation).
- Auto-creating a thread when an auction goes LIVE.
- Email / push when new auction-linked thread appears.
- Rich OG for auction-linked threads beyond existing thread metadata.

## 9. Recommended Phase N

- **Moderation:** admin filter “threads by auction” and bulk unlink if needed.
- **Discovery:** optional `/discussions` hub row for “Active listing discussions” using the same helpers.
- **Quality:** soft cap on threads per auction (e.g. warn after N) to reduce spam.
- **Mobile:** Carmunity app deep link from thread card → auction.

## Validation

```bash
npx prisma generate   # after pulling schema
npx prisma migrate deploy   # or db push in dev — apply migration
npx prisma db seed      # ensures listings-auctions / listing-chat exist
npm run lint
npx tsc --noEmit
```

Manual: open a LIVE auction → start discussion → confirm thread in **Listings & auctions** and auction card on thread page; Explore shows strip when data exists.
