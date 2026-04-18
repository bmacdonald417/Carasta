# Carmunity Phase B — Shared visual system / tokens

**Goal:** Unify **Carmunity by Carasta** color roles across **Next.js** and **Flutter**: copper brand accent, red reserved for auction/bid/urgency, deeper surfaces, subtle borders. No full feed/card redesign (Phase C).

---

## 1. Tokens created

### Web

| Artifact | Purpose |
|----------|---------|
| `styles/carmunity-tokens.css` | Canonical **HSL component** variables for Tailwind: `--background`, `--card`, `--primary` (copper), `--performance-red` (signal), `--border`, `--ring`, etc. |
| `lib/design-tokens.ts` | Documented **hex mirror** + role descriptions for TS consumers / PR review. |

`app/globals.css` now imports `carasta.css` then `carmunity-tokens.css` and no longer duplicates a `:root` block (tokens live in `carmunity-tokens.css`).

### Flutter

| Artifact | Purpose |
|----------|---------|
| `carmunity_app/lib/app/theme/app_colors.dart` | Semantic roles: surfaces, text, **accent** (copper), **auctionSignal** (red), borders. |

---

## 2. Color decisions implemented

| Role | Web | Flutter |
|------|-----|---------|
| Brand / primary UI | **Copper** `hsl(37 76% 58%)` → Tailwind `primary`, `ring` | `AppColors.accent` `#E8A54B`, `ColorScheme.primary` |
| Auction / bid / live urgency | **Red** `hsl(348 100% 60%)` → `--performance-red`, Tailwind `signal` | `AppColors.auctionSignal` `#FF3B5C` |
| Page / card surfaces | Deeper neutrals (`--background`, `--card`, `--muted`) | `background`, `surface`, `surfaceCard`, `surfaceElevated` tuned darker |

---

## 3. Where copper replaced red (web)

Non-auction chrome now uses **primary (copper)** instead of `#ff3b5c`:

- `CarastaLayout`: marketing active link, app nav active/hover, sign-in hover, avatar focus ring, footer mail + legal hovers, gradient hairline.
- `AppSidebar` / `MobileBottomNav`: active pill / tab color, surfaces/borders.
- `app/layout.tsx`: body `bg-background text-foreground`.
- `HomeStatsStrip`: stat icon tint.
- `community-feed.tsx`: tabs active state, feed card border hover, **liked heart** (social = brand, not signal).
- `explore/page.tsx`, `forums/page.tsx`: inline links.
- `TrendingDreamGarage.tsx`: section title.
- `app/loading.tsx`: loader rings.

---

## 4. Where red is still used (auction / urgency)

- **Tailwind `signal`** = `hsl(var(--performance-red))` — used for auction CTAs and pricing emphasis.
- **`Button` `performance` variant** — still `hsl(var(--performance-red))` (bid / urgency actions).
- **`reserve-meter` gradient** — still starts at `--performance-red`.
- **`live-pulse` keyframes** — unchanged (red pulse for live).
- **`auction-card.tsx`**: LIVE pill, **high bid** text, card hover border (auction context).
- **`app/(marketing)/page.tsx`**: “View all” auction links + empty-state “Browse Auctions”.
- **`CountdownTimer.tsx`**: urgency text uses `text-signal`.

---

## 5. Surfaces updated

- **Web:** `CarastaLayout`, `AppSidebar`, `MobileBottomNav`, marketing home wrapper + sections (`bg-background`, `bg-card/*`, `border-border/*`), explore feed cards, auction cards (card surface tokens + signal border on hover).
- **`styles/carasta.css`:** Deeper `--carasta-bg`, card/glass rgba, **copper** glows on generic `.carasta-card` / `.neon-glow-blue` / `.neon-text-blue` (marketing chrome). **Live pulse** stays red.
- **Flutter:** Darker `AppColors` surfaces; `AppTheme` `navigationBarTheme` (surface + copper-tint indicator); scaffold/app bar unchanged structurally.

---

## 6. Files modified (summary)

**Web (representative):** `app/globals.css`, `styles/carmunity-tokens.css`, `styles/carasta.css`, `tailwind.config.ts`, `app/layout.tsx`, `components/carasta/CarastaLayout.tsx`, `components/layout/AppSidebar.tsx`, `components/layout/MobileBottomNav.tsx`, `components/home/HomeStatsStrip.tsx`, `app/(marketing)/page.tsx`, `app/(marketing)/explore/community-feed.tsx`, `app/(marketing)/explore/page.tsx`, `app/(marketing)/explore/TrendingDreamGarage.tsx`, `app/(marketing)/forums/page.tsx`, `app/(marketing)/auctions/auction-card.tsx`, `app/loading.tsx`, `components/auction/CountdownTimer.tsx`.

**Flutter:** `carmunity_app/lib/app/theme/app_colors.dart`, `app_theme.dart`, `features/auctions/presentation/auctions_screen.dart`, `auction_detail_screen.dart`.

**New:** `styles/carmunity-tokens.css`, `lib/design-tokens.ts`, this doc.

---

## 7. Intentionally NOT changed

- Full **feed layout / media grid** redesign (Phase C).
- **Shadcn component internals** beyond what inherits `primary` / surfaces from CSS variables.
- **Most admin / seller marketing** pages still contain legacy hex in places — low-traffic vs Phase B scope; can be swept in Phase C with a codemod.
- **Prisma / API** — no changes.
- **Auction business logic** — unchanged.

---

## Validation

```bash
npm run lint
npx tsc --noEmit
cd carmunity_app && flutter analyze
```

| Check | Result (agent environment) |
|--------|----------------------------|
| `npm run lint` | **Pass** (exit 0). Existing `no-img-element` warnings only. |
| `npx tsc --noEmit` | **Pass** (exit 0). |
| `flutter analyze` | **Not run** — `flutter` / `dart` not on PATH in this shell. Run locally before merge. |

Record results in the PR.

---

## Recommended Phase C starting point

1. **Feed post card** (web + Flutter): shared hierarchy (avatar row, media aspect, actions), use `primary` / `signal` consistently (likes = brand; any auction promo strip = signal).
2. **Codemod** remaining `#ff3b5c` / arbitrary reds outside auction folders to `primary` or `signal` with lint rule.
3. **Optional:** `ThemeExtension` on Flutter for `auctionSignal` in `Theme.of(context)` instead of static `AppColors` where widgets already use Theme.
