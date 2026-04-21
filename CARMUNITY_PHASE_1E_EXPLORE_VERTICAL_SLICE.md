# Carmunity / Carasta — Phase 1E: Explore / Carmunity feed vertical slice normalization

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1A tokens/elevation, Phase 1B `shellFocusRing` + `Badge`, Phase 1C/1D bounded vertical-slice precedent.  
**Scope:** `/explore` Carmunity feed, supporting strips, post detail + composer/comment surfaces **touched by this slice**. **Not** feed ranking changes, **not** homepage/marketing overhaul, **not** profile/garage redesign.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_1E_EXPLORE_VERTICAL_SLICE.md` | This handoff document. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(marketing)/explore/page.tsx` | Page header: `border-b`, calmer title/subtitle (`text-muted-foreground`), `shellFocusRing` on Discussions link; container `md:max-w-3xl` for slightly roomier feed layout. |
| `app/(marketing)/explore/TrendingDreamGarage.tsx` | Replaced glass stack (`white/10`, `backdrop-blur`, `neutral-*`) with `border-border bg-card shadow-e1`; calmer heading (no `font-display` shout). |
| `app/(marketing)/explore/community-feed.tsx` | **Marketplace / trending strips:** `bg-card`, `divide-border`, calmer section titles, `shellFocusRing` on links. **Tabs:** bordered `TabsList` + `shadow-e1`. **Post / thread / reply cards:** solid `bg-card`, `shadow-e1` / `hover:shadow-e2`, removed `backdrop-blur` / `bg-card/70`; avatars use `border-border`; **Badge** for post + discussion row types; thread titles `font-semibold` (no display uppercase); **Share** trigger uses muted chrome (not primary-washed); content/snippet hierarchy on `foreground` / `muted-foreground`. |
| `app/(marketing)/explore/create-post-form.tsx` | Composer `bg-card border-border shadow-e1`; inputs `bg-background`; `shellFocusRing` on submit; removed translucent/blur shell. |
| `components/explore/DiscussedAuctionsStrip.tsx` | **Marketplace pulse** as `Badge` + product heading; auction tiles tokenized (`border-border`, `bg-muted/20`, `shadow-e1`); removed `bg-black/25` / `white/10`; `shellFocusRing` on auction + browse links. |
| `components/carmunity/FeedEmptyState.tsx` | Empty states: dashed `border-border`, `bg-muted/20`, `shadow-e1` — calmer than heavy primary gradient; CTAs keep default/outline with `shellFocusRing`. |
| `components/carmunity/FeedPostInlineComment.tsx` | Expanded composer panel `bg-card border-border shadow-e1`; textarea tokenized. |
| `components/carmunity/PostReactionPicker.tsx` | Dropdown overlay `bg-popover border-border shadow-e2` (aligned with Phase 1B/1D menus). |
| `app/(marketing)/explore/post/[id]/page.tsx` | Post detail card tokenized; back + profile links `shellFocusRing`; comments section calmer heading; empty + comment rows on `card` / `border-border`; fixed non-vivid `text-border` separator. |
| `app/(marketing)/explore/post/[id]/post-engagement.tsx` | Border token + Share trigger muted chrome (matches feed). |
| `app/(marketing)/explore/post/[id]/comment-form.tsx` | Input `border-border bg-background`; minor responsive wrap on form row. |

---

## 3. Biggest Explore / feed improvements

- **Page hierarchy:** Explore reads as a **product hub** (header band + supporting modules + feed) instead of a loose title + neutral blurb.
- **Feed cards:** Consistent **opaque card** language with **elevation** (`shadow-e1` → `hover:shadow-e2`) and clearer **metadata** (Badge type chips, calmer thread titles).
- **Supporting modules:** **Marketplace pulse** and **Trending threads** no longer compete with translucent/glass stacks; they **support** the feed with secondary surface treatment.
- **Actions:** Share/inline patterns use **muted** chrome so **primary** stays for true emphasis (links, reactions), preserving energy without noise.

---

## 4. Supporting module improvements

- **DiscussedAuctionsStrip:** Integrated listing tiles match token **card** language; hover uses **primary border** tint only (no dark glass).
- **TrendingDreamGarage:** Section is a proper **card** when visible; typography matches the calmer Explore header.
- **Trending threads (in feed):** Same list treatment as Phase 1D discussions strips (`divide-border`, hover row wash).

---

## 5. Shared primitives / patterns extended

- **`Badge`:** “Marketplace pulse” label, **Post** chip, **Discussion** chips on mixed following feed.
- **`shellFocusRing`:** Discussions link from Explore, strip links, post author links, empty-state CTAs, post detail nav links.
- **Elevation:** `shadow-e1` / `shadow-e2` replace ad-hoc `shadow-sm` + glass on this slice.

---

## 6. App / site parity notes

- Routes and names unchanged: **Explore**, **Carmunity**, **post**, **Following** / **Trending** tabs.
- Styling is token-based for predictable **app** reuse later (`card`, `muted`, `primary`, `border`).

---

## 7. Intentionally deferred

- **GarageCard3D** internals — only the Explore wrapper was normalized; 3D card visuals are a larger component pass.
- **CarmunityOnboardingDialog** — not part of feed chrome in this slice.
- **Feed algorithm / API** — unchanged.
- **Profile / Garage** — next roadmap slice after Explore.

---

## 8. Recommendation for the next implementation phase

**Phase 1F — Profile / Garage vertical slice normalization** (the next high-visibility identity surface after Explore, per `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md`). Alternatively, if commerce UX is prioritized: **auction browse / listing card normalization** in a bounded slice.

---

## 9. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Pre-existing `@next/next/no-img-element` warnings in non-Explore files only. |
| `npx tsc --noEmit` | **Pass** (exit 0). |
