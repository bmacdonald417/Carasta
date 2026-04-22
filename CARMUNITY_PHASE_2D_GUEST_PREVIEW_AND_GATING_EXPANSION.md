# Phase 2D — Guest Preview + Gating Expansion + Public Preview Polish

This phase deepens Phase 2C’s public-vs-member model without changing IA/visual doctrine.

## 1) Files created
- `components/guest-preview/SignedOutPreviewNotice.tsx`
- `components/guest-preview/PreviewMeter.tsx`
- `components/guest-preview/GuestGateCTA.tsx`
- `CARMUNITY_PHASE_2D_GUEST_PREVIEW_AND_GATING_EXPANSION.md` (this file)

## 2) Files modified
- `app/(marketing)/explore/page.tsx`
- `app/(marketing)/discussions/page.tsx`
- `app/(marketing)/explore/post/[id]/page.tsx`
- `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx`
- `app/(marketing)/auctions/[id]/auction-detail-client.tsx`
- `components/discussions/DiscussionThreadRepliesPanel.tsx`
- `components/discussions/DiscussionThreadReplyComposer.tsx`
- `components/discussions/DiscussionThreadSaveButton.tsx`
- `app/(app)/u/[handle]/follow-button.tsx`

## 3) Biggest guest-preview changes
- Added a **subtle, consistent “Signed out preview” helper** on key public Carmunity surfaces:
  - Explore (`/explore`)
  - Discussions (`/discussions`)
  - Post detail (`/explore/post/[id]`)
  - Thread detail (`/discussions/.../[threadId]`)
- The helper is intentionally **premium and non-spammy**, explaining:
  - what the viewer is seeing (preview/read-only)
  - what requires membership (participation + intent actions)
  - clear **Sign in / Join free** CTAs preserving return intent via `/welcome?next=...`

## 4) Biggest gating-expansion changes
Expanded guest-gate coverage to additional high-value actions:
- **Follow**: `FollowButton` now intercepts signed-out taps via the unified guest-gate modal.
- **Save thread**: `DiscussionThreadSaveButton` now intercepts signed-out taps via guest-gate modal (instead of hiding the control entirely).
- **Reply intent**:
  - Reply affordance inside replies list now intercepts signed-out taps via guest-gate modal.
  - Reply composer’s signed-out state now offers “Join to reply” (guest-gate) and a clean sign-in path.
- **Bid intent (Market)**:
  - Auction detail’s “Sign up to bid” now uses the **guest-gate modal** (intent-preserving), with a clean “Already a member? Sign in” link.

## 5) Preview-limit / teaser decisions

### Lightweight preview-limit foundation (implemented)
- Implemented a **client-side** “light preview limit” signal via `PreviewMeter`.
- Behavior:
  - Only activates for signed-out users.
  - Increments a localStorage counter on detail surfaces (thread/post).
  - After a safe threshold, shows a stronger join nudge (no hard block).
- Why this is safe for Phase 2D:
  - No server state, no cross-device coupling, no brittle metering logic.
  - Doesn’t break deep links; it’s a **nudge**, not a wall.

### Public teaser band (deferred)
- **Deferred** to avoid adding a new persistent marketing surface without a clear “best placement” decision in the current shell.
- The existing surfaces already carry social proof via public Explore/Discussions previews; Phase 2D focused on clarity + gating coverage.

## 6) Shared patterns/components extended
- **Added**
  - `SignedOutPreviewNotice` (server-safe helper pattern)
  - `PreviewMeter` (lightweight client-side preview limit signal)
  - `GuestGateCTA` (simple “open guest gate” button pattern)
- **Extended**
  - Follow/save/reply/bid surfaces to reuse the **same** guest-gate modal system (Phase 2C) instead of inventing new gates.

## 7) What was intentionally deferred
- Comprehensive gating coverage for every edge action (watchlist/save on auctions list cards, every seller tool CTA, etc.).
- A real server-side meter / paywall / growth system.
- Any broad redesign or nav/IA changes (Phase 2C is treated as locked).
- Public teaser band (see above).

## 8) Recommendation for the next phase
**Phase 2E — Gating coverage completion + read-only polish**
- Expand guest-gate intercepts to:
  - auction watchlist actions
  - “Sell” and “Marketing” CTAs wherever they still appear on public surfaces
  - any remaining “save”/subscribe entry points outside thread detail
- Optional: add a single, carefully-placed teaser band only after deciding:
  - where it lives (homepage vs explore vs auctions)
  - whether it’s global or page-scoped
  - what content it shows (static copy vs live snippets)

## 9) Validation result
- `npm run lint`: **PASS** (warnings only; pre-existing `<img>` warnings remain)
- `npx tsc --noEmit`: **PASS**

