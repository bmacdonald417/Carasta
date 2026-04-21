## CARASTA — Phase 0 (Implementation Planning Bridge)

This document translates the approved doctrine + audit into an **implementation-ready execution plan** for the first real coding phases.

**Hard constraints (this phase):**
- No broad page-by-page redesign.
- No ad hoc restyling.
- No “change tokens everywhere” without a controlled compatibility strategy.
- Preserve the homepage **rotating listed-cars banner** position + behavior.

**Primary sources of truth (already approved in-repo):**
- `CARASTA_VISUAL_CONSISTENCY_MASTER_PLAN.md`
- `CARASTA_DESIGN_SYSTEM_DOCTRINE.md`
- `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md`
- `CARASTA_SELLER_WORKSPACE_VISUAL_DIRECTION.md` (must be reconciled with “single identity” locked decisions; see Part 4)
- `CARASTA_APP_SITE_PARITY_COMPANION_PLAN.md`

---

## Executive answer: what changes first / second / not yet

### What changes first (Phase 1A — “Stabilize the substrate”)

**Goal:** make the system enforceable without painting the whole product yet.

1. **Introduce a canonical light-first semantic token contract** (new files + explicit mappings).
2. **Normalize overlay primitives** that currently bypass tokens (`Dialog`, dropdown overrides in shell).
3. **Normalize default materials** in `Card` so **glass is not the default**.
4. **Establish typography rules at the primitive + global CSS level** (stop global Oswald/uppercase leakage into product UI).

**Why first:** these are the highest-leverage choke points; fixing them reduces chaos before touching feed/discussion/message layouts.

### What changes second (Phase 1B — “Shell becomes coherent”)

1. **`CarastaLayout`**: remove hardcoded menu surfaces; align header/footer/nav states to semantic tokens.
2. **`AppSidebar` / `MobileBottomNav` / `NotificationDropdown`**: unify active/hover/focus + elevation rules.

**Why second:** the shell touches every route; it should only change after overlay/card/button defaults won’t fight it.

### What must not be touched yet (explicit deferrals)

Until Phase 1A–1B are stable:
- Do **not** restyle `components/home/*` beyond what is required to align tokens (ideally none in Phase 1A).
- Do **not** refactor Carmunity feed cards, discussion thread pages, or profile layouts for aesthetics.
- Do **not** redesign seller marketing pages for composition changes (token alignment only later).
- Do **not** attempt Flutter parity implementation (copy-only guardrails per parity doc).

---

## Part 4 — Surface priority implementation map (execution lens)

This is the **real** sequencing for *implementation work*, not just design priority.

| Surface | Priority | Why | Depends on (must be true first) | Defer | Risk if too early |
|---|---:|---|---|---|---|
| Global shell / nav / footer / dropdowns | **P0** | Seen everywhere; current hardcoded overlay/menu surfaces bypass tokens | Token contract + `Dialog`/`DropdownMenu`/`Card` defaults stable | Marketing composition refactors | “Two products” feeling persists; regressions across all routes |
| Homepage + public pages | **P1** | Already mostly light; should snap to new accent semantics cleanly | Shell + token contract stable | Rewriting section content/IA beyond token alignment | Editorial churn without system stabilization |
| Carmunity / explore | **P2** | High traffic; many cards/lists; high regression area | Card + panel primitives + density rules ready | Feed algorithm/feature changes | Visual chaos if cards still glassy while tokens flip |
| Discussions | **P2** | High traffic; lots of `text-primary` semantics tied to old accent | Accent migration plan executed on *patterns* (not one-off pages) | Thread ranking/taxonomy changes | “Primary accent” noise if semantics not migrated systematically |
| Messages | **P2** | High leverage for perceived maturity; smaller surface area than feed | Input/button/dialog patterns stable | Bubble system redesign | Broken composer states if primitives unstable |
| Profile / garage | **P3** | Already relatively coherent; typography cleanup benefits | Heading/label utilities stable | Big layout restructures | Profile feels “off-brand” if shell still cyber-dark |
| Seller workspace | **P3–P4** | Strongest area already; align to unified semantics without losing tool feel | Global semantic roles + density variants exist | Charting library decisions | Accidentally creating a separate product identity |
| Admin | **P4** | Hardcoded neon/red misuse; should follow seller/tool normalization | Table/panel primitives + semantic urgency rules | Large admin feature work | High contrast failures + confusing urgency semantics |
| Assistant | **P4–P5** | Must inherit primitives; late to avoid churn | Dialog/drawer/sheet patterns finalized | Assistant product scope expansion | Inconsistent help UI that fights the rest of the system |

**Reconciliation note (seller doc vs locked decisions):**  
`CARASTA_SELLER_WORKSPACE_VISUAL_DIRECTION.md` recommends a “distinct sub-theme.” The newer locked decision is **one unified language with surface emphasis**. Implementation should treat seller as **density + panel tiering** within the same semantic palette (not a separate accent system).

---

## Part 5 — First implementation phase definition (exact scope)

### Phase 1A — Token contract + primitive substrate (the first coding phase)

#### Goals (measurable)

- **Light-first defaults** are represented in semantic CSS variables (even if some pages still look mixed short-term).
- **Functional UI chrome** no longer depends on copper/yellow/gold as “primary.”
- **Glass is not the default** for `Card`.
- **Overlays** (`Dialog`, `DropdownMenu`) do not rely on hardcoded hex backgrounds in primitives/shell.
- **Motion tokens** exist as variables (even if not all call sites migrate immediately).

