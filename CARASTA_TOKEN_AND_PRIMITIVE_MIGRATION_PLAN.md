## CARASTA — Token + Primitive Migration Plan (Implementation-Ready)

This is the **Phase 0 → Phase 1 bridge** plan: exact token layering, primitive sequencing, compatibility strategy, and “what not to touch yet.”

It is grounded in the current web implementation:
- `styles/carmunity-tokens.css` (semantic variables; today dark-first + copper `--primary`)
- `styles/carasta.css` (global “carasta-theme” behaviors + cyber utilities + **global heading styling**)
- `app/globals.css` (Tailwind layers + `.glass` helpers)
- `tailwind.config.ts` (maps `primary`, `card`, etc. to CSS vars; includes `shadow-glass*`)
- `components/ui/*` + `components/carasta/CarastaLayout.tsx` (primitives + shell)

---

## Part 1 — Token strategy plan (exact layering + keep/refactor/split/deprecate)

### 1) Current token files: disposition

#### `styles/carmunity-tokens.css` — **REFACTOR + (likely) SPLIT**

**Today:** defines `:root` semantic roles for Tailwind (`--background`, `--foreground`, `--primary`, etc.) and includes `--seller-*` semantics.

**Problem:** it is effectively the “global theme,” but it is **not light-first** and it encodes **copper as `--primary`**, which conflicts with the locked direction (blue-violet accent + copper removed from functional chrome).

**Plan:**
- Split into **canonical** vs **compatibility** layers (new files; keep imports stable):
  - **Canonical:** `styles/carasta.semantic.tokens.css` (light-first `:root` + `.dark { ... }` mappings)
  - **Compatibility shim (temporary):** `styles/carasta.tokens.legacy-mapping.css` (maps old variable names to new roles where needed)
  - **Seller tool emphasis (not a new brand):** fold `--seller-*` into canonical semantic tiers OR rename to `--tool-*` roles that alias the same accent/info/success/caution/danger system with different **density** defaults (preferred long-term: **same roles**, different spacing/typography, not different hues)

**Keep filename temporarily?**
- Option A (recommended): keep `styles/carmunity-tokens.css` as a **thin re-export** importing the split files (minimizes churn for docs + mental model).
- Option B: rename (higher churn): only do after Phase 1 stabilizes.

#### `styles/carasta.css` — **REFACTOR (de-scope global side effects)**

**Today:** sets `body.carasta-theme` background + forces headings to Oswald/uppercase globally.

**Problem:** violates locked typography direction (“Oswald/uppercase only selected marketing/display moments”).

**Plan:**
- Replace global heading rules with **opt-in utilities**, e.g.:
  - `.carasta-marketing-display` for Oswald/uppercase moments
  - `.carasta-product-heading` for Inter-led hierarchy
- Move “cyber-luxury” glow utilities to **explicit opt-in** classes (not default body behavior).

#### `styles/carmunity-motion.css` — **KEEP + EXTEND**

**Today:** good reduced-motion behavior for some classes.

**Plan:** add **motion tokens** (CSS variables) and map existing classes to them (see “Motion tokens” below).

#### `app/globals.css` — **KEEP (import order changes only)**

**Plan:**
- Keep Tailwind layers intact.
- Replace/augment utility classes like `.glass` to be **explicitly opt-in** and token-driven (not used as a default primitive behavior).

#### `tailwind.config.ts` — **REFACTOR (incremental)**

**Plan:**
- Extend theme mappings to include explicit semantic utilities (examples; final names should match canonical token doc):
  - `accent`, `accent-foreground` (if not already present as Tailwind keys beyond shadcn defaults)
  - `info`, `success`, `caution`, `danger` (as colors referencing CSS vars)
  - optional `surface`, `surface-2` (if we want first-class Tailwind colors)
- Keep existing keys stable **until** codemods/migrations are ready (compatibility strategy).

#### `lib/design-tokens.ts` — **REFACTOR (must mirror canonical contract)**

**Today:** documents copper brand.

**Plan:** becomes the typed “contract mirror” for engineering + app parity prep.

---

### 2) Introducing light-first semantic roles + state semantics + surfaces + typography + motion

#### A) Light-first semantic color roles (canonical)

**Implementation approach:** `:root` is **light**. `.dark` contains the secondary mapping.

**Canonical groups (minimum viable):**
- **Canvas + text**
  - `--background`, `--foreground`
  - `--muted`, `--muted-foreground`
- **Surfaces (opaque by default)**
  - `--card` (or rename to `--surface-panel` long-term; short-term keep `card` for shadcn compatibility)
  - optional `--surface-2`, `--surface-3` (if needed for seller/admin tiering)
- **Borders + inputs**
  - `--border`, `--input`, `--ring`
- **Accent + interactive**
  - `--accent` / `--accent-foreground` (**blue-violet** family for active/info emphasis)
  - `--primary` / `--primary-foreground` (**decision:** either deprecate `primary` as “brand” or redefine to equal accent for an interim period — see “Compatibility strategy”)
