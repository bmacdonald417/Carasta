## CARASTA SURFACE PRIORITY + IMPLEMENTATION ROADMAP

This document converts the doctrine into an execution order with clear dependencies, plus an impact map of where we’ll touch the codebase.

---

## Part 7 — Surface-by-surface prioritization

Scoring heuristic (informal):
- **Frequency**: how often users see it
- **Drift**: how inconsistent it is with the desired system
- **Leverage**: whether fixing it enforces consistency broadly

### 1) Global shell / header / footer / navigation

- **Current maturity**: Medium (structure exists; styling is mixed)
- **Biggest problems**
  - Dark “cyber glass” defaults in `CarastaLayout` conflict with light-first direction
  - Hardcoded dark dropdown backgrounds (`bg-[#121218]`, etc.)
  - Mixed nav languages (marketing vs app) without unified material rules
- **Fix first**
  - Define shell materials (opaque by default; subtle sticky translucency)
  - Standardize active/hover/focus semantics via tokens
  - Remove hardcoded hex values
- **Phase**: Early (after tokens/primitives)

### 2) Homepage + public pages

- **Current maturity**: Medium-High (many sections already look premium and light)
- **Biggest problems**
  - Needs token alignment (accent shift to blue-violet; reduce copper/cyber artifacts)
  - Ensure typography rules (less “editorial,” more product-first)
- **Fix first**
  - Normalize section rhythm + typography hierarchy
  - Ensure banner area integrates with new token system without moving it
- **Phase**: Early-Mid (after shell)

### 3) Carmunity / explore

- **Current maturity**: Medium (functional; design identity currently dark-first and “cyber” leaning)
- **Biggest problems**
  - Current tokens assume deep-dark canvas; will need light-first mapping
  - Card defaults are glassy and heavy for a premium light product feed
- **Fix first**
  - Feed card material rules (opaque panels; restrained hover)
  - Typography + spacing normalization across post cards and profile previews
- **Phase**: Mid (after primitives + shell)

### 4) Discussions

- **Current maturity**: Medium (good structure; visuals consistent within discussions but dark leaning)
- **Biggest problems**
  - Uses primary as ambient accent in many places; needs new semantics
  - Panel/card language still inherits “glass by default”
- **Fix first**
  - Thread list panels, sorting controls, empty states: normalize materials + states
- **Phase**: Mid (high-frequency)

### 5) Profile / Garage

- **Current maturity**: Medium-High (reads fairly coherent, uses tokens well)
- **Biggest problems**
  - Still inherits some “cyber glass” assumptions
  - Uppercase display usage is heavier than “Apple-clean” for product UI
- **Fix first**
  - Rebalance typography (calmer headings, more legible labels)
  - Standardize stat blocks and card grids
- **Phase**: Mid

### 6) Messages

- **Current maturity**: Medium-Low (feels less mature per product insight)
- **Biggest problems**
  - Typography and container are basic; likely lacks refined thread/message bubble systemization
  - Needs stronger empty/loading states and clearer hierarchy
- **Fix first**
  - Message list and conversation thread materials + spacing
  - Form/input focus + send affordances
- **Phase**: Mid (high leverage for perceived quality)

### 7) Seller workspace

- **Current maturity**: High (one of the cleanest surfaces)
- **Biggest problems**
  - Uses its own `--seller-*` semantics; must map to the unified semantic system without losing the “tool” feel
  - Risk: becoming a separate identity if tokens diverge further
- **Fix first**
  - Keep density/tool hierarchy; align color roles and elevation ladder with global doctrine
  - Replace any local-only patterns that should be primitives
- **Phase**: Mid-Late (preserve strengths; align later)

### 8) Admin

- **Current maturity**: Medium (credible but not premium; hardcoded neon accents)
- **Biggest problems**
  - Hardcoded `#ff3b5c` and `#CCFF00` violate the semantic system
  - Uses red as ambient chrome, not urgency
  - Glassy dark panels everywhere
