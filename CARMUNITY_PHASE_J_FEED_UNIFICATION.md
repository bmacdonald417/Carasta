# Carmunity Phase J — Following feed and product unification

Phase J unifies **Carmunity (feed)** and **Discussions** at the **service + UI layer** without merging database tables. Identity stays on **`/u/[handle]`**.

---

## 1. Files created

| Path | Role |
| --- | --- |
| `lib/carmunity/following-feed.ts` | Allowlisted following authors (block + mute), `getFollowingFeedPayload`, `listFollowedThreadsForViewer` for discussions. |
| `app/api/carmunity/feed/route.ts` | `GET /api/carmunity/feed?mode=following` — session viewer only; returns normalized feed items. |
| `prisma/migrations/20260420120000_phase_j_subscription_last_viewed/migration.sql` | Adds `lastViewedAt` on `ForumThreadSubscription`. |
| `CARMUNITY_PHASE_J_FEED_UNIFICATION.md` | This document. |

---

## 2. Files modified

| Path | Change summary |
| --- | --- |
| `prisma/schema.prisma` | `ForumThreadSubscription.lastViewedAt` optional. |
| `lib/discussions/discussion-paths.ts` | `discussionReplyAnchorId`, `discussionThreadReplyHref` for reply deep links. |
| `lib/forums/thread-subscriptions.ts` | `hasNewActivity` on saved list; `touchForumThreadSubscriptionViewed`. |
| `app/(marketing)/explore/community-feed.tsx` | Following tab uses unified API; thread/reply cards; “From discussions” strip. |
| `app/(marketing)/explore/page.tsx` | Passes trending threads into feed; copy points to unified experience. |
| `components/carmunity/FeedEmptyState.tsx` | Following copy + Discussions CTA link. |
| `app/(marketing)/discussions/page.tsx` | “Threads from people you follow” + link to Following feed. |
| `app/(marketing)/discussions/.../[threadId]/page.tsx` | Subscription row, new-activity dot on save, touch viewed on load. |
| `components/discussions/DiscussionThreadSaveButton.tsx` | Optional new-activity dot when saved. |
| `components/discussions/DiscussionThreadRepliesPanel.tsx` | Stable reply anchor ids + smooth scroll to hash. |
| `app/(app)/u/[handle]/page.tsx` | Saved list new-activity dot; following-activity blurb points to Following tab. |

---

## 3. Following feed behavior

1. **Auth**: `GET /api/carmunity/feed?mode=following` uses **`getSession()`** only (no `userId` query param) — **401** if signed out.  
2. **Author allowlist**: Users the viewer **follows**, minus **either-direction blocks** (`peerUserIdsHiddenFromViewer`) and minus **viewer mutes** (`UserMute` where `userId = viewer`).  
3. **Content**: In parallel, loads recent **posts**, **forum threads**, and **forum replies** authored by allowlisted users.  
4. **Rules**: Excludes **hidden** threads/replies and inactive Gears (`ForumSpace.isActive`).  
5. **Merge**: Each row becomes a union item `{ type, sortAt }` with **`sortAt` = `createdAt`**; merged list sorted **newest first**, capped (default 50).  
6. **Likes**: Viewer liked-state for posts is batched with one `Like` query.

---

## 4. Feed item types

| `type` | UI | Primary link |
| --- | --- | --- |
| `post` | Existing post card + small “Post” label | `/explore/post/[id]` |
| `thread` | Card: author, Gear titles, title, snippet, reply + reaction counts | Discussions thread URL |
| `reply` | Card: “Replied in [thread]”, snippet, breadcrumb slugs | Thread URL + `#discussion-reply-{replyId}` |

---

## 5. How discussions integrate into the feed

- **Data**: Same `ForumThread` / `ForumReply` models; no duplicate content tables.  
- **Navigation**: Thread and reply cards link into **`/discussions/...`**; reply links use **anchors** aligned with `discussionReplyAnchorId`.  
- **Explore**: **“From discussions — Trending threads”** strip is rendered **inside** `CommunityFeed` (server still loads trending via `listTrendingThreadsGlobal` on the explore page).  
- **Discussions landing**: Signed-in users see **threads from people they follow** with a shortcut to **`/explore?tab=following`**.

---

## 6. Saved thread signals

- **`lastViewedAt`** on `ForumThreadSubscription`, updated when an authenticated subscriber **opens the thread page** (`touchForumThreadSubscriptionViewed`).  
- **Heuristic**: `hasNewActivity` when `thread.lastActivityAt` is newer than **`lastViewedAt ?? subscription.createdAt`**.  
- **UI**: Dot on **Saved thread** button (thread page) and on **Saved discussions** rows (own profile) when `hasNewActivity` is true **for that server render** (dot reflects state **before** the view touch in the same response, so the first load after a reply can still show a dot until a refresh — acceptable for a lightweight signal).

---

## 7. What was deferred

- **Server-driven “mark read” without full page navigation** (e.g. client-only save strip) — not required for Phase J.  
- **Pagination / cursors** on the following feed — fixed caps per source (~45) then global slice.  
- **Mute semantics beyond feed** — mutes still only **exclude** authors from the **following** feed; thread visibility elsewhere unchanged (matches Phase H note on mutes).  
- **Rich “same Gear” following module** — only simple followed-thread list on `/discussions`.  
- **Unread counts / inbox model** — explicitly out of scope.

---

## 8. Recommended Phase K

- **Cursor-based feed** (posts + discussions) with stable pagination.  
- **Web push / email digest** for following + saved-thread activity.  
- **Inline engagement** (react to thread from feed preview) with strict rate limits.  
- **Graph index tuning** (`ForumThread.authorId + createdAt`, `ForumReply.authorId + createdAt`) under load.

---

## Validation

```bash
npx prisma generate
npm run lint
npx tsc --noEmit
```

Apply the new migration (or `prisma db push`) so `lastViewedAt` exists in production.

Manual checks: Following tab (signed in) shows mixed items; anchors scroll to reply; blocks/mutes remove authors from following feed; saved dot clears after visiting thread and refreshing.
