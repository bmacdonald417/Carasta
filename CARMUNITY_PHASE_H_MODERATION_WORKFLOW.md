# Carmunity Phase H — Moderation workflow & user safety

This document describes the **Phase H** implementation: actionable moderation, soft-hiding, user block/mute, and a light reporter feedback trail—while keeping **one** Carmunity identity (`User` / `/u/[handle]`).

## 1. Files created

| Path | Role |
|------|------|
| `prisma/migrations/20260418180000_phase_h_moderation_workflow/migration.sql` | SQL migration (enum tweak, columns, `UserBlock` / `UserMute`). |
| `lib/user-safety.ts` | Block list + “viewer blocks author?” + mute check helper for notifications. |
| `lib/auth/require-admin.ts` | Shared **ADMIN** session guard for admin JSON routes. |
| `app/api/admin/discussions/reports/[id]/route.ts` | `PATCH` — update report `status` / `moderatorNote`, stamp `reviewedAt` / `reviewedById`. |
| `app/api/admin/discussions/threads/[threadId]/route.ts` | `PATCH` — `{ isHidden }` soft-hide thread. |
| `app/api/admin/discussions/replies/[replyId]/route.ts` | `PATCH` — `{ isHidden }` soft-hide reply. |
| `app/api/user/block/route.ts` | `POST` / `DELETE` — block / unblock by user id. |
| `app/api/user/mute/route.ts` | `POST` / `DELETE` — mute / unmute by muted user id. |
| `components/discussions/AdminDiscussionModerationClient.tsx` | Admin moderation table (client interactions). |
| `components/discussions/DiscussionPeerSafetyMenu.tsx` | Compact Block / Mute controls (thread + profile). |
| `CARMUNITY_PHASE_H_MODERATION_WORKFLOW.md` | This file. |

## 2. Files modified

- `prisma/schema.prisma` — `DiscussionReportStatus` (`REVIEWING`), `moderatorNote`, hide fields on `ForumThread` / `ForumReply`, `UserBlock`, `UserMute`, `User` relations.
- `lib/forums/discussion-ranking-queries.ts` — visibility filters for ranked thread lists (hidden + blocked authors).
- `lib/forums/forum-service.ts` — visibility in recent/category lists, `getForumThreadDetail` gatekeeping, reply masking, `createForumReply` rejects hidden threads.
- `lib/forums/discussion-reports.ts` — admin list selects (`moderatorNote`, `reviewedBy`, hide flags).
- `lib/forums/discussion-reactions.ts` — reject reactions on hidden thread/reply.
- `lib/notifications/carmunity-discussion-notifications.ts` — skip creates when recipient **muted** actor.
- `app/(marketing)/discussions/...` — pass viewer + admin into forum queries; thread page peer safety + `getForumThreadDetail` options.
- `app/(admin)/admin/moderation/discussions/page.tsx` — actionable moderation UI.
- `app/(app)/u/[handle]/page.tsx` — block hides activity; peer safety menu.
- `app/api/discussions/threads/[threadId]/replies/route.ts` — pass `viewerIsAdmin` into reply pagination.
- `components/discussions/DiscussionThreadRepliesPanel.tsx` — “removed” placeholder for withdrawn replies.

## 3. Moderation state model

`DiscussionReportStatus`:

- `OPEN` — default for new reports.
- `REVIEWING` — triage (replaces legacy `REVIEWED` in the DB via migration mapping).
- `ACTIONED` — moderator took action (e.g. hide); suitable for a future “resolved” reporter ping.
- `DISMISSED` — closed without substantive action.

`DiscussionReport` fields:

- `moderatorNote` (optional text).
- `reviewedAt`, `reviewedById` — stamped on **any** admin `PATCH` to the report (light audit).

Admin API: `PATCH /api/admin/discussions/reports/[id]` (session **ADMIN** only).

## 4. Block / mute system

**Block (`UserBlock`)**

- Unique `(blockerId, blockedId)`.
- If **A** blocks **B**, **B**’s discussion content is hidden from **A** in:
  - thread lists (Lower Gear + Gear recent),
  - thread detail (`getForumThreadDetail` → 404 for A),
  - replies (masked placeholder for blocked authors),
  - profile “Carmunity Activity” on B’s profile (empty for A).

**Mute (`UserMute`)**

- Unique `(userId, mutedUserId)` where `userId` is the muter.
- Muted users **do not** create new Carmunity discussion notifications for the muter (`THREAD_REPLY`, `REPLY_REPLY`, `REACTION`, `MENTION` paths).

APIs:

- `POST/DELETE /api/user/block` body `{ "userId": "<blockedUserId>" }`
- `POST/DELETE /api/user/mute` body `{ "mutedUserId": "<mutedUserId>" }`

## 5. Hidden content behavior

`ForumThread` / `ForumReply`:

- `isHidden`, `hiddenAt`, `hiddenById` (soft hide; row retained).

**Non-admins**

- Hidden threads disappear from lists and thread view (`notFound`).
- Hidden replies stay in chronological slot but body is replaced in UI with:  
  **“This content has been removed.”**  
  Reactions / reply / report controls are disabled for that row.

**Admins**

- Bypass list / detail / reply visibility filters so moderation pages stay usable.

**Reactions / replies**

- Reactions API rejects hidden targets.
- New replies are rejected if the thread is hidden.

## 6. Audit trail approach (lightweight)

- Report updates: `reviewedById`, `reviewedAt`, `moderatorNote`, `status`.
- Hide actions: `hiddenById`, `hiddenAt`, `isHidden`.
- No separate `ModerationAuditLog` table yet (intentionally deferred).

## 7. Intentionally deferred

- Ban / suspension system.
- Dedicated audit log table & diff history.
- Reporter-facing notifications when status → `ACTIONED` / `DISMISSED` (DB is ready; hook in Phase I).
- Auto-unfollow / relationship cleanup on block.
- Adjusting aggregate `threadCount` on Gear cards to exclude hidden threads.
- Per-reply block/mute controls (kept to profile + thread OP to limit UI noise).

## 8. Recommended Phase I

- Reporter notification (email or in-app) on terminal report states.
- Admin bulk actions & filters (status, date, reporter).
- Appeals flow & escalation roles (moderator vs admin).
- Richer audit log (immutable events table).

## Validation commands

```bash
npx prisma generate
npm run lint
npx tsc --noEmit
```

Apply DB changes with your usual workflow (`prisma migrate deploy` or `prisma db push` in dev—this repo’s `npm run build` uses `db push`).
