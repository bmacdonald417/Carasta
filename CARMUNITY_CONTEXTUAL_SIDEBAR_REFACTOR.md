# Carmunity — Contextual sidebar refactor

**Phase:** Desktop left-rail responsibility change (bounded, structural).  
**Date:** 2026-04-22  

---

## 1. Files created

- `CARMUNITY_CONTEXTUAL_SIDEBAR_REFACTOR.md` (this file)

---

## 2. Files modified

- `components/layout/AppSidebar.tsx` — contextual pillar body, full-height shell, bottom jumpers, demoted Quick help  
- `components/carasta/CarastaLayout.tsx` — `min-h-0` on the main shell row so the sticky sidebar can size correctly inside the flex column  

---

## 3. Biggest sidebar responsibility changes

- The rail **no longer renders all three pillars** (Carmunity + Market + Resources) as stacked sections.  
- It now shows **one active pillar** label and **that pillar’s child links only** in the scrollable main area.  
- **Cross-pillar movement** is limited to **two compact jumpers** (“More” → Carmunity / Market / Resources entry routes) at the bottom.  
- **Quick help** is demoted to a **single subtle text row** with the ⌃/ hint (no large motion row).  
- **Removed** nested “Sell + sub-rows” pattern in favor of a **flat Market list** aligned with the top-nav Market dropdown.  
- **Wallet** added to the Market pillar list (route already existed; pillar detection included `/wallet`).

---

## 4. Active-pillar behavior changes

- **`getActivePillar(pathname, handle)`** picks **`resources` | `market` | `carmunity`**.  
- **Carmunity** body: Explore, Discussions, Messages, Profile, Garage (same routes as before).  
- **Market** body: Live Auctions, Sell, My Listings (if handle), Marketing + Campaigns (if enabled), Merch, Wallet.  
- **Resources** body: Resources hub (active only on exact `/resources`), How It Works, Why Carasta, FAQ, Glossary, Trust & Safety, Contact, Community guidelines, Terms, Privacy.  
- **Visual:** `lg:sticky lg:top-20 lg:h-[calc(100dvh-5rem)] lg:max-h-[calc(100dvh-5rem)]` with an inner **scroll** region so the rail stays **viewport-anchored** under the header (`md`/`lg` header height is `5rem` at desktop).

---

## 5. Bottom-jumper behavior changes

- Small **“More”** strip with muted background; two **`<JumperRow>`** links with compact type and `ArrowUpRight` affordance.  
- **Carmunity** active → jump to **Market** (`/auctions`), **Resources** (`/resources`).  
- **Market** active → **Carmunity** (`/explore`), **Resources** (`/resources`).  
- **Resources** active → **Carmunity** (`/explore`), **Market** (`/auctions`).  

---

## 6. Route / pillar mapping notes

| Pillar | Paths (summary) |
|--------|-------------------|
| **Resources** | `/resources/*`, `/how-it-works`, `/why-carasta`, `/contact`, `/community-guidelines`, `/terms`, `/privacy` |
| **Market** | `/auctions`, `/sell`, `/merch`, `/wallet`, `/u/{handle}/listings`, `/u/{handle}/marketing` (incl. campaigns) |
| **Carmunity** | **Default** — `/explore`, `/discussions`, `/messages`, `/u/{handle}` (except listings/marketing), `/settings`, `/admin`, `/dashboard`, `/welcome`, etc. |

**Ambiguity choices (documented):**

- **`/settings`**, **`/admin/*`**, **`/dashboard/*`**, **`/welcome`**: classified **Carmunity** so the sidebar stays a “product home” context rather than inventing a fourth pillar.  
- **`/terms`**, **`/privacy`**, **`/community-guidelines`**: classified **Resources** and listed in the Resources body for continuity on those pages.  
- **Watchlist / Saved**: **deferred** — no stable dedicated route surfaced in this pass.

---

## 7. Intentionally deferred

- **Mobile bottom nav** — unchanged per phase scope.  
- **Shared nav config extraction** (single source with top nav) — follow-up.  
- **Watchlist** — add when product defines a canonical URL.  
- **Per-resource deep links** beyond the listed set (e.g. every `/resources/*` article) — only primary entries included; hub remains the path to the rest.

---

## 8. Recommendation for the next phase

1. **Extract** `getActivePillar` + child link metadata into a small **`lib/shell-sidebar.ts`** (or similar) shared with tests.  
2. **Optional:** highlight jumpers when the **target pillar** would be active if navigated (low priority).  
3. **Mobile:** decide whether a **collapsed pillar context** chip belongs in the bottom bar or stays top-nav-only.

---

## 9. Validation

- `npm run lint` — passed (existing `<img>` warnings only).  
- `npx tsc --noEmit` — passed.
