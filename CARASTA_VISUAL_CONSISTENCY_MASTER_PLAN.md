## Carasta Platform-wide Visual Consistency + Design-System Refinement

This is a **planning-first** package for the next major initiative: **platform-wide visual consistency** and **design-system refinement** across:

- Homepage / public IA
- Carmunity / explore
- Discussions
- Messages
- Profiles / Garage
- Seller growth workspace
- Admin surfaces
- Assistant/help layer

This plan is grounded in the **current codebase** and the styling systems already in use.

---

## Part 1 — System Audit (Current State, In Code)

### 1) Global styling architecture (what exists today)

- **Tailwind + CSS variable theme**: `tailwind.config.ts` maps Tailwind colors to `hsl(var(--token))` roles such as `--background`, `--foreground`, `--primary`, etc.  
  - This is good: it enables semantic theming and allows us to shift the visual system without rewriting every component.
- **Global CSS entry**: `app/globals.css` imports multiple style layers:
  - `styles/carasta.css` (Carasta “cyber-luxury” theme variables and utilities)
  - `styles/carmunity-tokens.css` (semantic tokens; currently **dark-first**, copper accent)
  - `styles/carmunity-motion.css` (some motion utilities + reduced motion handling)
- **UI primitives**: `components/ui/*` resembles a Radix + Tailwind + CVA (“shadcn-style”) stack. This is a strong foundation for a system-level refinement initiative because core controls are centralized.

### 2) Tokens & themes currently in use (and where drift begins)

**A. Carmunity tokens are dark-first and copper-accented**

- `styles/carmunity-tokens.css` defines `:root` semantic tokens (background/foreground/card/etc.) as deep graphite values.
- `--primary` and `--ring` are copper (`#E8A54B`), reinforced by `lib/design-tokens.ts` which explicitly calls out “brand copper” and positions it as the primary accent.
- The app-level layout (`app/layout.tsx`) applies `carasta-theme` on the body, and `styles/carasta.css` includes additional “cyber” utilities (glass, neon glow).

**B. Public homepage is already trending light/premium-neutral**

- `app/(marketing)/page.tsx` includes many sections with **white / neutral-50** backgrounds, neutral-900 text, and classic premium spacing.
- This is directionally aligned with the locked decision: “move toward a lighter, higher-contrast, more premium visual system overall.”
- However, it currently coexists with the dark-first Carmunity token system used by core app surfaces.

**C. Seller workspace is a separate *semantic* sub-theme (but same app)**

- `styles/carmunity-tokens.css` includes `--seller-*` tokens (canvas/panels/border/info/success/caution/urgency/etc.).
- `app/(app)/u/[handle]/marketing/page.tsx` and `components/marketing/seller-workspace-primitives.tsx` use these semantics heavily, and the page reads as one of the cleanest-looking surfaces.  
  This is currently the **strongest** example of:
  - consistent spacing
  - restrained use of accent
  - tool-like hierarchy
  - “analytics / dashboard” density control

**D. Admin surfaces use hardcoded colors that contradict the stated direction**

- `app/(admin)/admin/page.tsx` and `app/(admin)/admin/marketing/page.tsx` include:
  - hardcoded `#ff3b5c` (red) as a primary “brand” accent
  - hardcoded `#CCFF00` (neon-lime) for KPI tiles
  - heavy “dark glass” styling (`bg-white/5`, `backdrop-blur-sm`, etc.)
- This conflicts with locked decisions:
  - red reserved for urgency/danger
  - remove yellow/copper/gold as primary accent
  - move to lighter, premium, product-first visual system

### 3) UI primitives audit (core consistency levers)

**Buttons**

- `components/ui/button.tsx` centralizes variants, but includes “performance” and “emerald” variants (auction-specific) alongside general variants.
- The base button has strong motion (`transition-all`, `active:scale`) and uses `--ring` + `--primary` for focus and default states.

**Cards**

- `components/ui/card.tsx` applies a “glass” aesthetic by default: `bg-card/80`, `backdrop-blur`, `shadow-glass-sm` with hover to `shadow-glass`.
- This makes “glass” the default card language for the entire platform unless overridden, which increases drift when some surfaces (homepage, seller workspace) want opaque/premium panels instead.

**Dialogs / menus**

- `components/ui/dialog.tsx` uses hardcoded dark surfaces (`bg-[#0c0d12]`) and neutral text.
- `components/carasta/CarastaLayout.tsx` dropdown menu content uses `bg-[#121218]/95`, again hardcoded.
- These hardcoded colors bypass semantic tokens and guarantee inconsistency as we evolve the system.

### 4) Typography audit (current pattern)

- Fonts loaded in `app/layout.tsx`: Inter (sans), Oswald (display), Playfair (serif).
- `styles/carasta.css` forces headings into Oswald with uppercase + letter spacing and a “cyber” tone.
- Many pages use `font-display uppercase tracking` patterns (e.g., messages and discussions page headings), while the homepage uses more mixed-case premium marketing typography.

