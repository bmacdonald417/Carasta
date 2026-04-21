# Carmunity / Carasta — Phase 1D: Discussions vertical slice normalization

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1A semantic tokens + elevation (`shadow-e1` / `shadow-e2`), Phase 1B `shellFocusRing` / `Badge`, Phase 1C precedent for bounded vertical slices.  
**Scope:** Marketing Discussions routes (`/discussions` hierarchy) + shared `components/discussions/*` consumers used by those pages. **Not** taxonomy redesign, **not** ranking/moderation backend changes, **not** admin moderation console redesign.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_1D_DISCUSSIONS_VERTICAL_SLICE.md` | This handoff document. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(marketing)/discussions/page.tsx` | Landing: calmer header/typography (product hierarchy vs `font-display` shout); tokenized sections (`border-border`, `bg-card`, `shadow-e1`); `divide-border`; removed `neutral-*` / `white/10` dividers; `shellFocusRing` on key links; **Badge** for “Gear” chips in discovery grid + All Gears; followed/for-you panels as coherent cards; destructive-styled load error. |
| `app/(marketing)/discussions/[gearSlug]/page.tsx` | Breadcrumb + headers on tokens; gear header card `bg-card shadow-e1`; Lower Gear rows + recent threads use `border-border` / `hover` parity; **Demo** marker → `Badge variant="secondary"` (no amber). |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/page.tsx` | Same list/card language; sort pills use `shellFocusRing`; pagination bar `bg-card shadow-e1`; demo **Badge**; metadata separators on muted tokens. |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` | Thread: breadcrumb + `shellFocusRing`; OP article `bg-card border-border shadow-e1`; title `font-semibold tracking-tight` (no display uppercase); metadata on `muted-foreground`; reactions panel calmer label; Share/Follow chrome less “primary-washed”; back link focus. |
| `components/discussions/DemoDiscussionsBanner.tsx` | Demo callout uses **caution** semantic tokens (not amber/gold chrome); calmer body copy colors. |
| `components/discussions/DemoProfileBanner.tsx` | Demo profile strip aligned to same **caution** semantic treatment as other discussion demo markers. |
| `components/discussions/DiscussionAuctionContextCard.tsx` | Listing context matches Messages-style marketplace card: `bg-card`, `border-border`, removed dark glass inner panel; **Live** retains `text-signal` (auction urgency), non-live status stays muted. |
| `components/discussions/DiscussionAuthorBadges.tsx` | Uses shared **Badge** (`outline` + soft primary tint) instead of bespoke pills. |
| `components/discussions/DiscussionThreadRepliesPanel.tsx` | Reply cards `bg-card border-border shadow-e1`; empty state dashed `border-border`; withdrawn content as muted inset line (not alarmist); demo **Badge**; `shellFocusRing` on Reply / Load more / Clear; load-more outline calmer. |
| `components/discussions/DiscussionThreadReplyComposer.tsx` | Solid `bg-card` composer (no backdrop-blur glass); textarea `bg-background`; **Post reply** → `Button variant="default"` (primary, not `performance` red). |
| `components/discussions/DiscussionReportDialog.tsx` | Overlay `bg-popover border-border shadow-e2`; title calmer; submit **default** primary (reports are serious but not “bid urgency”); inline message `text-muted-foreground`; inputs tokenized. |
| `components/discussions/DiscussionPeerSafetyMenu.tsx` | Separator dot uses muted token. |
| `components/discussions/DiscussionReactionPicker.tsx` | Dropdown content uses tokenized overlay (`shadow-e2`) aligned with Phase 1B menus. |

---

## 3. Biggest discussions landing / list / thread improvements

- **Landing:** Sections read as intentional **cards** with consistent borders, elevation, and typography rhythm; discovery grid uses **Badge** + calmer headings; errors use **destructive** surface language.
- **Gear / Lower Gear lists:** Row hierarchy is cleaner (title primary, metadata muted); **Demo** is a small **secondary Badge** (trust/density) instead of amber chips.
- **Thread OP:** Stronger article framing; title and meta hierarchy closer to product surfaces elsewhere; reactions block less “neon-primary” labeled.
- **Replies:** Each reply is a discrete **card** with clearer separation; empty and “replying to” states feel guided, not sparse.

---

## 4. Trust / moderation cue improvements

- **Report flow:** Dialog material matches other popovers; **Submit report** uses **primary** (credible action) instead of performance red reserved for auction/live urgency.
- **Withdrawn content:** Reads as **moderation outcome** via muted inset text, not loud warning red.
- **Demo:** **Caution** semantic banner + **Badge** for seeded threads/replies — intentional preview language without gold/copper functional chrome.
- **Block / mute:** Unchanged behavior; visual separators align with muted tokens.

---

## 5. Shared primitives / patterns extended

- **`Badge`:** Used on landing (Gear labels), gear/recent lists (Demo), and author role chips (`DiscussionAuthorBadges`).
- **`shellFocusRing`:** Applied to discussion breadcrumbs, list/trending links, pagination, and key reply actions for shell-consistent keyboard focus.
- **Elevation / materials:** Standardized on `shadow-e1` / `shadow-e2` + `card` / `popover` instead of `shadow-glass-sm` and translucent `card/40` stacks.

---

## 6. App / site parity notes

- Routes and vocabulary unchanged: **Discussions**, **Gear**, **Lower Gear**, **thread**, **reply**, **report** — stable for a future Carmunity app mapping.
- Visuals are token-driven so dark mode inherits semantic mappings from Phase 1A without separate “discussions theme.”

---

## 7. Intentionally deferred

- **Admin moderation UI** (`AdminDiscussionModerationClient`, admin routes) — out of scope (seller/admin slice).
- **Ranking / formulas / API payloads** — unchanged by design.
- **DiscussionReactionSummary** color semantics (still primary-forward for engagement tallies) — acceptable info accent; a later pass could split “count” vs “emphasis” if feed cards need stricter primary budget.
- **next/image** policy for every avatar/host — not expanded here.

---

## 8. Recommendation for the next implementation phase

**Phase 1E — Profile / Garage vertical slice normalization** (per `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md`: Profile/Garage is the next mid-frequency surface with residual display/glass drift). Alternative if product priority is feed-first: **Phase 1E — Explore / Carmunity feed card normalization** using the same bounded slice rules.

---

## 9. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Pre-existing `@next/next/no-img-element` warnings in non-Discussions files only. |
| `npx tsc --noEmit` | **Pass** (exit 0). |
