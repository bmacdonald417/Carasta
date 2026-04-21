## Carmunity / Carasta — Phase 1A Substrate Stabilization (Implemented)

This document records what shipped in **Phase 1A — Stabilize the Substrate**: token semantics, primitive defaults, overlay materials, focus semantics, motion token groundwork, and systemic typography leakage fixes — without broad page redesign.

---

### 1) Files created

- `styles/carasta.semantic.tokens.css` — canonical **light-first** semantic tokens + secondary `.dark` mapping + semantic state colors + elevation shadow tokens + motion tokens
- `styles/carasta.motion.tokens.css` — motion token import anchor (duplicates core durations for now; allows future separation)
- `styles/carasta.tokens.legacy.css` — placeholder compatibility layer (extend as needed during later migrations)

---

### 2) Files modified

- `styles/carmunity-tokens.css` — now a **stable import entrypoint** that pulls canonical tokens (+ legacy shim)
- `app/globals.css` — corrected CSS import order (tokens before marketing chrome) + made `.glass` **selective** (not “dark glass card by default”)
- `styles/carasta.css` — removed **global Oswald/uppercase heading leakage**; moved display typography to **opt-in** `.carasta-marketing-display`; aligned legacy marketing vars to semantic tokens
- `styles/carmunity-motion.css` — migrated key durations to **motion CSS variables**
- `tailwind.config.ts` — added semantic Tailwind colors (`info*`, `success*`, `caution*`, `danger*`) + `shadow-e{1..3}` aliases
- `lib/design-tokens.ts` — updated documentation mirror to reflect **blue-violet functional accent** + copper as **heritage-only**
- `components/ui/card.tsx` — removed **glass-by-default**; added `variant` (`solid` default, `glass` opt-in); calmed `CardTitle` typography
- `components/ui/dialog.tsx` — removed hardcoded dark modal surface; tokenized overlay + popover materials
- `components/ui/dropdown-menu.tsx`, `components/ui/select.tsx` — replaced `shadow-glass` default with **`shadow-e2`**
- `components/ui/button.tsx`, `components/ui/tabs.tsx`, `components/ui/toast.tsx` — stabilized transition + shadow semantics (less “mystery shadow”, fewer hardcoded destructive reds in toast chrome)
- `components/ui/motion-section.tsx` — aligned default easing to the substrate “standard” curve family
- `components/carasta/CarastaLayout.tsx` — removed framer-motion header RGBA hack + removed hardcoded dropdown surface + replaced neutral “dark shell” palette classes with **token-driven** text/border/bg classes (still not a page redesign; shell substrate only)

#### Substrate contrast repair (mechanical, not a redesign pass)

After moving the global semantic substrate to **light-first**, many TSX files still used `text-neutral-100` (a near-white Tailwind color) in contexts that are now on light surfaces, which would become unreadable.

To prevent obvious regressions without redesigning layouts, Phase 1A includes a **mechanical class substitution**:

- `text-neutral-100` → `text-foreground`

This touched multiple `app/**` and `components/**` TSX files wherever the substring appeared. It is intentionally **not** a typography/layout redesign—only a contrast-safe class swap driven by the token migration.

---

### 3) Token changes made (high-signal)

- **Light-first `:root`** for core shadcn roles: `--background`, `--foreground`, `--card`, `--popover`, borders, muted text.
- **Functional accent is blue-violet** via:
  - `--primary`, `--primary-foreground`, `--ring` → blue-violet family (this preserves Tailwind `primary` usage while eliminating copper as functional chrome)
- **shadcn `--accent` remains a muted interactive surface** (important: do not confuse with “brand accent”).
- Added explicit semantic groups:
  - `--info*`, `--success*`, `--caution*`, `--danger*`
- Added elevation tokens:
  - `--shadow-e1`, `--shadow-e2`, `--shadow-e3`
- Added motion tokens:
  - `--motion-duration-{1..4}`, `--motion-ease-standard`, `--motion-ease-emphasized`
- Preserved auction signal tokens:
  - `--performance-red`, `--reserve-emerald`, legacy `--neon-blue` mapping
- Added transitional heritage token:
  - `--legacy-brand-copper` (copper is no longer carried by `--primary`)

---

### 4) Primitive default changes made

- **`Card`**: default is **opaque** (`solid`) with `shadow-e1`/`hover:shadow-e2`; `glass` is explicit `variant="glass"`.
- **`CardTitle`**: removed default `font-display` product-heading styling (moved toward calmer Inter-led hierarchy).
- **`Dialog` / dropdown surfaces**: use `bg-popover` + `border-border` + `shadow-e3` (dialog) / `shadow-e2` (menus/select).

---

### 5) Overlay/material changes

- Dialog scrim moved from hardcoded `bg-black/70` to **`bg-foreground/55`** (token-derived).
- Shell dropdown removed `bg-[#121218]/95` override; uses **`bg-popover/95`** + token borders/text.

---

### 6) Typography leakage fixes

- Removed global rules that forced **Oswald + uppercase** on all `h1/h2/h3` under `body.carasta-theme`.
- Introduced **opt-in** `.carasta-marketing-display` (and kept `.carasta-heading` as an alias for older call sites).

---

### 7) Motion token additions

- Canonical motion variables live in `styles/carasta.semantic.tokens.css` and are imported early via `app/globals.css`.
- `styles/carmunity-motion.css` now references those variables for key transitions/animations.

---

### 8) Compatibility / shim strategy used

- **Kept `styles/carmunity-tokens.css` path stable** but turned it into an import shim so downstream imports don’t churn.
- **Kept Tailwind `primary` key** but redefined its underlying CSS variables to mean the **new functional accent** (blue-violet), while preserving shadcn structure.
- Introduced `--legacy-brand-copper` for rare transitional styling needs without wiring copper into `--primary`.

---

### 9) Intentionally deferred (explicitly out of Phase 1A)

- Homepage section composition / marketing redesign passes (`components/home/*` beyond global substrate effects)
- Explore / discussions / messages / profile page typography sweeps (`font-display uppercase` removal outside systemic fixes)
- Seller workspace redesign / admin redesign / assistant redesign
- Codemod-scale migration of all `text-primary` semantics to finer-grained roles (`info`, `danger`, etc.)

---

### 10) Recommendation for Phase 1B (next)

**Goal:** make the *remaining shell + navigation surfaces* fully consistent now that primitives/tokens won’t fight them.

Suggested order:
1. `components/layout/AppSidebar.tsx` + `components/layout/MobileBottomNav.tsx` — remove neutral “dark UI” assumptions; align active states to `primary`/`muted` patterns used in header
2. `components/notifications/NotificationDropdown.tsx` — tokenize any remaining hardcoded surfaces
3. Add **`Badge`/`Panel` primitives** (small, high leverage) to prevent continued page-level ad hoc styling in later phases

---

## Validation

Run locally:
- `npm run lint`
- `npx tsc --noEmit`

Results in this workspace:
- `npm run lint`: **pass** (existing warnings only: `@next/next/no-img-element` in a few components)
- `npx tsc --noEmit`: **pass**

Sanity expectations:
- App should render with a **light-first** substrate; dark mode remains available via `.dark` class mapping.
- Cards should read as **opaque panels** by default; glass is opt-in.
- Dialogs/menus should no longer rely on one-off dark hex surfaces in the shared primitives/shell path shown above.
