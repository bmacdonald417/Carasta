# Carmunity Phase G — Moderation + Pagination + Ranking

Phase G adds a **basic report intake path**, **pagination** for scale, and **clearer ranking** for Lower Gear lists — without changing unified identity (`User` + `/u/[handle]`) or breaking Phase E/F social loops.

## Files created

| File | Purpose |
|------|---------|
| `app/api/discussions/reports/route.ts` | `POST` authenticated discussion reports. |
| `app/(admin)/admin/moderation/discussions/page.tsx` | Admin-only read-only report queue + deep links to threads. |
| `lib/forums/discussion-reports.ts` | Create reports (dedupe + self-report guards) + admin listing helper. |
| `lib/forums/discussion-ranking.ts` | Human-readable ranking constants + documentation pointers. |
| `lib/forums/discussion-ranking-queries.ts` | SQL-backed id ordering for Trending/Top + Prisma ordering for New. |
| `lib/forums/profile-discussion-activity.ts` | Union timeline query for profile activity pages. |
| `components/discussions/DiscussionReportDialog.tsx` | Client report modal (reason + optional details). |
| `DISCUSSIONS_RANKING_NOTES.md` | Compact formula reference. |

## Files modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | `DiscussionReportReason`, `DiscussionReportStatus`, `DiscussionReport` model + relations on `User`, `ForumThread`, `ForumReply`. |
| `lib/forums/forum-service.ts` | Page-based Lower Gear lists + ranked ids; `listForumRepliesPage`; `getForumThreadDetail` returns `repliesNextCursor`; `ForumReplyListRow` type. |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/page.tsx` | `?page=` pagination + updated sort explainer. |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` | Thread report entry point; reply reports; paginated replies shell props. |
| `app/api/discussions/threads/[threadId]/replies/route.ts` | `GET` paginated replies (public). |
| `app/api/forums/categories/[categoryId]/threads/route.ts` | Switched from `cursor` to `page` + `sort` query params. |
| `app/api/notifications/route.ts` | Returns `{ items, nextCursor }` with composite keyset cursor. |
| `app/api/notifications/list/route.ts` | Returns `{ items, nextCursor: null }` for compatibility. |
| `components/discussions/DiscussionThreadRepliesPanel.tsx` | Client “Load more replies”; per-reply report. |
| `components/notifications/NotificationDropdown.tsx` | Parses new list shape + “Load more”. |
| `components/profile/CarmunityActivitySection.tsx` | Optional “Load more activity” footer. |
| `app/(app)/u/[handle]/page.tsx` | `?activityPage=` pagination for Carmunity activity. |
| `app/(admin)/admin/page.tsx` | Link card to `/admin/moderation/discussions`. |

## Moderation model + API

### Model

`DiscussionReport` stores:

- `reporterId` (who filed)
- **Exactly one target**: `threadId` **or** `replyId` (validated in service)
- `reason` (`DiscussionReportReason`)
- optional `details`
- `status` (`OPEN` by default; future workflow can use `REVIEWED`, `DISMISSED`, `ACTIONED`)
- optional `reviewedAt`, `reviewedById` (scaffold only — no automated enforcement)

### API

- `POST /api/discussions/reports` (signed in) accepts:
  - `{ target: "thread", threadId, reason, details? }`
  - `{ target: "reply", threadId, replyId, reason, details? }`

### Rules

- **Self-report** returns `400` with a clear message (no crashes).
- **Deduping**: an identical **open** report for the same `(reporter, target, reason)` returns `{ ok: true, deduped: true }`.

### Admin surface

`/admin/moderation/discussions` (existing middleware: `ADMIN` role) lists recent reports with links to the underlying thread.

## Pagination model by surface

| Surface | Mechanism | Notes |
|---------|-----------|------|
| Lower Gear thread list | **Offset pages** via `?page=` | Stable with ranking SQL; `take` defaults to `20` server-side. |
| Thread replies | **Cursor** on reply `id` (ascending creation order) | Initial SSR page + “Load more” via `GET /api/discussions/threads/[threadId]/replies?cursor=&take=`. |
| Profile Carmunion activity | **Offset pages** via `?activityPage=` | Backed by SQL `UNION ALL` timeline. |
| Notifications | **Keyset** on `(createdAt desc, id desc)` | `GET /api/notifications?take=&cursorCreatedAt=&cursorId=` returns `{ items, nextCursor }`. |

## Ranking logic (summary)

See `DISCUSSIONS_RANKING_NOTES.md` and `lib/forums/discussion-ranking.ts`.

## Intentionally deferred

- Automated removals, shadowbans, suspensions, appeals workflow
- Distributed rate limits + abuse classifiers
- Rich moderation tooling (bulk actions, assignment queues, SLA dashboards)
- Denormalized “hot score” columns maintained by triggers (would reduce SQL complexity at very large scale)
- Email/push for reports

## Recommended Phase H

- **Moderation workflow**: status transitions, reviewer notes, audit log export
- **Safety**: user blocks, mute mentions, stricter rate limits (Redis/edge)
- **Quality**: denormalized counters / materialized views for thread lists at very large scale
- **Product**: report reasons analytics, optional reporter feedback loop