Net: typography is **not yet a unified hierarchy**. It is a mix of:
- “brand-y uppercase display”
- “product UI neutral”
- “marketing premium”
without clear rules about where each applies.

### 5) Spacing / elevation audit (current pattern)

- Spacing often looks good locally, but the platform lacks a shared “rhythm”:
  - some surfaces use `rounded-2xl` everywhere
  - seller workspace uses a more deliberate radius ladder (`rounded-[1.5rem]`, `rounded-[1.75rem]`, `rounded-[2rem]`)
  - homepage uses classic section padding (`py-16 md:py-20`)
- Elevation is inconsistent:
  - glass shadows exist in Tailwind theme (`shadow-glass`, `shadow-glass-sm`)
  - seller workspace uses explicit shadow recipes (long soft shadows)
  - admin uses dark glass with minimal shadow structure

### 6) Motion audit (current pattern)

- Motion exists but is not yet systematized:
  - `styles/carmunity-motion.css` has measured hover lift for feed cards and reduced-motion alternatives.
  - `components/ui/motion-section.tsx` uses a single “fade up” entrance (easeOut).
  - `components/carasta/CarastaLayout.tsx` uses Framer Motion for header blur transitions.

Net: motion is present, but there’s no shared easing/duration ladder or “where motion is allowed” policy.

### 7) Accessibility & contrast risks visible in code

- Dark-first tokens can be accessible, but **glass overlays + muted text** often risk contrast drift over time.
- Hardcoded colors (`#ff3b5c`, `#CCFF00`, hardcoded dark dialog backgrounds) bypass token-driven contrast tuning.
- Some UI relies on color + subtle opacity for state (e.g., “active” nav, hover states). We need explicit state tokens and focus visibility rules.

---

## Design Debt Map (What’s Strong, What’s Weak, Where Drift Happens)

### Strongest today (directional reference)

- **Seller marketing dashboard / seller workspace**: consistent semantic tokens, clean density, premium tool-like panels.
- **Homepage sections**: already trending light, high-contrast, premium-neutral with good spacing.
- **Radix-based UI primitives**: centralized controls; good place to enforce consistency.

### Worst inconsistency today (highest priority debt)

- **Token identity conflict**: the platform is simultaneously “dark cyber copper” and “light premium neutral.”
- **Hardcoded color usage** in dialogs, dropdowns, admin pages, and some links (bypasses semantics).
- **“Glass everywhere” default**: cards are glass by default, which forces a look even where opaque panels are better.
- **Typography split**: uppercase Oswald “brand” headings leak into product UI where an Apple-clean tone wants calmer hierarchy.

### Where ad hoc styling is likely causing drift

- Direct Tailwind utility styling at page level (especially for admin and special panels).
- Hardcoded hex colors and fixed neutral palettes instead of semantic tokens.
- Custom shadows/radii per surface without a shared elevation/radius ladder.

---

## Immediate initiative goal (what “success” means)

Carasta becomes one coherent premium platform by:

- **One canonical semantic token system** (light-first) used across all surfaces.
- **One component doctrine** (primitives own states, spacing, radii, elevation; pages compose them).
- **Surface emphasis** (seller/admin) achieved via density + panel hierarchy + local accents, **not** a separate brand palette.
- **Blue / blue-violet** becomes the primary informational/active accent; **red is urgency only**; copper/gold is removed as primary accent.

---

## Part 7 preview — Surface-by-surface prioritization (high level)

This is expanded in `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md`, but the early-order logic is:

1. **Design doctrine + semantic token system** (the “source of truth”)
2. **UI primitives normalization** (Button, Card, Dialog, Input, Tabs, Toast, Dropdown)
3. **Global shell** (header/nav/footer) and “app chrome”
4. **Messages + Discussions + Profile/Garage** (high-frequency product surfaces)
5. **Seller workspace** (preserve strength; align tokens + component primitives)
6. **Admin** (remove hardcoded neon; adopt same semantic roles)
7. **Assistant layer** (polish with same primitives and motion rules)

---

## Part 13 — Critical Unknowns (Only what affects implementation)

1. **Brand accent decision**: should any copper remain as a *secondary* accent (e.g. rare “heritage” highlight), or should it be fully retired from UI chrome?  
   This impacts whether we keep a `--brand-heritage` token at all.
2. **Typography role split**: do we keep Oswald/uppercase as a marketing-only display voice, or reduce its footprint and migrate product UI headings to Inter (or another neutral display)?  
   This impacts component defaults (CardTitle, page H1s, nav labels).
3. **Light-mode-first scope**: do we make the core app (explore/discussions/messages) **default to light mode**, with dark as optional, or keep dark as default short-term and flip later?  
   This affects sequencing and risk.

