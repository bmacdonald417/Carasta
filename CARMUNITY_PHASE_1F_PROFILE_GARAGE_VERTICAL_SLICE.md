# Carmunity / Carasta — Phase 1F: Profile / Garage vertical slice normalization

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1A semantic tokens + elevation, Phase 1B `shellFocusRing` / `Badge`, Phases 1C–1E vertical-slice precedent.  
**Scope:** `/u/[handle]` profile, garage, dream garage, owner listings, and shared profile components **touched in this pass**. **Not** new social/garage features, **not** seller workspace overhaul, **not** backend model changes.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_1F_PROFILE_GARAGE_VERTICAL_SLICE.md` | This handoff document. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(app)/u/[handle]/page.tsx` | Profile header: solid `bg-card`, `border-border`, `shadow-e1` (no glass/blur); calmer `h1`; avatar `border-border`; stats grid `bg-muted/20`, stat numbers sans `font-display`, links use `shellFocusRing`; Share trigger muted chrome; action `outline` buttons `border-border` + focus; saved threads / following strip / empty states on dashed `border-border` + `muted` (no primary wash); section titles product-weight; won-auction cards `shadow-e1` + link focus; “Won at” line uses `text-foreground` (not decorative primary). |
| `app/(app)/u/[handle]/garage/page.tsx` | Calmer page title; empty state tokenized; primary nav buttons with `shellFocusRing`. |
| `app/(app)/u/[handle]/dream/page.tsx` | Same header/empty/button treatment; dream `Card` uses default `Card` solid variant + hover border emphasis; vehicle title `font-semibold` (no display). |
| `app/(app)/u/[handle]/listings/page.tsx` | Removed hex/red hover drift: `Card` solid variant; listing image area `bg-muted`; status chips via `Badge` + semantic classes (`signal` LIVE, `success` SOLD, muted otherwise); title hover `text-primary`; LIVE high bid `text-signal`; empty state panel; nav links `shellFocusRing`. |
| `app/(app)/u/[handle]/listings/listings-filters.tsx` | Outline chips `border-border` + `shellFocusRing`. |
| `components/profile/ProfileGaragePreviewGrid.tsx` | Empty state calmer (`Badge`, dashed `border-border`); tile overlay uses **background gradient** + `text-foreground` (no black wash); tiles `shadow-e1` / hover. |
| `components/profile/ProfilePostPreview.tsx` | Feed-aligned `Card` (default solid); **Listing** chip as `Badge` primary outline (not performance-red chrome); borders `border-border`; `shellFocusRing` on text links. |
| `components/carmunity/ProfilePostsEmpty.tsx` | Empty panel matches Phase 1E style; CTAs with `shellFocusRing`. |
| `components/profile/CarmunityActivitySection.tsx` | Headings calmer; empty + list rows `bg-card` / `shadow-e1`; **Badge** for thread/reply; load more as `Button outline` + focus. |
| `components/profile/ProfileCarmunitySetupStrip.tsx` | Solid `card` panel + `Badge` eyebrow; buttons tokenized (no heavy primary gradient box). |
| `components/profile/TrustPanel.tsx` | `bg-card` + `shadow-e1`; “How reputation works” link focus; **disputes lost** uses `text-destructive` / `font-semibold` (urgency/trust signal). |
| `components/profile/SocialLinks.tsx` | Removed `white/10` panels and **red hover** ring; token `border-border` / `bg-muted/*`; per-network hues kept readable; TikTok uses muted tokens; `shellFocusRing` on each link. |

---

## 3. Biggest profile / garage improvements

- **Identity header:** Reads as a **single premium card** with clear avatar, name, handle, badges, and bio rhythm — no translucent “glass profile.”
- **Stats strip:** Clear grid separation, calmer numerals, **focus-visible** aligned with shell for linked stats.
- **Garage preview:** Thumbnails keep energy but lose **black gradient** overlay; labels stay legible on token-based scrim.

---

## 4. Module / activity / listing preview improvements

- **Carmunity activity:** List rows are discrete **cards** with **Badge** kind labels; empty state matches other slices.
- **Saved discussions / setup strip / posts empty:** Dashed **border-border** + muted surfaces instead of loud primary gradients.
- **Listings (owner):** Status and pricing use **semantic** colors (`signal` for live urgency, `success` for sold); removed **hardcoded hex** and neutral-900 panels.
- **Social links:** Coherent with product chrome while keeping light brand tint on icons.

---

## 5. Shared primitives / patterns extended

- **`Badge`:** Garage empty eyebrow; activity kind; listing status chips (with semantic color classes).
- **`shellFocusRing`:** Profile stats (where linked), action row, saved threads, won auction links, listings nav, filters, post previews, social links, trust doc link.
- **`Card` default variant:** Leveraged where applicable (`ProfilePostPreview`, listings, dream) for consistent elevation and border.

---

## 6. App / site parity notes

- Vocabulary unchanged: **Profile**, **Garage**, **Dream garage**, **Listings**, **Carmunity activity**, **Saved discussions**.
- Token-only styling keeps future **Flutter app** mapping straightforward (`card`, `muted`, `primary`, `signal`, `success`, `destructive`).

---

## 7. Intentionally deferred

- **`GarageCard3D`** internal visuals (only page chrome + preview grid normalized).
- **`ReputationBadge`** internals (consumed as-is).
- **FollowButton** behavior unchanged (already primary/secondary variants).
- **Marketing / seller workspace** routes beyond listings chrome — out of scope per Phase 1F guardrails.

---

## 8. Recommendation for the next implementation phase

**Phase 1G — Public auction browse & listing card normalization** (commerce discovery surfaces: `/auctions` list, search cards, listing detail chrome where still legacy) **or** **Phase 2 — Settings & account** for a bounded account/settings slice — whichever product priority ranks next after identity surfaces.

---

## 9. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Pre-existing `@next/next/no-img-element` warnings in non–Phase 1F files only. |
| `npx tsc --noEmit` | **Pass** (exit 0). |
