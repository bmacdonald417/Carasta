# Carmunity Phase 9: Review Mode and Assistant Refinement

## Summary
Phase 9 introduces an explicit temporary review mode for pre-launch product/design review and pairs it with a small assistant refinement pass.

This implementation focused on:

- an env-gated and removable review mode
- meaningful review access to key signed-in/demo/admin surfaces
- seeded/demo data so review mode is not empty
- review-mode UX indicators
- read-only behavior for selected temporary preview actions
- one more small assistant corpus/routing refinement pass

It stayed within scope:

- no permanent auth replacement
- no broad app rollout
- no account-specific assistant support
- no broad security architecture rewrite

## Files Created
- `CARMUNITY_PHASE_9_REVIEW_MODE_AND_ASSISTANT_REFINEMENT.md`
- `lib/review-mode.ts`
- `lib/review-mode-demo-data.ts`
- `components/review-mode/review-mode-banner.tsx`
- `components/review-mode/review-mode-client.tsx`
- `app/review/page.tsx`

## Files Modified
- `app/layout.tsx`
- `middleware.ts`
- `lib/auth.ts`
- `lib/auth/api-user.ts`
- `lib/marketing/marketing-workspace-auth.ts`
- `lib/marketing/marketing-export-auth.ts`
- `lib/marketing/admin-marketing-export-auth.ts`
- `app/(app)/messages/page.tsx`
- `app/(app)/messages/[conversationId]/page.tsx`
- `app/(app)/u/[handle]/page.tsx`
- `app/(app)/u/[handle]/listings/page.tsx`
- `app/(app)/u/[handle]/marketing/page.tsx`
- `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`
- `app/(app)/notifications/actions.ts`
- `app/api/messages/conversations/route.ts`
- `app/api/messages/conversations/[id]/route.ts`
- `app/api/messages/conversations/[id]/messages/route.ts`
- `app/api/messages/conversations/[id]/read/route.ts`
- `app/api/notifications/route.ts`
- `app/api/notifications/unread-count/route.ts`
- `app/api/notifications/[id]/read/route.ts`
- `app/api/admin/discussions/reports/[id]/route.ts`
- `app/api/admin/discussions/threads/[threadId]/route.ts`
- `app/api/admin/discussions/replies/[replyId]/route.ts`
- `components/discussions/AdminDiscussionModerationClient.tsx`
- `components/notifications/NotificationDropdown.tsx`
- `app/(app)/messages/messages-conversations-client.tsx`
- `app/(app)/messages/[conversationId]/conversation-client.tsx`
- `.env.example`
- `lib/assistant/assistant-source-registry.ts`
- `lib/assistant/assistant-query-analysis.ts`
- `docs/assistant/navigation-common-surfaces.md`

## Review-Mode Architecture
### Core design
Review mode is explicit and env-gated:
- `REVIEW_MODE_ENABLED`
- `NEXT_PUBLIC_REVIEW_MODE_ENABLED`
- `REVIEW_MODE_DEMO_HANDLE`
- `REVIEW_MODE_PROFILE_HANDLE`

### Main helper
`lib/review-mode.ts`

Responsibilities:
- determine if review mode is enabled
- resolve the review seller/admin/profile context
- provide the preview auction, preview thread, and preview conversation ids/paths

### Demo data helper
`lib/review-mode-demo-data.ts`

Responsibilities:
- ensure a seeded live listing exists for review
- ensure a seller marketing preset exists
- ensure seller marketing workspace data exists
- ensure marketing traffic exists
- ensure a demo conversation exists
- ensure a notification exists
- ensure a linked promo post exists
- ensure at least one moderation report exists for admin review

### Route-level behavior
- `middleware.ts` explicitly allows `/review`
- review mode also bypasses normal `/admin` and `/settings` middleware auth
- `lib/auth.ts` returns a seeded demo session when review mode is enabled and no real session exists
- `lib/auth/api-user.ts` resolves the review-mode demo user for API reads when no JWT is present

