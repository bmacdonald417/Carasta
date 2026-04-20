# Carmunity Phase I — Discovery and retention

Phase I adds lightweight **social graph** and **return paths** on top of the existing `/u/[handle]` identity and Discussions stack (Phase G/H). Changes are additive: same `Follow` model, extended notifications, new `ForumThreadSubscription` for saved threads, and curated discovery queries on the discussions landing page (plus a small strip on Carmunity).

---

## 1. Files created

| Path | Role |
| --- | --- |
| `prisma/migrations/20260419120000_phase_i_thread_subscriptions/migration.sql` | Creates `ForumThreadSubscription` with unique `(userId, threadId)`. |
| `lib/forums/thread-subscriptions.ts` | Helpers: `isUserSubscribedToThread`, `listSavedThreadsForUser`, `savedThreadHref`. |
| `lib/forums/discussions-discovery.ts` | `listRecommendedGears`, `listTrendingThreadsGlobal`, `listSuggestedDiscussionUsers`. |
| `lib/notifications/carmunity-retention-notifications.ts` | `USER_FOLLOW`, `SUBSCRIBED_THREAD_REPLY` notifications with mute/block + dedupe. |
| `app/api/user/follow/route.ts` | `POST` / `DELETE` JSON `{ userId }` → follow/unfollow + follow notify only on **new** follow. |
| `app/api/discussions/threads/[threadId]/subscribe/route.ts` | `POST` / `DELETE` save (subscribe) / unsave for a thread. |
| `components/discussions/DiscussionThreadSaveButton.tsx` | Client toggle for save; refreshes router after success. |
| `app/(app)/u/[handle]/followers/page.tsx` | Public follower list with block-aware filtering for the signed-in viewer. |
| `app/(app)/u/[handle]/following/page.tsx` | Public following list with the same filtering. |
| `CARMUNITY_PHASE_I_DISCOVERY_AND_RETENTION.md` | This document. |

---

## 2. Files modified

| Path | Change summary |
| --- | --- |
| `prisma/schema.prisma` | `ForumThreadSubscription` model; relations on `User` and `ForumThread`. |
| `lib/user-safety.ts` | `usersAreBlockedEitherWay`; `peerUserIdsHiddenFromViewer` for list UIs. |
| `lib/carmunity/engagement-service.ts` | Follow blocked if either direction block. |
| `lib/forums/forum-service.ts` | After reply + mentions, `notifySubscribedThreadNewReply`. |
| `app/(app)/u/[handle]/page.tsx` | Clickable follower/following stats; **Saved discussions** (own profile); following-activity placeholder. |
| `app/(app)/u/[handle]/follow-button.tsx` | Uses `/api/user/follow` + `router.refresh()`. |
| `app/(marketing)/discussions/page.tsx` | Discovery sections + existing Gear list. |
| `app/(marketing)/explore/page.tsx` | Optional “Trending in discussions” strip. |
| `app/(marketing)/discussions/.../[threadId]/page.tsx` | Save button; follow author in header; prefetch `viewerFollowsAuthor`. |

---

## 3. Follow system behavior

- **Storage**: Existing Prisma `Follow` (`followerId`, `followingId`, `@@unique([followerId, followingId])`).
- **Rules**: Cannot follow self; blocked either way → error from `followCarmunityUser`; `upsert` makes follow idempotent.
- **API**: `POST` / `DELETE` `/api/user/follow` with body `{ "userId": "<targetUserId>" }`. Requires session.
- **Notifications**: On **new** follow (not already following), `notifyUserFollowed` creates `USER_FOLLOW` with payload `title` + `href` to `/u/[actorHandle]`. Respects mute/block; 24h dedupe per actor/recipient.
- **UI**: `FollowButton` on profile and thread author row; profile stats link to `/u/[handle]/followers` and `/following`.

---

## 4. Thread save system behavior

- **Storage**: `ForumThreadSubscription` (`userId`, `threadId`, `createdAt`, `@@unique([userId, threadId])`).
- **Semantics**: “Save thread” = subscribe; same row used for future reply notifications.
- **API**: `POST` / `DELETE` `/api/discussions/threads/[threadId]/subscribe` (no body). Rejects hidden threads and save if viewer is blocked either way with the thread author.
- **UI**: `DiscussionThreadSaveButton` on thread page (signed-in). **Saved discussions** on own `/u/[handle]` lists recent saves via `listSavedThreadsForUser` (hidden threads filtered out).

---

## 5. Discovery logic

| Surface | Logic |
| --- | --- |
| **Active Gears** | SQL: count non-hidden threads per active space with `lastActivityAt` in last **14 days**; order by count, then `sortOrder`. |
| **Trending threads** | SQL: global non-hidden threads in active spaces, `lastActivityAt` within **30 days**; score `(replyCount*2 + reactionCount*1.2 + 1) / (1 + hours_since_activity/18)`; same spirit as Phase G category trending, simplified for cross-Gear. |
| **Suggested voices** | SQL: union thread authors + reply authors in last **30 days** (non-hidden); sum counts per user; exclude demo seed; optional exclude signed-in user on discussions page. |

---

## 6. Notification expansion

| Type | When | Notes |
| --- | --- | --- |
| `USER_FOLLOW` | Someone newly follows you | Mute/block; 24h dedupe; `href` to follower profile. |
| `SUBSCRIBED_THREAD_REPLY` | New reply on a thread you saved | Skips actor; for **direct** replies skips thread OP (they already get thread-reply path); mute/block; per-recipient `targetId` dedupe. |

Existing `NotificationDropdown` reads `payload.href` and `title` — no change required for rendering.

---

## 7. What was deferred

- **ML / deep personalization**: No scoring beyond explicit SQL heuristics.
- **Following activity feed**: Placeholder on own profile only; no backend feed yet.
- **Same-Gear suggested users**: Heuristic is global activity only (same-Gear cohort would need extra joins/index tuning).
- **Pagination** for saved threads and follower/following lists: capped lists (12 / 100) for Phase I.
- **Email / push** for new retention events: in-app notifications only.

---

## 8. Recommended Phase J

- **Feed from follows**: Home or `/explore` tab mixing posts + discussion activity from followed users only.
- **Digest**: Weekly email or in-app summary of saved threads with new replies.
- **Richer discovery**: Same-Gear suggestions, “new in your Gears” row, optional admin-curated picks.
- **Performance**: Materialized or cached trending snapshots if traffic grows; index review on `ForumThread.lastActivityAt` and subscription lookups.

---

## Validation (local)

```bash
npx prisma generate
npm run lint
npx tsc --noEmit
```

Manual checks: follow/unfollow (including self → error), save/unsave, saved list on profile, discovery sections render with seed data, new notifications respect block/mute, thread page still 404s when visibility rules say so (Phase H unchanged).
