# Carmunity Phase 1I — Public homepage and marketing surface visual unification

This document records the Phase 1I presentation-layer pass: aligning the homepage, top scrolling auction strip, mid-page proof bands, and high-traffic public marketing/informational routes with the stabilized semantic token system (light-first, blue-violet emphasis, red reserved for urgency, no copper/yellow in functional chrome).

## 1. Files created

- `CARMUNITY_PHASE_1I_PUBLIC_HOMEPAGE_AND_MARKETING_UNIFICATION.md` (this file)

## 2. Files modified

- `app/(marketing)/page.tsx` — homepage marketplace proof band focus rings use `ring-offset-background` on dark `bg-foreground` sections (earlier pass); platform blocks tokenized.
- `app/(marketing)/how-it-works/page.tsx` — removed cream gradient and neutral slabs; card rhythm `border-border bg-card shadow-e1`; related band `bg-muted/30`; sell CTA uses `variant="default"` instead of legacy `performance`.
- `app/(marketing)/why-carasta/page.tsx` — full public-surface alignment; reason cards on `bg-card`; proof band uses `bg-foreground` + harmonized inset panel; resource band `bg-muted/30`; CTAs primary + outline.
- `app/(marketing)/resources/page.tsx` — `bg-background`, calmer headings, `text-muted-foreground` body.
- `app/(marketing)/resources/faq/page.tsx` — FAQ items use card tokens.
- `app/(marketing)/resources/trust-and-safety/page.tsx` — internal sections match `ResourcePageLayout` language (no stray `neutral-*` / `font-display`).
- `app/(marketing)/contact/page.tsx` — background and side panels tokenized; form card `border-border bg-card`.
- `app/(marketing)/community-guidelines/page.tsx`, `app/(marketing)/terms/page.tsx`, `app/(marketing)/privacy/page.tsx` — removed `#fafaf7` gradient canvas; headers and section cards use semantic surfaces; `LegalDraftBanner` uses caution tokens.
- `components/home/HomePublicSections.tsx` — section rhythm, hero, pillars, trust band, seller intelligence on `bg-muted/40` (replacing harsh dark slab where appropriate).
- `components/home/HomeStatsStrip.tsx` — stat tiles as premium cards with primary icon accent and focus rings.
- `components/home/LiveActivityFeed.tsx` — `info-foreground` / `caution-foreground` / muted tokens; card shell `bg-card`.
- `components/home/AuctionImageStrip.tsx` — `Badge` for Live with pulse dot; strip on `bg-muted/30`; no legacy bright-red “live” chrome.
- `components/home/ShowroomHero.tsx` — Live badge tokenized; carousel chrome controls use translucent `background` tokens + border; dot track aligned with same system.
- `components/resources/ResourcePageLayout.tsx` — layout canvas `bg-background`; calmer page intro typography.
- `components/resources/ResourceCardGrid.tsx` — cards `bg-card shadow-e1`; icon wells `bg-primary/10`.
- `components/legal/LegalDraftBanner.tsx` — `caution` / `caution-soft` / `caution-foreground` instead of raw amber utilities.

## 3. Biggest homepage and public visual-unification improvements

- Public canvas moved off warm cream (`#fafaf7`-style gradients) onto `bg-background` and card/muted bands, matching the crisp `--background` token (220 33% 98%).
- Homepage and marketing sections share one rhythm: `rounded-2xl`, `border-border`, `shadow-e1`, muted section bands instead of unrelated “dark marketing” slabs where they competed with the product story.
- Typography on public pages de-emphasizes `font-display` / magazine weight in favor of `font-semibold` product headings and `text-muted-foreground` supporting copy.
- CTA hierarchy leans on `bg-primary` / `text-primary-foreground` for primary actions and bordered `bg-card` for secondary—consistent with the rest of the app shell.

## 4. Top scrolling banner integration changes

- **`AuctionImageStrip`**: Live state uses the shared `Badge` with a subtle pulse dot and primary styling (not ad-hoc red text). Strip sits on `bg-muted/30` with `border-border` thumbnails so it reads as part of the surface stack, not a legacy widget.
- **`ShowroomHero`**: Hero carousel keeps position and auto-advance; Live badge matches strip language; prev/next controls use `border-white/20`, `bg-background/10`, and backdrop blur so they feel tokenized on the dark `bg-foreground` stage; pagination dots use `bg-background` family for the same integrated look.

## 5. Shared primitives and patterns extended

- Reuse of **`Badge`** for non-urgent “Live” on public auction surfaces (aligned with “signal is vivid but not casual red body copy”).
- Consistent **public card panel**: `rounded-2xl border border-border bg-card p-* shadow-e1` across resources, legal drafts, FAQ, trust page internals, how-it-works, and stats strip.
- **`LegalDraftBanner`** now maps to semantic **caution** tokens for draft/legal notice (per doctrine: caution ≠ destructive red).

## 6. App and site parity notes

- Vocabulary unchanged: **Discussions**, **Carmunity**, **Garage**, etc.
- Visual tokens are the same semantic CSS variables the app shell uses (`background`, `foreground`, `primary`, `muted`, `card`, `border`), which keeps future mobile/web parity work from fighting a separate “marketing palette.”

## 7. What was intentionally deferred

- A line-by-line visual audit of **every** nested guide under `/resources/*` (e.g. glossary, what-is-carasta) beyond FAQ and trust-and-safety—those still inherit `ResourcePageLayout` improvements but were not individually redesigned.
- **`/auctions` marketing listing** and other secondary marketing routes (merch, carmunity marketing landing) were not part of the minimum high-traffic list for this phase.
- Replacing `<img>` in `CarastaLayout` with `next/image` (existing lint warnings; out of scope for Phase 1I).

## 8. Recommendation for the next implementation phase

- **Phase 2 public content and trust (or a scoped “1I-follow”)**: sweep remaining `/resources/**` article pages for any lingering neutral-only utilities; add a single **optional** `PublicProse` or `MarketingSection` wrapper only if duplication cost stays high; then pause for the new planning agent to reconcile **app/site parity** and IA with Phase 1 complete.

## Validation

- `npm run lint` — **passed** (existing warnings only: `no-img-element` in unrelated files).
- `npx tsc --noEmit` — **passed** (exit code 0).

## Manual sanity checklist

- [ ] `/` — homepage renders; auction strip scrolls; no console errors.
- [ ] `/how-it-works`, `/why-carasta`, `/resources`, `/resources/faq`, `/contact` — consistent header/card rhythm.
- [ ] `/terms`, `/privacy`, `/community-guidelines`, `/resources/trust-and-safety` — draft banner readable; sections visually in-family.