This makes the system explicit and centralized rather than relying on hidden bypasses.

## Routes / Surfaces Made Reviewable
### Public / public-like
- `/`
- `/discussions`
- `/discussions/[...thread]` via seeded demo thread
- `/auctions/[id]` via seeded live listing

### Signed-in / demo surfaces
- `/messages`
- `/messages/[conversationId]`
- `/u/[handle]`
- `/u/[handle]/listings`
- `/u/[handle]/marketing`
- `/u/[handle]/marketing/auctions/[auctionId]`
- notifications via the global header bell

### Admin review surfaces
- `/admin`
- `/admin/marketing`
- `/admin/moderation/discussions`

### Review hub
- `/review`

This page acts as the entry point for reviewers and links to the key demoable surfaces.

## Demo / Seeded Data Assumptions
Review mode depends on existing seed architecture plus one new review-mode seed helper.

Assumptions:
- the repo seed already creates:
  - demo discussions
  - demo users
  - live auctions
  - an admin user (`trackdaytom`)
- review mode then ensures:
  - one review campaign
  - listing marketing plan/tasks/artifacts
  - marketing traffic events
  - one conversation tied to a live listing
  - one seeded notification
  - one linked Carmunity promo post
  - one discussion report for admin moderation review

This keeps the review mode meaningful without creating a second giant demo-data system.

## Admin Review Coverage
Admin pages are viewable in review mode.

Implemented support:
- middleware allows `/admin/*` when review mode is enabled
- marketing admin export/snapshot auth helpers allow review mode
- discussion moderation page is reviewable

Important constraint:
- moderation mutation APIs are explicitly read-only in review mode
- the admin moderation client shows a review-mode notice and disables controls

That keeps the review system useful without silently mutating seeded demo state.

## Review-Mode UX
### Global banner
Added `components/review-mode/review-mode-banner.tsx`

This makes review mode unmistakable and provides quick links to:
- `/review`
- demo marketing
- demo discussion

### Review hub
Added `/review`

This acts as a simple internal preview index for:
- homepage
- discussions
- demo profile
- messages
- demo message thread
- notifications entry point
- seller marketing overview
- seller listing workspace
- public listing detail
- admin pages

### Surface-level cues
Added review-only messaging where useful:
- notification dropdown
- messages list
- message thread
- moderation client

## Assistant Refinements Included
This phase also included one disciplined assistant refinement pass:

### Added corpus doc
- `docs/assistant/navigation-common-surfaces.md`

It improves bounded answers around:
- notifications
- settings
- saved discussions / watchlist-like surfaces
- seller workspace navigation

### Retrieval updates
- added the new source to the assistant source registry
- expanded navigation-related aliases:
  - watchlist
  - saved auctions
  - settings
  - notifications

This keeps the assistant aligned with the product review mode and common navigation questions.

## Read-Only / Removability Notes
Review mode is designed to be removable:
- it is env-gated
- it is centralized in `lib/review-mode.ts`
- preview data assumptions are isolated in `lib/review-mode-demo-data.ts`
- the review hub is isolated at `/review`
- review-mode action restrictions are explicit, not hidden

Read-only behavior implemented where appropriate:
- sending messages is disabled in review mode
- marking notifications read no-ops in review mode
- admin moderation PATCH routes return review-mode read-only responses

## What Was Intentionally Deferred
- permanent guest/reviewer auth model
- production-grade review security hardening
- broad review exposure of every possible route
- broad app rollout
- account-specific assistant support
- large assistant phase beyond the small navigation refinement

## Recommendation for the Next Phase
### Suggested next phase
Review cleanup and production-hardening pass

### Recommended scope
- decide which review-mode surfaces remain
- remove or tighten temporary bypasses as launch approaches
- convert any useful demo assumptions into explicit tooling or remove them
- continue selective assistant refinement based on the stronger logs and new review-stage feedback
