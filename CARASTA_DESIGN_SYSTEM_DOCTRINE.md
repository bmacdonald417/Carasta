## CARASTA DESIGN SYSTEM DOCTRINE (Next Generation)

This is the canonical doctrine for Carasta’s next design-system era.

**Locked decisions respected:**

- Homepage rotating listed-cars banner stays (position + behavior); surrounding system may be refined.
- Overall direction moves **lighter, higher-contrast, more premium** (light-first).
- Dark mode is **secondary**.
- Direction: **Apple-clean**, sleek, premium, product-first, high confidence, not overly editorial.
- Motion: moderate, premium, fluid, physics-aware; never gimmicky.
- Remove yellow/copper/gold as primary accent.
- Blue / blue-violet may be the primary informational/active accent.
- Red reserved for urgency/danger/time-sensitive.
- Seller workspace becomes more mature/tool-like without becoming a separate sub-brand.
- Accessibility: AA-conscious, highly readable.
- Tasteful translucency/blur/shadow/layering, restrained and usability-driven.

---

## Part 2 — Design Doctrine (12 pillars)

### 1) Visual identity direction

**Premium product UI, not “theme UI.”** Surfaces should feel composed from the same materials: crisp canvas, deliberate panels, clean type, restrained accent, and purposeful depth.

**Key attributes**
- **Apple-clean**: calm geometry, restrained decoration, high-quality spacing, strong contrast, legible type.
- **Sleek premium**: thin lines, precise radii, soft shadows, fewer gradients; when gradients exist they should be subtle and functional.
- **Product-first**: UI hierarchy and content clarity dominate; brand expression is subtle and confident.

### 2) Light-mode-first strategy

**Light mode becomes the platform default** for public + product surfaces over the initiative’s phases.