- **Semantics**
  - `--info`, `--info-soft`, `--info-foreground`
  - `--success`, `--success-soft`, `--success-foreground`
  - `--caution`, `--caution-soft`, `--caution-foreground`
  - `--danger`, `--danger-soft`, `--danger-foreground`
- **Auction signal (scoped, vivid)**
  - keep `--performance-red` / `signal` concept, but ensure it is **not used as chrome** (rename usages in admin + links)

#### B) State semantics (must be explicit tokens/classes)

States should not be implied by random opacity combos.

Minimum state tokens (examples):
- `--state-hover-surface`
- `--state-active-surface`
- `--state-selected-border`
- `--state-focus-ring` (can map to `--ring`)

#### C) Surface / elevation tokens

Define shadow roles (CSS variables), consumed by Tailwind `boxShadow` extensions:
- `--shadow-e1`, `--shadow-e2`, `--shadow-e3`
Rules:
- Default cards/panels use **E1 opaque**.
- Popovers/menus may use **E2** (still readable; blur optional and subtle).
- Modals use **E3** + scrim token `--scrim`.

#### D) Typography roles (CSS variables + utility classes)

Add variables such as:
- `--text-display-weight`, `--text-display-tracking`
- `--font-product-heading` (Inter stack)
- `--font-marketing-display` (Oswald stack)

**Important:** stop relying on `font-display` as the default product heading.

#### E) Motion tokens (CSS variables)

Add:
- `--motion-duration-1..4`
- `--motion-ease-standard`
- `--motion-ease-emphasized`

Map `components/ui/motion-section.tsx` + `styles/carmunity-motion.css` to these variables over time.

---

### 3) Deprecating/removing the known failure modes

#### A) Copper/yellow/gold functional chrome

**Current sources:**
- `styles/carmunity-tokens.css` copper `--primary` / `--ring`
- `styles/carasta.css` copper glow utilities
- widespread `text-primary` usage in product surfaces (semantic misuse)

**Removal strategy (staged):**
1. **Introduce `accent` semantics** and migrate *patterns*:
   - active nav, links, selected pills: `text-accent` (new) instead of `text-primary`
2. **Demote copper** to either:
   - fully removed, or
   - optional `--brand-heritage-copper` used only in explicit marketing contexts (not shadcn `primary`)
3. Only after usage is drained, **redefine** `--primary` to mean accent OR deprecate Tailwind `primary` usage via eslint rule / codemod.

#### B) Hardcoded red misuse + neon/lime admin styling

Repo signal (representative, not exhaustive):
- dozens of matches for `#ff3b5c` across `app/**` and `components/**` (admin + tables + links)

**Plan:**
- Replace `#ff3b5c` chrome with:
  - `text-foreground` / `text-accent` for normal links
  - `text-danger` only for true urgency/destructive contexts
- Replace `#CCFF00` with:
  - `text-caution` or `text-accent` depending on meaning, but **not** neon lime as ambient KPI chrome

#### C) Glass-by-default assumptions

**Current source:** `components/ui/card.tsx` uses `bg-card/80` + blur + `shadow-glass*`.

**Plan:**
- Change `Card` default to **opaque** panel material (token-driven).
- Add explicit variants:
  - `variant="solid"` (default)
  - `variant="subtle"` (tinted surface)
  - `variant="glass"` (**opt-in**; only when explicitly requested by a surface)

---

## Part 2 — Primitive / component strategy plan (what first, what becomes system)

### Highest priority primitives (Phase 1A order)

1. **`components/ui/dialog.tsx`**
   - **Why first:** hardcoded `bg-[#0c0d12]` bypasses tokens; affects trust + consistency across the entire app.
   - **Outcome:** dialog uses `bg-popover` / `bg-card` + border + shadow tokens; scrim uses `bg-foreground/x` token strategy.

2. **`components/ui/dropdown-menu.tsx`**
   - **Why:** Radix overlay surfaces must match dialog/popover language.
   - **Note:** primitive already mostly tokenized, but shell overrides must be removed separately in Phase 1B.

3. **`components/ui/card.tsx`**
   - **Why:** removes glass-by-default across the widest area.

4. **`components/ui/button.tsx`**
   - **Why:** focus ring + primary semantics must align to accent; auction variants must remain **scoped**.

5. **`components/ui/input.tsx` (+ `textarea.tsx` / `select.tsx`)**
   - **Why:** consistent focus rings are an accessibility anchor.

6. **`components/ui/tabs.tsx`**
   - **Why:** active state is a major accent consumer.

### Next pass primitives (Phase 1B / early Phase 2)

7. **`components/ui/toast.tsx` + `components/ui/toaster.tsx`**
   - Add/standardize semantic variants: `info`, `success`, `caution`, `danger` (instead of only `destructive`)

8. **`components/ui/skeleton.tsx`**
   - Align to calm pulse + tokenized surfaces (avoid “shimmer everywhere”)