#### Likely files/systems touched (expected)

**Tokens / global style entry**
- `app/globals.css` (import order only; keep `@tailwind` layers intact)
- `styles/carmunity-tokens.css` (becomes a compatibility shim OR is split; see token migration doc)
- `styles/carasta.css` (remove/neutralize global heading enforcement; migrate “cyber” utilities to explicit opt-in classes)
- `tailwind.config.ts` (map new semantic roles; optionally add font tokens utilities)
- `lib/design-tokens.ts` (mirror the canonical contract for TS consumers/docs)

**Primitives (minimum set)**
- `components/ui/card.tsx`
- `components/ui/dialog.tsx`
- `components/ui/button.tsx` (mostly: ring/focus semantics + variant naming alignment; avoid broad redesign)
- `components/ui/input.tsx` (+ `textarea.tsx` / `select.tsx` if they share the same focus/ring pattern)
- `components/ui/dropdown-menu.tsx` (popover material + shadow tokens; remove reliance on “glass” shadow where inappropriate)
- `components/ui/tabs.tsx` (active state semantics)
- `components/ui/toast.tsx` (semantic success/caution/danger variants plan; may be Phase 1B if too wide)

#### Must be stabilized first (non-negotiables)

- **Semantic naming** for: `accent`, `danger`, `info`, `success`, `caution`, `surface*`, `border*`, `text*`.
- **Two-mode mapping** strategy for Tailwind `darkMode: ["class"]]` that does not fork the system into unrelated palettes.

#### Must remain untouched during Phase 1A

- No refactors of `components/home/*` except unavoidable compile issues (should be none).
- No visual redesign passes on `app/(marketing)/page.tsx` beyond token-driven color shifts **unless** explicitly scheduled as 1A-hotfix (default: **defer**).
- No changes to auction business logic/components unrelated to styling primitives.

### Phase 1B — Shell coherence (immediately after 1A, still “foundation”)

#### Goals

- Header/footer/nav/menus use the same materials as primitives (popover/dialog).
- Remove **shell-only** hardcoded colors (e.g., menu content overrides) so the shell inherits tokens.

#### Likely files touched

- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `components/notifications/NotificationDropdown.tsx`

---

## Part 6 — Risk / regression planning (what will go wrong if we’re careless)

### Primary risks

1. **Mixed token systems** (old `--primary` copper meaning vs new “accent” meaning) causing confusing partial migrations.
2. **Tailwind semantic color drift** (`text-primary` used as “brand accent” across hundreds of classnames) causing unintended hue shifts.
3. **Dark/light collisions** if `:root` becomes light while `.dark` mappings are incomplete.
4. **Component regressions** from changing `Card` defaults (layout/focus/contrast changes across many surfaces).
5. **Seller/admin regressions** if urgency reds are removed without replacing semantic structure.
6. **App parity drift** if web copy/terminology shifts before Flutter updates placeholders (per parity doc).

### Mitigations (process + technical)

- **Compatibility layer + staged cutover** (documented in `CARASTA_TOKEN_AND_PRIMITIVE_MIGRATION_PLAN.md`):
  - keep legacy token names temporarily, but map them intentionally.
- **Pattern-first migrations** over “random fixes”:
  - e.g., replace “primary as link color” with `text-accent` *by pattern*, not page-by-page whim.
- **Feature flag for theme cutover** (recommended): `NEXT_PUBLIC_UI_THEME_V2=1` (or server-side env) to allow staged rollout and quick rollback.
- **Before/after snapshots** on a small fixed route list (homepage, explore, thread list, messages, seller overview, admin home) using automated screenshots in CI (Playwright is already a dependency).

---

## Part 7 — App parity prep (web-first, no app implementation)

### What web must record as stable contracts

- **Semantic role names** (accent/info/success/caution/danger/surface tiers)
- **State semantics** (active vs selected vs destructive vs urgency)
- **Typography roles** (marketing display vs product heading vs label)
- **Elevation tiers** (E0–E3) and “when blur is allowed”

### What must remain stable to avoid drift

- **Object vocabulary** (Carmunity, Discussions vs Forums, Garage, Auction semantics) — align with `CARASTA_APP_SITE_PARITY_COMPANION_PLAN.md`
- **API meanings** for onboarding/preferences/notifications when public copy changes

### Practical guardrail while web leads

- Maintain a short **“Shared product vocabulary”** appendix inside the token migration doc (even 1 page): canonical terms + deprecated synonyms + target dates.

---

## Part 9 — Final unknowns that materially affect implementation

1. **Accent hue selection** within blue-violet (brand calibration). Implementation needs a pinned HSL triplet per mode.
2. **Dark mode activation product decision** (user toggle vs system vs admin-only) — affects where `.dark` is applied and how QA is scoped.
3. **Whether `text-primary` remains a Tailwind alias** forever, or is deprecated in favor of `text-accent` / `text-info` to reduce ambiguity.

---

## Companion doc

See: `CARASTA_TOKEN_AND_PRIMITIVE_MIGRATION_PLAN.md` for the concrete token file strategy + primitive sequencing + codemod-style migration steps.
