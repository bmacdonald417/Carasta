# Carmunity — Review / demo mode retirement

Temporary **review mode** (env-gated synthetic access, `/review` hub, and related bypasses) has been **fully removed** from the codebase so production relies on **real NextAuth sessions**, **JWT-based API identity**, and **normal middleware** for `/admin` and `/settings`.

---

## 1. Files deleted

| Path | Role (before removal) |
|------|------------------------|
| `lib/review-mode.ts` | `isReviewModeEnabled`, `getReviewModeContext`, demo/profile handle helpers |
| `lib/review-mode-demo-data.ts` | `ensureReviewModeDemoData` — seeded marketing/messages/reports for walkthroughs |
| `app/review/page.tsx` | `/review` hub UI |
| `components/review-mode/review-mode-banner.tsx` | Global amber banner + links |
| `components/review-mode/review-mode-client.tsx` | `isReviewModeClient()` (`NEXT_PUBLIC_REVIEW_MODE_ENABLED`) |
| `components/review-mode/review-surface-card.tsx` | Cards used only by the review hub |

---

## 2. Files modified

| Path | Change |
|------|--------|
| `middleware.ts` | Removed `/review` matcher and all `REVIEW_MODE_ENABLED` bypasses; `/admin` requires `ADMIN`, `/settings` requires signed-in JWT |
| `lib/auth.ts` | Removed synthetic `getSession()` fallback that impersonated the demo handle user |
| `lib/auth/api-user.ts` | Removed review fallbacks in `getJwtSubjectUserId`; no user id without `NEXTAUTH_SECRET` + valid token |
| `lib/marketing/marketing-workspace-auth.ts` | Review-only session shortcut removed |
| `lib/marketing/marketing-export-auth.ts` | Same |
| `lib/marketing/admin-marketing-export-auth.ts` | Admin CSV/snapshot auth always requires real `ADMIN` session |
| `app/layout.tsx` | Dropped `ReviewModeBanner` |
| `app/api/messages/conversations/route.ts` | GET/POST: review user id fallback removed |
| `app/api/messages/conversations/[id]/route.ts` | Same |
| `app/api/messages/conversations/[id]/messages/route.ts` | Removed review send block + fallback id |
| `app/api/messages/conversations/[id]/read/route.ts` | Removed review no-op PATCH |
| `app/api/notifications/route.ts` | Removed review user id fallback |
| `app/api/notifications/unread-count/route.ts` | Same |
| `app/api/notifications/[id]/read/route.ts` | Removed review no-op |
| `app/api/admin/discussions/reports/[id]/route.ts` | Removed read-only review guard before `requireAdminSession` |
| `app/api/admin/discussions/threads/[threadId]/route.ts` | Same |
| `app/api/admin/discussions/replies/[replyId]/route.ts` | Same |
| `app/(app)/messages/page.tsx` | Messages list: sign-in required (no review exception) |
| `app/(app)/messages/[conversationId]/page.tsx` | Viewer id from session only |
| `app/(app)/messages/[conversationId]/conversation-client.tsx` | Composer always enabled for signed-in users |
| `app/(app)/messages/messages-conversations-client.tsx` | Removed review empty-state note |
| `app/(app)/notifications/actions.ts` | `markAllNotificationsRead` always persists when signed in |
| `app/(app)/u/[handle]/page.tsx` | `isOwnProfile` = session user id only |
| `app/(app)/u/[handle]/listings/page.tsx` | Owner check = session only |
| `app/(app)/u/[handle]/marketing/page.tsx` | Same |
| `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` | Same |
| `components/discussions/AdminDiscussionModerationClient.tsx` | Moderation mutations always attempted (still gated by API `requireAdminSession`) |
| `components/notifications/NotificationDropdown.tsx` | Removed review preview banner |
| `.env.example` | Removed review-mode variable block |
| `CARASTA_DEPLOYMENT_WORKFLOW.md` | Removed obsolete `lib/review-mode.ts` build note |

---

## 3. Biggest review-mode behaviors removed

- **Synthetic server session** when `REVIEW_MODE_ENABLED` was set (demo user appeared “signed in” without cookies).
- **Middleware** allowing unauthenticated access to `/review`, `/admin`, and `/settings` during review.
- **`getJwtSubjectUserId` impersonation** of the demo seller when JWT decode failed or secret was missing.
- **API fallbacks** that substituted the review seller id for messages and notifications.
- **Read-only locks** on messaging send, notification read PATCH, and admin discussion PATCH routes when review was on.
- **Marketing / listings / profile “is own”** shortcuts keyed off review context instead of the signed-in user.
- **UI**: global banner, `/review` hub, client-side review banners and disabled composer.

---

## 4. Auth / middleware / session cleanup notes

- **`getSession()`** is again a thin wrapper over `getServerSession(authOptions)` only.
- **`getJwtSubjectUserId`**: production and local setups should define **`NEXTAUTH_SECRET`**; without it, bearer/cookie JWT resolution returns `undefined` (401 on protected APIs).
- **`middleware`**: only **`/admin/*`** and **`/settings`** are matched; both use real JWT `token` from NextAuth.
- **Admin marketing export** no longer returns success without an admin session.

---

## 5. Ambiguous items intentionally preserved

- **`DemoProfileBanner`** and **`isDemoSeed`** on users — these mark **seeded demo content** in the product DB, not review-mode env bypasses. They remain for transparency on demo profiles.
- **`prisma/seed-demo-discussions.ts`** and related seeds — normal **Carmunity preview / dev data**; not tied to `REVIEW_MODE_*` env.
- **Historical docs** (`CARASTA_REVIEW_MODE_RETIREMENT_PLAN.md`, phase notes) — left in repo as archive; this file is the operational source of truth for “review mode is gone.”
- **Notification rows** with `type` values like `REVIEW_MODE_MESSAGE` may still exist in old databases; the app does not reference that string in code anymore.

---

## 6. Validation performed

From repo root:

- **`npm run lint`**: success; existing `@next/next/no-img-element` warnings only (unrelated files).
- **`npx tsc --noEmit`**: success.

Manual expectations:

- `/review` returns **404** (no route).
- Signed-out users hitting `/messages` or `/settings` follow existing redirects / middleware.
- Admins need a real **`ADMIN`** role in the database and a normal session to use admin APIs and UI.

---

## 7. Recommended follow-up cleanup

- Remove **`REVIEW_MODE_*`** and **`NEXT_PUBLIC_REVIEW_MODE_ENABLED`** from Railway/hosting env if any remain.
- Optionally **delete or archive** old planning docs that only described review mode, to reduce confusion (not required for runtime).
- If desired, **data cleanup**: delete legacy notifications with `type = 'REVIEW_MODE_MESSAGE'` via one-off SQL (optional).
