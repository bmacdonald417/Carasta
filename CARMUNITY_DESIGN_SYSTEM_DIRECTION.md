# Carmunity by Carasta — Design System Direction

**Purpose:** Single visual language for **Next.js (web)** and **Flutter (mobile)** under *Carmunity by Carasta*.  
**Parent plan:** [CARMUNITY_PRODUCT_DESIGN_UNIFICATION_PLAN.md](./CARMUNITY_PRODUCT_DESIGN_UNIFICATION_PLAN.md)

This document is the **target specification** for Phase B onward. It does not require immediate code changes.

---

## Design principles

1. **Dark performance luxury** — charcoal/graphite surfaces, subtle borders, restrained glow. Reads as *garage at night with a clean lift*, not nightclub neon.
2. **Social clarity** — every feed/forums surface answers: who, what, when, next action—in **one scan**.
3. **Mechanic-grade precision** — tight alignment, consistent radii, no arbitrary one-off shadows.
4. **Auctions as intensity moments** — reserve urgency and bid states may use **warmer / higher-chroma** accents than the default UI chrome, without becoming the whole theme.
5. **Platform-native motion** — same *duration* and *easing intent*; implementation differs (CSS/Framer vs Flutter).

---

## Color palette (direction)

### Current divergence (audit)

| Token role | Web (approx.) | Flutter (`AppColors`) |
|------------|----------------|------------------------|
| Page background | `#0A0A0F` (`--carasta-bg`) | `#0A0B0E` |
| Primary / CTA accent | `#FF3B5C` (mapped as primary + “neon”) | `#E8A54B` (copper) |

**Resolution (recommended):** Adopt a **split semantic palette** so both clients share the same *roles*:

| Semantic role | Description | Suggested hue direction |
|---------------|-------------|-------------------------|
| `brand.primary` | Primary buttons, selected nav, key links | **Copper–amber** (`~35–45° hue`) — distinctive, premium, reads “metal / heat” |
| `brand.onPrimary` | Text/icons on primary | Near-black or deep graphite |
| `signal.bid` | Bid CTA, live lot pulse, outbid warnings | **Controlled red–magenta** (current web red acceptable *here only*) |
| `signal.success` | Met reserve, payment ok | Emerald (web already has reserve-emerald concept) |
| `surface.base` | App background | Single agreed hex (pick **one** of `#0A0A0F` / `#0A0B0E`) |
| `surface.card` | Cards, elevated panels | `#12141A` family (Flutter `surface`) aligned to web card tokens |
| `border.subtle` | Default borders | `white` at **6–10%** opacity or `#2A2F3C` |
| `text.primary` / `secondary` / `tertiary` | Body hierarchy | Match Flutter contrast steps on web via CSS variables |

**Rule:** Do not use **signal.bid** red for generic selected tabs or forum chrome—reserve it for auction *state* and *critical* alerts.

---

## Typography hierarchy

### Roles

| Role | Usage | Web direction | Flutter direction |
|------|--------|----------------|-------------------|
| Display | Marketing hero, section titles | Keep **Oswald**-style uppercase for *large* moments only; reduce overuse in dense UI | Use **displaySmall** / custom headline for rare marketing-style headers inside app |
| Title | App bar, card titles | **Inter** semibold / tight tracking (not all-caps) | `titleLarge` / `titleMedium` (already) |
| Body | Post/thread body | Inter 16/400, line-height ~1.5 | `bodyLarge` |
| Meta | Timestamps, counts, chips | Muted neutral, 12–13px | `bodySmall` / `labelMedium` |
| Mono (optional) | Lot numbers, VIN snippets | JetBrains Mono or IBM Plex Mono at small sizes only | Same if needed for technical content |

**Action:** Add a **shared type scale table** (px sizes + weights) in code comments or a `tokens.json` later; until then, **Flutter `AppTypography` is the baseline** for sizes—web Inter utilities should approximate those steps.

---

## Spacing / sizing rhythm

**Base unit:** 4px (both platforms already gravitate to this).

| Token | px | Usage |
|-------|-----|--------|
| `xs` | 4 | Tight icon padding |
| `sm` | 8 | Inline gaps |
| `md` | 16 | Card padding, section gaps |
| `lg` | 24 | Section separation |
| `xl` | 32 | Page vertical rhythm |

**Flutter reference:** `AppSpacing` — extend web Tailwind spacing usage to **prefer 4/8/16/24** over arbitrary values like `py-7` unless necessary.

---

## Card system

### Global card rules

- **Radius:** `12px` (`rounded-xl` on web ≈ `AppSpacing.radiusMd` on Flutter) for feed and forum list cards; **16px** for featured / hero modules.
- **Border:** 1px `border.subtle`; on hover/focus (web): **1px** glow using `brand.primary` at **10–15%** opacity—not full neon outline.
- **Background:** `surface.card` with **no harsh gradient**; optional **1–2%** vertical highlight for “sheet metal” depth.
- **Padding:** `md` horizontal, `md` vertical minimum.