- **Fix first**
  - Convert to semantic tokens and calm tool UI
  - Tables/panels consistent with seller workspace density rules, but same system identity
- **Phase**: Late-Mid (after primitives + tokens; before final polish)

### 9) Assistant

- **Current maturity**: Unknown-Medium (not fully audited in this pass; must inherit new primitives)
- **Biggest problems**
  - Must feel integrated, not bolted-on
  - Needs consistent overlay/dialog materials, motion rules, and readability
- **Fix first**
  - Ensure assistant overlays, cards, buttons, and message-like content use same tokens/primitives
- **Phase**: Late (once primitives are stable)

---

## Part 8 — What belongs in Phase 1 vs later

We separate quality features into phases to avoid overloading the first implementation pass.

### A) Foundational design-system phase (Phase 1)

- **Semantic tokens**: light-first + dark mapping (roles + state tokens)
- **Typography hierarchy**: scale + rules for uppercase usage
- **Spacing + radii ladder**: standard rhythm, component padding defaults
- **Elevation ladder**: E0–E3 rules; remove “glass by default”
- **Core primitives**: Button, Card, Input, Dialog, DropdownMenu, Tabs, Toast, Skeleton
- **Accessibility baselines**: focus rings, AA contrast targets, keyboard states
- **Navigation shell normalization**: header/footer/nav materials + active states

### B) Interaction polish phase (Phase 2)

- **Motion system**: standardized durations/easing, consistent microinteractions
- **Skeleton/loading patterns**: calm, consistent placeholders across surfaces
- **Empty states**: guided actions, consistent “next step” language
- **Optimistic UI + “no dead clicks”**: where safe and high-impact

### C) Advanced UX / maturity phase (Phase 3)

- **Progressive disclosure patterns**: advanced tool surfaces, admin density toggles
- **System-wide personalization**: later
- **Higher-level navigation improvements**: cross-surface wayfinding, breadcrumbs, contextual nav
- **Deep accessibility improvements**: extended audits, screen reader refinements

### D) Later product-behavior phase (Phase 4)

- **Real-time updates** beyond current scope (where appropriate)
- **Advanced onboarding** flows
- **Smart defaults/autofill** expansions (where relevant)

---

## Part 9 — App / Site parity strategy (web vs mobile)

We do **not** force identical layouts, but we enforce shared system materials.

### What must feel shared

- Semantic color roles and state meanings (accent/info/success/caution/danger)
- Typography scale intent (even if exact font differs on mobile)
- Component state behavior (hover analogs on mobile, pressed states, focus handling)
- Elevation ladder and overlay behavior

### What can differ

- Density (mobile is naturally more compact in viewport)
- Navigation patterns (bottom nav vs sidebar vs header)
- Content composition and section ordering where mobile conventions demand it

### How mobile should inherit later (Flutter alignment)

Current Flutter theme (`carmunity_app/lib/app/theme/*`) is dark-first and copper-accented. The parity plan:

- Define the **same semantic roles** as web (accent/info/success/caution/danger/surfaces).
- Update Flutter to map those roles to the new palette **after** web tokens stabilize.
- Maintain a single cross-platform “token contract” doc: names + role intent + accessibility constraints.

---

## Part 10 — Implementation roadmap (phase-by-phase)

### Phase 0 — System doctrine + token contract (design+engineering alignment)

- **Objective**: Lock semantic roles, typography rules, elevation ladder, motion rules.
- **Surfaces**: none (documentation + token spec only)
- **Why first**: avoids ad hoc restyling and prevents drift while implementing
- **Dependencies**: audit complete
- **Defers**: any UI changes

### Phase 1 — Tokens + primitives normalization (highest leverage)

- **Objective**: Make the system enforceable:
  - light-first semantic tokens
  - primitives use tokens (no hardcoded hex)
  - remove “glass by default” where inappropriate
