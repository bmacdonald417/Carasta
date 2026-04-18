# Carmunity Phase A — Implementation notes

**Scope:** Naming + information architecture alignment (web), per `CARMUNITY_PRODUCT_DESIGN_UNIFICATION_PLAN.md`. No broad visual redesign.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `app/(marketing)/forums/page.tsx` | Read-only forums landing: lists **active forum spaces** from `listForumSpaces()` (real DB data; empty state when none). |
| `app/(marketing)/carmunity/page.tsx` | **302-style navigation:** `redirect("/explore")` — friendly URL without duplicating feed UI. |
| `CARMUNITY_PHASE_A_NOTES.md` | This document. |

---

## 2. Files modified

| File | Change summary |
|------|----------------|
| `app/layout.tsx` | Root `metadata`: Carmunity-by-Carasta default title + `template`, social-first description. |
| `app/(marketing)/explore/page.tsx` | H1/copy → **Carmunity**, “by Carasta”, link to **Forums**. |
| `app/(marketing)/page.tsx` | Closing value-prop paragraph → Carmunity-first + auctions. |
| `app/(marketing)/community/leaderboard/page.tsx` | Back link label **Carmunity**. |
| `app/(marketing)/explore/post/[id]/page.tsx` | Back link label **Carmunity**. |
| `app/(marketing)/explore/TrendingDreamGarage.tsx` | Subcopy “from Carmunity”. |
| `app/(auth)/auth/sign-in/page.tsx` | Sign-in blurb mentions **Carmunity**. |
| `app/(auth)/auth/sign-up/page.tsx` | Sign-up blurb → **Carmunity by Carasta**. |
| `components/carasta/CarastaLayout.tsx` | `appNav`: **Carmunity**, **Forums**, Auctions, Sell; dropdown **You**; footer tagline. |
| `components/layout/AppSidebar.tsx` | **Home** (was Showroom), **Carmunity**, **Forums**, Auctions, Sell + icons. |
| `components/layout/MobileBottomNav.tsx` | Same pillar order + tighter layout for five items. |
| `components/layout/nav.tsx` | Nav links + **You** (legacy header, kept consistent). |
| `components/home/HomeStatsStrip.tsx` | Stat label **Carmunity posts**. |
| `components/marketing/campaign-type-label.tsx` | Display label for enum `community` → **Carmunity** (schema value unchanged). |
| `components/marketing/carmunity-promo-panel.tsx` | Button copy **Open Carmunity feed**. |
| `components/marketing/campaign-form.tsx` | Select option label **Carmunity** (value still `community`). |
| `lib/carmunity/engagement-service.ts` | Activity broadcast label **Carmunity**. |
| `lib/marketing/marketing-display.ts` | Traffic source label **Carmunity** (was “Carmunity / community”). |

**Internal identifiers intentionally unchanged:** e.g. `CommunityFeed` component name, `/api/explore/feed`, `communityPosts` in `lib/home-stats.ts`, Prisma / campaign enum `community`.

---

## 3. Visible naming changes (Community → Carmunity)

- Primary nav / sidebar / mobile bottom: **Community** → **Carmunity** (target `/explore`).
- Explore page title and body copy: **Carmunity** + **by Carasta**.
- Leaderboard and post detail back links: **← Carmunity**.
- Trending Dream Garage helper line: **Carmunity**.
- Auth sign-in / sign-up helper copy: Carmunity wording.
- Home stats strip: **Carmunity posts**.
- Marketing seller UI: campaign type label for internal type `community` displays **Carmunity**; promo panel **Open Carmunity feed**.
- Root browser title/description: **Carmunity by Carasta** positioning.

---

## 4. Nav / IA changes

**Order (aligned with app pillars where possible):**

1. **Carmunity** → `/explore` (feed; unchanged route).
2. **Forums** → `/forums` (new minimal surface).
3. **Auctions** → `/auctions`.
4. **Sell** → `/sell` (web seller reality; maps to app **Create** intent only partially — called out for Phase C+).

**Desktop sidebar / mobile bottom:**

- **Home** replaces **Showroom** for `/` (matches header “Home” and reduces split vocabulary).
- **Garage** / **Merch Store** unchanged below the divider.

**Header (`CarastaLayout`):** Marketing links unchanged; app cluster now **Carmunity · Forums · Auctions · Sell**.

**Account:** Dropdown first item label **Profile** → **You** (parity with mobile **You** tab).

---

## 5. How Forums are surfaced on the web

- **Nav:** **Forums** in desktop header `appNav`, `AppSidebar`, `MobileBottomNav`, and `nav.tsx`.
- **Page:** `GET` data via server component calling `listForumSpaces()` — same backing service as `GET /api/forums/spaces`. Renders **title, description, category count, slug** per space; **no fabricated threads**.
- **Copy:** Explains full read/write thread UX is app-first for now; web is browse spaces + structural parity.

---

## 6. Route decision (`/explore` vs `/carmunity`)

| Route | Behavior |
|-------|----------|
| `/explore` | **Canonical** Carmunity feed URL (existing behavior, bookmarks, APIs unchanged). |
| `/carmunity` | **Optional entry:** server `redirect("/explore")` — no duplicate content, no SEO split, zero risk to existing flows. |

No migration of `/explore` → `/carmunity` in this phase.

---

## 7. Recommended next phase

**Phase B — Shared visual system / tokens** (`CARMUNITY_DESIGN_SYSTEM_DIRECTION.md`): resolve web **#ff3b5c** vs Flutter **copper** accent roles, document and implement CSS variables + Flutter `AppColors` parity, then feed card restyle can proceed without renaming churn.

---

## Validation

Commands run (2026-04-18):

```bash
npm run lint
npx tsc --noEmit
```

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Existing `@next/next/no-img-element` warnings in other files; none introduced in new forums/carmunity routes. |
| `npx tsc --noEmit` | **Pass** (exit 0). |

Record results in PR description.