### System primitives to add (recommended)

These are not all present as first-class components today; add them early to stop page-level invention:

1. **`Badge` / `Chip` / `Pill` primitive** (`components/ui/badge.tsx` — new)
   - Used for: status, counts, filters, “demo”, “live”
   - Must be token-driven (info/success/caution/danger/neutral variants)

2. **`Panel` / `Section` wrapper** (`components/ui/panel.tsx` — new; name TBD)
   - **Rule:** pages compose `Panel`, not bespoke `rounded-[1.75rem] border ...` each time
   - Seller workspace can use the same `Panel` with `density="compact"` prop

### Shell pieces (Phase 1B)

- `components/carasta/CarastaLayout.tsx` (remove hardcoded menu bg; align header motion to tokens)
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `components/notifications/NotificationDropdown.tsx`

### Assistant UI shell (Phase 1B–2)

- `components/assistant/*` should consume the same `Dialog`, `Card`, `Button`, `Tabs`, and future `Panel` patterns.
- **Do not** create assistant-specific colors.

### Seller/admin cards: shared vs semi-shared

**Shared:** `Card`, `Panel`, `Badge`, table row hover language, `Button` variants, `Tabs`  
**Semi-shared (tooling):** seller-specific compositions *built from shared primitives* (`SellerKpiCard` remains, but internally uses `Panel` + `Badge` + typography utilities)

---

## Part 3 — Typography strategy plan (implementation steps)

### Target end state

- **Default product UI:** Inter-led hierarchy, sentence case, calm tracking.
- **Marketing/display moments:** Oswald allowed **only** where explicitly opted-in (hero, select homepage headings).

### Stepwise migration (minimize breakage)

#### Step 1 (Phase 1A): remove global enforcement

- Update `styles/carasta.css` to remove `body.carasta-theme h1,h2,h3` rules.
- Replace with opt-in classes (see Phase 0 plan).

#### Step 2 (Phase 1A): fix primitive defaults that encode Oswald

- `components/ui/card.tsx` `CardTitle` currently uses `font-display` + bold + tight tracking — change default to **product heading** classes.

#### Step 3 (Phase 1B): migrate **shell** typography

- `CarastaLayout` brand wordmark text should not force uppercase tracking across all states.

#### Step 4 (Phase 2): migrate **high-traffic product headings** by pattern

- Replace `font-display ... uppercase` headings in:
  - `app/(app)/messages/*`
  - `app/(marketing)/discussions/*` headings where appropriate
  - `app/(marketing)/explore/*` (as applicable)

#### Step 5 (later): marketing-only pass

- `components/home/*`: apply marketing display classes deliberately; tighten overly editorial sections without changing IA.

### Early vs late surfaces (typography)

- **Early:** shell + primitives (because they cascade everywhere)
- **Mid:** messages + discussions lists (high visibility)
- **Late:** seller workspace (already closer to desired analytical tone; mostly needs uppercase reduction, not family changes)

---

## Concrete compatibility strategy (prevents “token chaos”)

### Problem

Tailwind + shadcn conventions use `--primary` heavily. Today `--primary` is copper.

### Recommended staged approach

**Stage 1 (safe):** add new semantic vars + Tailwind colors (`accent`, `info`, …) while leaving existing `--primary` temporarily mapped to **legacy copper** *only until* usages are migrated off functional chrome.

**Stage 2 (cutover):** migrate class patterns:
- `text-primary` used as accent → `text-accent`
- `bg-primary/15` used as highlight → `bg-accent/10` (tokenized)

**Stage 3 (flip):** redefine `--primary` to match accent **or** deprecate `primary` entirely behind lint/codemod.

This staged plan avoids a single “big bang” that turns the entire UI blue while copper remains semantically overloaded.

---

## “Do not touch yet” list (explicit)

- No redesign of homepage sections composition (`components/home/*`) in Phase 1A.
- No refactors of explore feed algorithms/data fetching.
- No charting library work for seller analytics (per seller doc “wait” guidance).
- No Flutter theme rewrite until web semantic contract is stable (per parity doc).

---

## Appendix — High-signal implementation targets already known in code

### Known hardcoded overlay/menu issues

- `components/ui/dialog.tsx` uses hardcoded `bg-[#0c0d12]` today.
- `components/carasta/CarastaLayout.tsx` uses hardcoded dropdown menu background (`bg-[#121218]/95`) — should be removed in Phase 1B even if dropdown primitive is already tokenized.

### Known default glass issue

- `components/ui/card.tsx` uses `bg-card/80` + `backdrop-blur` by default.

### Repo-wide hardcoded hex risk signal (for planning scope)

A quick scan shows many `#` hex literals across `app/**` and `components/**` (including multiple `#ff3b5c` occurrences). Phase 4 admin normalization should include a targeted removal pass, but **Phase 1A** should already establish the semantic tokens those hexes should map into.