- **Surfaces**: global primitives; overlays/menus; global shell
- **Dependencies**: Phase 0 token contract
- **Defers**: page-by-page redesign; advanced motion polish

### Phase 2 — Global shell + high-frequency product surfaces

- **Objective**: Normalize what users feel most:
  - header/nav/footer
  - messages
  - discussions
  - profiles/garage
- **Dependencies**: Phase 1 primitives stable
- **Defers**: admin deep polish; assistant deep polish

### Phase 3 — Seller workspace alignment (preserve strength, unify system)

- **Objective**: Keep tool-like excellence, but ensure it’s not a separate identity.
- **Surfaces**: seller marketing dashboards + listing workspaces
- **Dependencies**: global tokens support tool density variants
- **Defers**: advanced UX and personalization

### Phase 4 — Admin normalization (calm tool UI, no neon hacks)

- **Objective**: Replace hardcoded colors, unify table/panel patterns, improve readability.
- **Dependencies**: seller/admin density patterns proven

### Phase 5 — Assistant polish + cross-surface interaction maturity

- **Objective**: integrate assistant layer into the same material system; add interaction polish across the platform.
- **Dependencies**: overlays and primitives consistent everywhere

### Phase 6 — App parity mapping (Flutter)

- **Objective**: port the same semantic roles + palette mapping to Flutter, keeping layout native.
- **Dependencies**: web system stable; token contract complete

---

## Part 11 — File / Component impact map (high leverage targets)

### Global styles & tokens

- `app/globals.css`
- `styles/carmunity-tokens.css` (currently dark-first + copper; will become light-first contract)
- `styles/carmunity-motion.css` (becomes motion spec implementation)
- `styles/carasta.css` (currently “cyber-luxury”; likely needs de-emphasis or refactor into doctrine-compliant utilities)
- `tailwind.config.ts` (color role mapping, shadows, radii)
- `lib/design-tokens.ts` (documentation mirror; must reflect new system)

### UI primitives (must become doctrine-compliant)

- `components/ui/button.tsx`
- `components/ui/card.tsx` (remove “glass by default”; add material variants)
- `components/ui/input.tsx`
- `components/ui/dialog.tsx` (remove hardcoded dark backgrounds)
- `components/ui/dropdown-menu.tsx`
- `components/ui/tabs.tsx`
- `components/ui/toast.tsx` + `components/ui/toaster.tsx`
- `components/ui/skeleton.tsx`

### Global shell

- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `components/notifications/NotificationDropdown.tsx`

### Public/home surfaces (banner stays)

- `app/(marketing)/page.tsx`
- `components/home/*` (hero, sections, strip, cards)

### Social/community surfaces

- `app/(marketing)/discussions/*`
- `app/(app)/u/[handle]/*` (profile/garage)
- `components/discussions/*`
- `components/profile/*`
- `components/carmunity/*`

### Messages

- `app/(app)/messages/*`
- `components/messages/*` (where applicable)

### Seller workspace

- `app/(app)/u/[handle]/marketing/*`
- `components/marketing/seller-workspace-primitives.tsx`
- Seller-specific panels + KPI components

### Admin

- `app/(admin)/admin/*`
- `components/discussions/AdminDiscussionModerationClient.tsx` (tool surfaces)

### Assistant layer

- `components/assistant/*`
- `lib/assistant/*` (if UI hooks exist for assistant presentation)

### Known styling debt indicators (from audit)

- Hardcoded hex colors in admin and overlays (`#ff3b5c`, `#CCFF00`, `bg-[#0c0d12]`, etc.)
- “Glass card by default” in `components/ui/card.tsx`
- Mixed typography defaults (uppercase display leaking into product UI)

---

## Part 12 — Deliverables (created by this planning pass)

- `CARASTA_VISUAL_CONSISTENCY_MASTER_PLAN.md`
- `CARASTA_DESIGN_SYSTEM_DOCTRINE.md`
- `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md`

