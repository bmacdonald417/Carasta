# Phase 2C — Carmunity-first Nav + Guest Gating Foundation

This phase implements the first foundational pass of the approved IA:
- **Carmunity-first** signed-in structure (Carmunity as home)
- **Market** as umbrella (Auctions + Sell + seller tooling)
- **Resources** as distinct trust/help layer
- **Hybrid logged-out/public** navigation model
- **Guest preview + participation gating foundation**
- **Guest-gate modal** (premium, honest)
- **Post-signup activation handoff** (welcome → onboarding → enter the app)

## 1) Files created
- `components/guest-gate/GuestGateProvider.tsx`
- `components/guest-gate/GuestGateModal.tsx`
- `app/(app)/welcome/page.tsx`
- `components/welcome/WelcomeActivationDialog.tsx`
- `CARMUNITY_PHASE_2C_NAV_AND_GUEST_GATING_FOUNDATION.md` (this file)

## 2) Files modified
- `app/providers.tsx`
- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `components/carmunity/FeedPostInlineComment.tsx`
- `components/carmunity/PostReactionPicker.tsx`
- `components/discussions/DiscussionReactionPicker.tsx`

## 3) Biggest IA / navigation changes
- **Signed-in top-level IA is now real in the header**
  - Signed-in header top-level: **Carmunity** → `/explore`, **Market** → `/auctions`, **Resources** → `/resources`
  - Logo now routes signed-in users to **`/explore`** (Carmunity as home)
- **Sidebar is now pillar-grouped**
  - Sections: **Carmunity** (Explore, Discussions, Messages, Profile), **Market** (Live auctions, Sell + sublinks), **Resources** (How it works, Why Carasta, Resources)
  - Sidebar is **signed-in only** (public/marketing doesn’t inherit an “app shell”)
- **Mobile bottom nav is aligned**
  - Signed-in: Carmunity / Discussions / Market / Sell / Resources
  - Logged-out: Carmunity / Discussions / Market / Resources (no Sell)
  - Bottom nav is hidden on the public marketing shell routes to keep the public experience deliberate.

## 4) Biggest guest/public gating changes (foundation)
- Added a **global guest-gate system** (provider + modal) so the first key “participation” attempts don’t fail silently.
- Wired guest-gate intercept into **high-frequency social actions**:
  - **React** (post + discussions reactions): guest sees summary + can tap “React” → guest gate modal
  - **Comment** (feed inline comment): guest taps “Comment” → guest gate modal

## 5) Guest-gate modal + activation flow changes

### Guest-gate modal
- New reusable modal: **honest, premium, conversion-oriented**.
- Copy includes:
  - clear truth (“full experience is for members”, “joining is free”)
  - brand line: **“Get in the car and drive with Carasta.”**
  - “easy steps” framing (create account → set up identity → engage)
- CTA behavior:
  - **Sign in** and **Join free** preserve intent via a callback: `callbackUrl=/welcome?next=<original-path>`

### Post-signup activation handoff
- New signed-in route: **`/welcome`**
  - welcome/expectation-setting copy
  - immediate CTA to **enter Carmunity** (or browse Discussions)
  - automatically launches the existing **Carmunity onboarding dialog** (reused; not duplicated) if onboarding is incomplete
  - after onboarding closes, the user is routed into the app (`next` or `/explore`) instead of remaining “cold”

## 6) Shared patterns/components added or extended
- **Added**
  - `GuestGateProvider` + `useGuestGate()` (global shared intercept mechanism)
  - `GuestGateModal` (shared modal UI)
  - `WelcomeActivationDialog` (client wrapper to open existing onboarding and route after close)
- **Extended**
  - `FeedPostInlineComment` to intercept guest comment attempts
  - Reaction pickers to offer a guest “React” affordance (instead of silently removing the control)

## 7) What was intentionally deferred
- **Full metered preview** (view limits, resets, per-surface counters) — deferred; this phase only establishes a clean intercept foundation.
- **Exhaustive gating coverage** across every action surface (follow, save/watchlist, bid flows, seller tooling) — deferred; we gated the most visible participation actions first and aligned navigation to reduce accidental entry into blocked flows.
- **Any visual-system redesign** — explicitly not touched.
- **Video/live, AI expansion, seller backend rewrite** — explicitly out of scope.

## 8) Recommendation for the next phase
Target: “Phase 2D — Guest gating coverage + preview polish”
- Expand guest-gate intercept coverage to:
  - follow buttons (profiles/suggestions)
  - save/watchlist actions
  - bid and seller entry points (where they aren’t already server-guarded)
- Add a **lightweight preview limiter** only if it can be implemented safely without creating a brittle cross-surface meter.
- Add a small “Signed out preview” helper pattern (consistent copy + CTA placement) on key public Carmunity surfaces.

## 9) Validation result
- `npm run lint`: **PASS** (warnings only; pre-existing `<img>` rule warnings remain)
- `npx tsc --noEmit`: **PASS**