Guiding materials:
- Canvas: near-white with slight cool tint (not pure #fff everywhere).
- Panels: white / slightly tinted with crisp borders.
- Text: neutral-900 primary, neutral-600 secondary.
- Accent: blue-violet used for active states, links, and focus.

### 3) Dark mode role

Dark mode is supported but **not the main identity**.

Rules:
- Dark mode should be a **true semantic mapping**, not a separate aesthetic product.
- Avoid “neon cyber” bias as the default; keep dark premium and calm.
- Dark should preserve hierarchy and contrast, not rely on glow to communicate state.

### 4) Color semantics (core rule)

Color is semantic, not decorative.

- **Accent (blue-violet)**: active, selected, focused, primary links, primary actions (sparingly).
- **Info**: informational state (often aligned with accent but not always equal).
- **Success**: confirmations, healthy states.
- **Caution**: warnings, watch states.
- **Danger/Urgency (red)**: destructive actions, time-sensitive urgency, system danger.
- **Neutral**: default UI chrome.

Critically:
- **Red is not the “brand color.”** Red is a signal.
- **Copper/yellow/gold are not primary accents**. If kept at all, they become optional “heritage” tokens used rarely (marketing imagery, not UI chrome).

### 5) Surface hierarchy (materials)

We standardize the platform into a small set of surface “materials.”

**Materials**
- **Canvas**: the page background.
- **Panel**: primary content container (forms, tables, cards).
- **Subpanel**: nested container for grouped content.
- **Overlay**: dialogs, drawers, popovers.
- **Interactive surface**: buttons, chips, tabs.

**Hierarchy rule**
- By default, surfaces are **opaque** and readable.
- Depth is created through **layering + subtle shadow**, not heavy blur everywhere.

### 6) Typography hierarchy

We define a system that works across:
public marketing, social/community, messages, seller workspace, admin.

**Principles**
- Calm, readable, modern system UI typography.
- Limit uppercase “brand” styling to specific contexts only.
- Numbers should use **tabular figures** when used as KPIs.

**Roles**
- Display (rare): hero headlines, major marketing section headers.
- Heading: page titles, panel titles.
- Body: readable content.
- Label: controls, badges, table headers.
- Mono (rare): codes/IDs only.

### 7) Motion philosophy

Motion communicates state changes and affordances, not decoration.

**Default feel**
- 120–240ms for most UI transitions.
- Ease curves that feel physical: quick start, gentle settle.
- Reduced motion respected everywhere.

Allowed motion:
- Hover elevation (1–2px translate max)
- Opacity + shadow transitions
- Drawer/modal transitions with restrained scale/blur
- Tab transitions (crossfade/slide)

Forbidden:
- Constant pulsing/glowing as ambient chrome
- Large parallax or heavy transforms during scrolling
- Overly bouncy easing

### 8) Depth / layering / translucency rules

Depth is **functional**:
- clarify hierarchy
- preserve context
- guide attention

**Default**
- Panels are opaque, with crisp border and soft shadow.

**Translucency**
- Allowed for: sticky headers, lightweight popovers, occasional “context-preserving” overlays.
- Not allowed for: large content panels, tables, long-form reading surfaces, message threads.

**Blur**
- Allowed: header when scrolling, modal scrim effects.
- Prohibited: behind dense text blocks or data tables; anywhere it reduces readability.

### 9) Accessibility standards

Minimum targets:
- WCAG **AA** contrast for text and interactive controls.
- Visible focus rings (not just subtle glow).
- Keyboard navigation for menus, dialogs, tabs, toasts.
- Avoid color-only state indicators; add iconography, text, or shape cues.

### 10) Component philosophy

**Primitives own consistency. Pages own composition.**

- Standardize primitives: `Button`, `Card`, `Input`, `Dialog`, `DropdownMenu`, `Tabs`, `Toast`, `Skeleton`, `Table patterns`.
- Encode states (hover/active/disabled/focus) and density variants in primitives.
- Remove hardcoded hex colors and background hacks from primitives; rely on semantic tokens.

### 11) Navigation / layout philosophy

**Predictable, low cognitive load.**

- One global shell language (header + nav + footer) that adapts per surface via density and emphasis.
- Marketing navigation and app navigation can coexist, but should share typography, spacing, and state affordances.
- Keep layouts mobile-first, with deliberate breakpoints for seller/admin density.

### 12) Seller + admin emphasis without separate identities

Seller and admin are “tool surfaces,” but they’re still Carasta.

**How they differ**
- Higher information density
- Stronger table and panel patterns
- More KPI typography (tabular numbers, compact labels)
- More structured empty states and guidance

**How they should NOT differ**
- Not separate accent palettes
- Not different component styles
- Not different typography families

---

## Part 3 — Color + Semantic System (Implementable Strategy)

### Design intent

Carasta’s new accent system should feel premium and confident:
- accent is used to **signal action and selection**, not to decorate every border
- neutrals carry most of the UI
- semantic colors are consistent across public, social, messaging, seller, admin

### Token model (roles, not palette names)

We implement colors as roles; a palette backs them.

**Core roles**
- `--background`, `--foreground`
- `--surface`, `--surface-2`, `--surface-3` (optional tiers)
- `--border`, `--border-subtle`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground` (blue-violet)
- `--focus-ring` (usually same family as accent but tuned for contrast)

**Semantic roles**
- `--info`, `--info-soft`, `--info-foreground`
- `--success`, `--success-soft`, `--success-foreground`
- `--caution`, `--caution-soft`, `--caution-foreground`
- `--danger`, `--danger-soft`, `--danger-foreground`

**Auction-specific signal roles (kept, but scoped)**
- `--signal-live` (time-sensitive urgency; typically red family)
- `--signal-reserve` (reserve met; green family)

Rule: auction signal roles may be vivid; they must not leak into general chrome.

### Accent usage policy (avoid visual noise)

**Accent should be strong in**
- primary CTA button
- selected nav item / active tab indicator
- focused input ring
- key link emphasis (not every link)
- small “active state” micro accents (dots, underlines)

**Accent should be restrained in**
- large backgrounds
- panel fills
- most borders
- data tables (use subtle state fills, not neon)

**Premium anti-noise rule**
- if everything is accented, nothing is
- prefer “one accent per region” (e.g., one active nav, one CTA, one highlighted insight)

---

## Part 4 — Typography / Spacing / Layout System (Rules)

### Typography scale (recommended)

Define a calm, product-first scale that works across surfaces:

- **Display**: 36–44 (marketing hero only)
- **H1**: 28–32 (page title)
- **H2**: 20–24 (section title)
- **H3**: 16–18 (panel title)
- **Body**: 14–16 (default reading)
- **Small**: 12–13 (secondary text)
- **Label**: 11–12 (uppercase optional; use sparingly)

Rules:
- Don’t uppercase everything. Use uppercase labels only for category tags and table headers.
- Use `tabular-nums` for KPI values consistently.
- Prefer `font-medium` and `font-semibold` over heavy `font-bold` except for hero moments.

### Spacing rhythm

Standardize to a small spacing ladder:
- 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

Rules:
- Panels use consistent internal padding (e.g., 20–24 desktop; 16–20 mobile).
- Section spacing on marketing/public surfaces: 56–80 (responsive).
- Product surfaces: tighter rhythm; less “hero padding.”

### Density rules

Provide density variants (especially seller/admin):
- **Comfortable** (default): more breathing room for general users.
- **Compact** (tools): denser tables/forms with preserved tap targets.

### Layout rules

- Mobile-first, but use deliberate breakpoints:
  - `sm`: small tablet
  - `md`: tablet/desktop crossover
  - `lg`: wide desktop nav layouts
  - `xl`: tool dashboards and dense grids
- Containers:
  - general content: `max-w-3xl` for social/discussions/messages
  - dashboards: `max-w-6xl` to `max-w-7xl`

---

## Part 5 — Surface / Elevation / Depth Rules

### Elevation ladder (simple, reusable)

Define 4 elevation tiers (shadow + border + optional background change):
- **E0**: flat (canvas)
- **E1**: panel (soft border, minimal shadow)
- **E2**: floating panel (popover, dropdown)
- **E3**: modal / critical overlay

Rules:
- Opaque by default for E1 (panels/cards).
- E2 may use slight translucency, but text areas remain opaque.
- Blur only on overlays and sticky chrome; never on long-form content backgrounds.

### Glassmorphism policy (tasteful)

Allowed:
- sticky header (subtle)
- small popovers (subtle)
- occasional hero overlays (marketing only)

Prohibited:
- default card background everywhere
- large tables and dense dashboards behind blur
- message threads behind blur

---

## Part 6 — Motion / Interaction Rules

### Motion system primitives (what we standardize)

- durations: 120 / 160 / 200 / 240ms
- easing: one primary “standard” and one “emphasized” curve
- reduced-motion: always provide “opacity + shadow only” fallbacks

### Interaction rules

- Hover: subtle shadow increase + optional 1px lift (no more than 2px).
- Pressed: slight scale-down (0.98) is acceptable for buttons, but not for large cards.
- Tabs: crossfade or subtle slide; avoid heavy movement.
- Dialogs: fade + slight scale; keep content stable.
- Loading: skeletons should be calm, avoid harsh shimmer; prefer opacity pulse.

### “Too much motion” definition

- repeated ambient animations unrelated to state change
- bounce/overshoot used as default on every interaction
- large transforms on scroll

---

## Implementation doctrine (how we apply this to the codebase)

1. **Tokens first**: adopt the semantic role model across light + dark.
2. **Primitives second**: remove hardcoded colors and “glass by default” where it blocks the new system.
3. **Shell third**: unify nav/header/footer using the new tokens, typography, and elevation rules.
4. **Surfaces next**: normalize highest-frequency product surfaces first, then seller/admin, then assistant.