### Card variants (name in design spec; implement later)

| Variant | Use |
|---------|-----|
| `FeedMediaCard` | Image-first post; text below |
| `FeedTextCard` | Text-only; larger body preview |
| `ForumThreadRow` | Title + space/category chips + reply count + last activity |
| `AuctionCompact` | Inline auction promo in feed |
| `AuctionHero` | Showroom / listing hero (existing patterns evolved) |

---

## Iconography

- **Style:** Lucide (web) and Material Symbols Rounded (Flutter) will not match 1:1—**match stroke weight intent** (2px equivalent, rounded caps).
- **Semantics:** Same icon *meaning* per IA item (Home = house, Forums = bubbles, Auctions = gavel, Create = plus in circle).

---

## Surfaces & elevation

- **Scaffold:** flat `surface.base`; avoid noisy background patterns until Phase G.
- **Modals / drawers:** `surface.elevated` + scrim `black` at **cc** alpha (Flutter already has `scrim`).
- **Dividers:** full-width `1px` `divider` token—avoid double borders between stacked cards (use gap instead).

---

## Buttons & inputs

| Type | Spec |
|------|------|
| Primary | Filled `brand.primary`, label `brand.onPrimary`, height **44px** min touch target |
| Secondary | Ghost or outline on `border.subtle`; hover = `surface.elevated` |
| Destructive | Only for irreversible actions |
| Segmented control (feed tabs) | Pill container `surface.elevated`; selected = **subtle** fill (primary at 15–20%) + **primary** indicator line or label color—not full red bar |

**Inputs:** Rounded `sm` (8px), filled background `surface.elevated`, focus ring = `brand.primary` at 1.5px (Flutter already close).

---

## Empty states

- **Illustration:** Minimal line art (wrench + speech bubble / grid road) **monochrome** with `brand.primary` accent stroke only.
- **Copy:** Short imperative + one CTA (“Follow builders” / “Open Forums”).
- **Layout:** Vertically centered in content area; **never** a raw empty list with no explanation (replace mobile “Latest” engineering banner with product-friendly copy when API lands).

---

## Feed cards (cross-platform contract)

**Header row:** Avatar (40), display name + handle, timestamp (relative optional), overflow menu.  
**Media:** Max aspect **4:3** or **16:9** with **letterbox** rules; tap opens detail.  
**Body:** 2–3 lines clamp; “Read more” inline.  
**Actions row:** Like (heart), comment (bubble), share (optional phase G). Counts adjacent to icons.  
**States:** Liked uses `brand.primary` (if copper) or dedicated `like.active` token—**consistent** across web/mobile.

---

## Profile blocks

- **Cover** (optional phase E): wide gradient or user image with **bottom scrim**.
- **Identity row:** Avatar overlap, name, handle, bio (2 lines), location chip.
- **Stats:** posts / followers / forum reputation (when available)—**horizontal** compact chips.
- **Tabs:** same order preference as mobile: **Posts | Garage | Auctions** (auction tab label can be “Activity” if needed).

---

## Auction cards

- Preserve **technical credibility** (reserve meter, time left, bid count) but **visually nest** inside Carmunity cards (shared border/radius).
- **Bid CTA** uses `signal.bid`; secondary “Watch” uses outline secondary.

---

## Forum / thread cards

- **List row:** Title **titleMedium** weight; meta line = space · category · time; trailing **reply count** pill.
- **Thread detail:** Original post as **author card** + body; replies threaded with **left rail** (1px `divider`) rather than boxed comment spam.

---

## Motion & transition philosophy

| Context | Duration | Curve |
|---------|----------|--------|
| Nav selection | 150–200ms | ease-out |
| Card press | 100ms | ease-in-out |
| Page transition (mobile) | 250–300ms | standard decelerate |
| Parallax / hero | subtle only | respect `prefers-reduced-motion` |

**Web:** Framer Motion only where it improves clarity (staggered list **once** on first paint max).  
**Flutter:** Use `Theme` animation defaults; avoid bouncy springs on lists.

---

## Implementation mapping (later phases)

| Token / concept | Web implementation | Flutter implementation |
|-----------------|---------------------|-------------------------|
| Semantic colors | `app/globals.css` `:root` + Tailwind `extend.colors` | `AppColors` constants → `ColorScheme` |
| Radii / space | Tailwind theme + utility classes | `AppSpacing` |
| Components | `components/carmunity/*` (new) + evolve shadcn | Existing widgets refactored to shared style |

---

## Open decisions (resolve in Phase B kickoff)

1. **Single background hex** — pick one canonical `surface.base`.
2. **Primary brand accent** — copper vs amber vs hybrid; document exact `#RRGGBB`.
3. **Whether Playfair** remains for *auction lot titles only* or is retired for a tighter tech-social look.

---

## Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-18 | Initial direction from current `globals.css`, `carasta.css`, `AppColors`, `AppTypography` |
