# Carmunity Phase F — Interaction Layer

Phase F activates discussions as a social surface: interactive reactions, in-app notifications, and `@handle` mentions that resolve to canonical profiles (`/u/[handle]`). Identity remains a single `User` model — no forum-specific users.

## Files created

| File | Purpose |
|------|---------|
| `app/api/discussions/reactions/route.ts` | `POST` upsert / `DELETE` remove discussion reactions (thread or reply). |
| `app/api/notifications/route.ts` | `GET /api/notifications?take=` — list notifications for the signed-in user. |
| `app/api/notifications/[id]/read/route.ts` | `PATCH` mark one notification read. |
| `lib/api-rate-limit.ts` | In-process cooldown map for best-effort API throttling. |
| `lib/discussions/reaction-labels.ts` | Shared reaction ordering + labels for UI summaries and picker. |
| `lib/discussions/mentions.ts` | Mention regex + handle extraction + optional DB lookup helper. |
| `lib/forums/discussion-reactions.ts` | Server helpers to upsert/remove reactions and enqueue owner notifications. |
| `lib/notifications/carmunity-discussion-notifications.ts` | Typed helpers for Carmunity discussion notification payloads + dedupe. |
| `components/discussions/DiscussionReactionPicker.tsx` | Client picker + optimistic selected kind + refresh. |
| `components/discussions/DiscussionRichText.tsx` | Client renderer: valid `@mentions` → `AuthorHandleLink`. |
| `components/discussions/DiscussionThreadRepliesPanel.tsx` | Client panel: replies, nested reply target, reactions, composer. |

## Files modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | One reaction per user per thread/reply (`@@unique([threadId,userId])` / `@@unique([replyId,userId])`), `updatedAt` on reaction rows, `ForumReply.parentReplyId` + self-relation, `Notification.actorId` + `Notification.targetId` + actor relation + index for dedupe queries. |
| `prisma/seed-badges-reactions.ts` | Upsert keys updated for new unique constraints. |
| `lib/forums/forum-service.ts` | `getForumThreadDetail(id, viewerUserId?)` returns `viewerReactionKind`; `createForumReply` supports `parentReplyId`, emits reply + mention notifications. |
| `app/api/discussions/threads/[threadId]/replies/route.ts` | Accepts `parentReplyId`, rate limit. |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` | Session-aware detail, mention resolution, rich OP body, reaction picker, client replies panel. |
| `components/discussions/DiscussionReactionSummary.tsx` | Uses shared reaction label map. |
| `components/discussions/DiscussionThreadReplyComposer.tsx` | Parent reply support, mention tip, callback URL prop. |
| `components/notifications/NotificationDropdown.tsx` | Uses `GET /api/notifications`, copper badge, discussion `href`, per-item `PATCH` read. |

## Reaction behavior rules

- **Models**: `ForumThreadReaction` / `ForumReplyReaction` with `DiscussionReactionKind`.
- **Cardinality**: At most **one row per (target, user)**. Changing reaction updates `kind`; removing deletes the row.
- **API**: `POST /api/discussions/reactions` `{ target: "thread" \| "reply", targetId, kind }`; `DELETE /api/discussions/reactions` `{ target, targetId }`.
- **Auth**: NextAuth JWT (`getToken`) — must be signed in.
- **Spam guard**: ~450 ms per-user cooldown on POST/DELETE reactions (in-process).
- **Notifications**: When a reaction is set/changed, the **content owner** receives a `REACTION` notification unless they self-reacted. Duplicate collapse: same `(recipient, actor, targetId, type=REACTION)` within **10 minutes** is skipped.

## Notification system structure

- **Storage**: Existing `Notification` row extended with `actorId`, `targetId` (legacy rows keep `null` — still valid).
- **Payload**: `payloadJson` includes human copy (`title`, optional `message`) and **`href`** deep-linking to `/discussions/[gear]/[lowerGear]/[threadId]`.
- **Types** (string `type` column):
  - `THREAD_REPLY` — top-level reply to your thread.
  - `REPLY_REPLY` — reply nested under your comment (`parentReplyId`).
  - `REACTION` — reaction on your thread or reply.
  - `MENTION` — `@handle` referenced your profile in a reply body.
- **API**:
  - `GET /api/notifications?take=` — list (existing `list` route kept for compatibility).
  - `PATCH /api/notifications/[id]/read` — mark single read (verifies `userId`).
  - Existing `GET /api/notifications/unread-count` + server action `markAllNotificationsRead` unchanged in spirit.

## Mention parsing approach

- Regex: `/@([a-zA-Z0-9_]{2,32})/g` (see `MENTION_HANDLE_REGEX`).
- **Render-time**: Thread page loads all handles referenced in OP + replies, queries `User` case-insensitively, passes lowercase valid handles to `DiscussionRichText`. Unknown tokens stay plain text.
- **Write-time**: On reply creation, handles resolved through Prisma; each distinct recipient gets a `MENTION` notification (deduped within **2 minutes** per actor/thread/recipient aggregate key).

## Guardrails implemented

- Reaction + reply routes: lightweight **rate limits** via `lib/api-rate-limit.ts`.
- Zod validation on JSON bodies for reactions and replies.
- Notification dedupe for noisy events (`REACTION`, `MENTION`) as described above.
- Reaction notifications suppressed for **self-reactions** and **self-mentions**.

## Known limitations

- Rate limits are **per server instance** (in-memory) — not distributed across horizontally scaled workers.
- Nested reply depth is **one level** (`parentReplyId` only) — no full tree UI.
- Thread **OP mention notifications on thread create** are not wired (no public thread-create API in this repo yet).
- `GET /api/forums/threads/[id]` remains anonymous — it does not expose the viewer’s personal reaction selection.

## Database migration

Schema changes require applying to PostgreSQL (`npx prisma db push` or a migration).

- `ForumThreadReaction.updatedAt` / `ForumReplyReaction.updatedAt` use `@default(now()) @updatedAt` so existing rows backfill cleanly.
- If legacy data ever contains **multiple reaction rows per user per target**, dedupe (keep the newest) **before** adding `@@unique([threadId,userId])` / `@@unique([replyId,userId])`, otherwise the migration will fail.

## Recommended Phase G

- Distributed rate limiting (Redis / edge) + stricter abuse heuristics.
- **Reaction picker polish**: keyboard navigation, touch-friendly sheet, haptic hooks for mobile web.
- **Notification fan-out**: digest mode, quiet hours, per-type preferences.
- **Mentions v2**: autocomplete in composer, mention permissions / blocks, server highlight index.
- **Threading UI**: collapsible trees, “jump to parent”, moderation tools.
- **Read-path parity**: extend public thread JSON API with `viewerReactionKind` when authorized.
