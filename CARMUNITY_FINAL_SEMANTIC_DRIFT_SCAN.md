# Carmunity — final semantic drift scan (pre–Phase 2 reassessment)

Narrow cleanup pass completed **2026-04-21**. Scope: correct true semantic drift (legacy pink/red as normal chrome, copper-as-primary on mobile, hardcoded dark panels), not broad redesign.

---

## 1. Files created

- `CARMUNITY_FINAL_SEMANTIC_DRIFT_SCAN.md` (this file)

---

## 2. Files modified

| Area | File |
|------|------|
| Web — auctions map | `components/auctions/AuctionsMapView.tsx` |
| Web — leaderboard | `components/leaderboard/LeaderboardTable.tsx` |
| Web — marketing email | `lib/marketing/render-marketing-digest-email.ts` |
| Web — shared UI | `components/ui/share-buttons.tsx` |
| Web — legacy CSS | `styles/carasta.css` |
| Flutter — tokens | `carmunity_app/lib/app/theme/app_colors.dart` |
| Flutter — theme | `carmunity_app/lib/app/theme/app_theme.dart` |

---

## 3. Biggest semantic drift issues fixed

1. **Auction map popups**: Current bid and “View auction” used performance signal red (`--performance-red` / `bg-signal`) like primary CTAs. **Bid amount** now uses `text-primary` (info accent). **“View auction”** now uses `bg-primary` / `text-primary-foreground` (normal primary action). **Live** badge remains `bg-signal` (legitimate live/auction signal).

2. **Leaderboard**: “Highest bid won” column used performance red for a **static statistic** — not urgency. Styling aligned with other numeric columns (inherits table text color).

3. **Weekly marketing digest email**: Section underlines and links used hardcoded legacy pink/red (`#ff3b5c`, `#cc2244`) for normal navigation and section structure. Now uses `designTokens.colors.accentBlueVioletApproxHex` so email matches functional web accent without CSS variables.

4. **Share dropdown**: `DropdownMenuContent` used a hardcoded dark slab (`bg-[#121218]/95`) that bypassed tokenized surfaces. Now `border-border bg-popover/95 text-popover-foreground` for light-first / theme consistency.

5. **`.live-pulse` keyframes**: Replaced hardcoded `rgba(255, 59, 92, …)` with `hsl(var(--performance-red) / …)` so live animation stays urgency-scoped but tracks the design token.

6. **Flutter `AppColors`**: Comments and values treated **copper as `accent`** (including `ColorScheme.primary`), conflicting with web rules (blue-violet functional accent, copper heritage-only). **Accent** is now blue-violet; **heritage copper** exposed as `heritageCopper` for rare use. **`AppTheme`**: `onPrimary` set to white for readable labels on violet primary buttons.

---

## 4. Shared components corrected

- **`ShareButtons`**: Tokenized popover surface instead of fixed `#121218` panel.
- **`Button`**: No change — `performance` variant remains for real auction/urgency use; repo scan showed **no** `variant="performance"` usages in TSX (variant available, unused).

---

## 5. What was intentionally deferred

- **`ShareButtons` trigger** default classes (`border-white/10 bg-white/5` …): Tuned for dark marketing/hero contexts; changing defaults could affect many layouts — not clearly “wrong” vs contextual.
- **`.live-pulse` usage**: Only normalized the color source to the token; any **where** it is applied was left unchanged (still performance-scoped).
- **`AuctionsMapView` `<img>`** lint: Pre-existing Next.js `no-img-element` warning; out of scope for this pass.
- **Broader Flutter surfaces** (e.g. keeping dark-first app shell): Only semantic **roles** for accent/copper were corrected, not a full M3 parity audit with web light mode.
- **`dart analyze`**: Not run in this environment (Dart SDK not on PATH). Recommend running locally after pulling.

---

## 6. Validation result

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Existing info-level warnings only (`no-img-element` in a few components including `AuctionsMapView`). |
| `npx tsc --noEmit` | **Pass** (exit 0). |
| `dart analyze` (Flutter) | **Not executed** here — run in CI or locally. |

**Sanity**: Touches are limited to map cards, leaderboard column, digest email HTML, share menu surface, one CSS animation, and Flutter theme tokens — low risk of broken routes/imports.

---

## 7. Recommendation for the new-agent reassessment phase

1. **Treat Flutter and web as one product family** for token docs: keep `AppColors` / `designTokens` / CSS comments in sync when accent roles change.
2. **Inventory `bg-signal` / `text-signal` / `performance` button** on a schedule: ensure they only appear for live lots, countdowns, bid pressure, or true destructive flows — not general navigation or statistics.
3. **Email + PDF + push** templates: prefer a single exported accent hex or inline-safe token map (as with digest + `designTokens`) to avoid reintroducing `#ff3b5c`-style drift.
4. **Optional follow-up**: `ShareButtons` default trigger styling could be split into a `variant="onDark" | "onLight"` prop if mixed contexts become painful.
5. **Phase 2 planning**: Focus on capability and IA; visual system baseline is now stable enough that new work should **extend tokens**, not fork hex values at route level.
