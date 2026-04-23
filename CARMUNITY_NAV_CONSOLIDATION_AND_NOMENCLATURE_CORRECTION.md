# Carmunity — Nav consolidation & nomenclature correction

**Phase:** Controlled implementation (post-audit).  
**Date:** 2026-04-22  

This document records what shipped in the nav consolidation pass, per approved IA: Carmunity (centerpiece), Market (commerce umbrella), Resources (trust/help), Discussions (canonical term), and aligned labels/destinations.

---

## 1. Files created

- `CARMUNITY_NAV_CONSOLIDATION_AND_NOMENCLATURE_CORRECTION.md` (this file)

---

## 2. Files modified

- `components/carasta/CarastaLayout.tsx` — signed-out / signed-in headers, dropdowns, avatar menu, messages icon, auth-shell header, footer column + CTA labels  
- `components/layout/AppSidebar.tsx` — Carmunity/Market/Resources grouping, Garage placement, Live Auctions / My Listings / Marketing / Campaigns / Merch labels  
- `app/(app)/u/[handle]/marketing/page.tsx` — `<h1>` aligned to **Marketing** (matches nav)

---

## 3. Files removed

- `components/layout/nav.tsx` — unused alternate header IA (confirmed no imports); removed to prevent future drift  

---

## 4. Biggest signed-out nav fixes

- Removed the **marketing strip** (`marketingNav`) that competed with public pillars and caused **duplicate Resources**.  
- **Signed-out pillars** are now **Carmunity** → `/explore`, **Market** → `/auctions`, **Resources** (dropdown with hub + How It Works, Why Carasta, FAQ, Trust & Safety, Contact).  
- Removed **Market (Browse)** vs **Browse Market** duplicate; single **Market** treatment.  
- **Auth shell** (`/auth/*`, signed out): **reduced header** — **Home** + contextual **Join Carmunity** (on sign-in) or **Sign in** (on sign-up), without marketing/pillar clutter. Pillar row hidden on large screens when on auth (spacer only).  
- **Mobile / &lt;lg:** compact pillar row for signed-out/signed-in (same IA as desktop).  
- Footer **“Explore”** column retitled **Learn** with a non-overlapping link set; hero secondary CTA label **Browse Market** → **Market**.

---

## 5. Biggest signed-in nav fixes

- **Carmunity**, **Market**, and **Resources** are **dropdown triggers** (chevron) with approved children.  
- **Discussions** is in the **Carmunity** dropdown (desktop discoverability).  
- **Market** dropdown: Live Auctions, Sell, My Listings, Marketing + Campaigns (when `marketingEnabled`), Merch.  
- **Resources** dropdown matches signed-out resource links + hub entry.  
- **Messages** in the header is **icon-only** (`MessageSquare`, `aria-label` / `title`), preserving `/messages`.  
- Active-state helpers approximate pillar scope (including profile/garage under Carmunity; listings/marketing under Market).

---

## 6. Biggest avatar-menu / nomenclature fixes

- Replaced **“You”** with **`displayMenuName(session)`** (name → `@handle` → email local-part → “Account”).  
- **Grouped** items: identity + Settings → (separator) → My Listings + Marketing when applicable → (separator) → Quick help + Help center → (separator) → Admin block → Sign out.  
- Seller workspace link label **Marketing** (no “Marketing dashboard”).  
- Admin **`/admin/marketing`** link label **Marketing summary** (aligned with admin page title).  
- Removed mislabeled **Seller marketing (review)**.  
- **Element Feedback** label for `/dashboard/feedback`.  
- Seller page **`<h1>`** set to **Marketing** so it matches nav entry points.

---

## 7. Biggest left-rail fixes

- **Garage** and **Profile** moved into the **Carmunity** block (with Explore, Discussions, Messages).  
- **Messages** uses **Mail** icon (vs Discussions **MessageSquare**) to reduce duplicate icon confusion.  
- **Market:** **Live Auctions** row, **Sell** with nested **My Listings**, **Marketing**, **Campaigns** (when enabled), then **Merch** under Market.  
- Removed the old **bottom** Garage + Merch block that sat after Resources.

---

## 8. Stale nav sources removed

- `components/layout/nav.tsx` deleted (orphaned).

---

## 9. SEO roadmap note

**SEO is an official roadmap track** (technical SEO, canonical/metadata, indexing policy for public listings/discussions/resources, events/shows later, structured data). **No SEO behavior was implemented** in this phase. Public IA cleanup (single Market label, Resources as hub, fewer duplicate header links) **supports** clearer crawl signals in a later phase.

---

## 10. Intentionally deferred

- **Watchlist / Saved:** no practical routes surfaced in the codebase audit pass; **not** added to Market dropdown.  
- **`MobileBottomNav`:** unchanged beyond global shell; a future pass can align labels/icons with dropdown IA if product wants parity.  
- **`/wallet`:** still not in primary shell nav.  
- **Resources URLs:** still mix `/how-it-works` and `/why-carasta` at site root vs under `/resources/*` — **URL migration** is out of scope (behavior preserved).  
- **Merch** retained in Market per approved list; product still may reclassify later.

---

## 11. Validation

- `npm run lint` — **passed** (existing project warnings for `<img>` only, including pre-existing layout images).  
- `npx tsc --noEmit` — **passed**.

---

## 12. Recommendation for next phase

1. **Single nav config module** (typed arrays: label, href, `session`, `marketingEnabled`, `role`) consumed by `CarastaLayout`, `AppSidebar`, and `MobileBottomNav` to prevent drift.  
2. **Mobile bottom nav** review: add Carmunity/Market dropdown parity or document intentional simplification.  
3. **SEO track** execution: canonical strategy for `/explore` vs `/carmunity`, sitemaps, and public listing/thread metadata.  
4. **Watchlist** (if/when shipped): add to Market dropdown + sidebar under agreed rules.
