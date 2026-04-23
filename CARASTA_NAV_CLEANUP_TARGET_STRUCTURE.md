# Carasta — Target Navigation Structure (Planning)

**Status:** Recommendations only — **no implementation** in this phase.  
**Aligned to:** Locked product / IA direction from the audit brief (social-first, Carmunity centerpiece, Market umbrella, Resources layer, Discussions canonical).

---

## A. Signed-out top nav (target)

**Principles:** Simple; do **not** mix full marketing flat list with full preview IA in one band; **Resources** absorbs How / Why / FAQ / Trust / Contact over time.

| Slot | Target label(s) | Target route(s) | Notes |
|------|-----------------|-----------------|-------|
| Logo | Carasta | `/` | Keep home for signed-out. |
| Primary (minimal) | Carmunity | `/explore` | Single entry; optional “Preview” in **inline subtitle** only if legally/UX needed — avoid two Carmunity strings. |
| Primary | Market | `/auctions` | Single entry — **remove** duplicate “Browse Market” if TN already says Market. |
| Primary | Resources | `/resources` | **Single** Resources link in header (remove duplicate from parallel strip). |
| Optional compact | Sign in / Join | `/auth/sign-in`, `/auth/sign-up` | Already in AA — TN can stay minimal. |

**Collapsing marketing:** Move **How It Works**, **Why Carasta**, **Contact** out of the flat signed-out TN into **Resources** dropdown + hub (footer can retain legal/support until TN is stable).

---

## B. Signed-in top nav (target)

**Principles:** Pillars **Carmunity**, **Market**, **Resources** + **messages icon** + **notifications** + **avatar** — no spelled-out “Messages” at xl if iconography is clear.

| Slot | Target | Route | Notes |
|------|--------|-------|-------|
| Pillar 1 | Carmunity (dropdown) | `/explore` default | Children: Feed (`/explore`), **Discussions**, Profile (self), **Garage**, optional Messages link for a11y |
| Pillar 2 | Market (dropdown) | `/auctions` default | Children: Live auctions / browse, Sell, My listings, Seller marketing (if enabled), Merch (decision) |
| Pillar 3 | Resources (dropdown) | `/resources` | Children: Help center hub, How it works, Why Carasta, FAQ, Trust & Safety, Contact |
| Icon | Messages | `/messages` | Replace text link with icon + tooltip; keep LR entry |
| Icon | Notifications | *(existing)* | Unchanged |
| Menu | Avatar | — | Display name; grouped sections (below) |

---

## C. Carmunity dropdown (target contents)

1. **Feed** — `/explore` (optional label “Carmunity feed”).  
2. **Discussions** — `/discussions`.  
3. **Profile** — `/u/{handle}`.  
4. **Garage** — `/u/{handle}/garage`.  
5. **Messages** — optional here if TN is icon-only (else skip to avoid triple Messages).

---

## D. Market dropdown (target contents)

1. **Browse / Live auctions** — `/auctions`.  
2. **Sell** — `/sell`.  
3. **My listings** — `/u/{handle}/listings`.  
4. **Seller marketing** (feature-flagged) — `/u/{handle}/marketing` with **one canonical name** aligned to page title.  
5. **Merch** — `/merch` *if* product confirms Market vs Resources ownership.

---

## E. Resources dropdown (target contents)

1. **Help / Resources home** — `/resources`.  
2. **How it works** — `/how-it-works` (until URL migrated under `/resources/*` if ever).  
3. **Why Carasta** — `/why-carasta`.  
4. **FAQ** — `/resources/faq`.  
5. **Trust & Safety** — `/resources/trust-and-safety`.  
6. **Contact** — `/contact`.  
7. **Community guidelines** — `/community-guidelines` (optional; legal sometimes footer-only).

---

## F. Avatar menu grouping (target)

### Personal / profile

- **Primary row:** `{displayName}` → `/u/{handle}` (fallback **Settings** if no handle).  
- **Settings** → `/settings`.  
- **Sign out** → `/api/auth/signout`.

### Selling / market (only if handle exists; marketing if enabled)

- **My listings** → `/u/{handle}/listings`.  
- **Seller marketing** (single label; pick **one** of: match H1 “Marketing command center”, or rename H1 to shorter nav-safe title — **do not** ship three names).

### Help / settings-adjacent

- **Quick help** — palette (keep shortcut).  
- **Help center** — `/resources` (consider renaming item to **“Resources & help”** if “Help center” implies a different route).

### Admin / internal (`ADMIN` only)

- **Admin** → `/admin`.  
- **Element feedback** → `/dashboard/feedback`.  
- **Marketing summary** (rename from “Seller marketing (review)”) → `/admin/marketing` — must read as **platform admin**, not seller.

**Marketing Summary in avatar:** Prefer **Admin home primary** + optional avatar deep link **only if** admins need constant access; otherwise remove from avatar to reduce confusion and keep admin IA in `/admin`.

---

## G. Left rail hierarchy (target)

**Role:** Signed-in **wayfinding** inside pillars — not a second top-level IA.

| Section | Items (target) |
|---------|----------------|
| **Carmunity** | Feed (`/explore`), **Discussions**, **Messages**, **Profile**, **Garage** — *Garage moves up from bottom*. |
| **Market** | Live auctions, Sell (+ nested My listings, Seller marketing as today). |
| **Resources** | Link to hub + optional shortcuts OR hub-only to avoid duplicating TN dropdown. |
| **Help** | Quick help (palette) — acceptable duplicate with avatar for power users. |
| **Merch** | Under Market section if classified as Market. |

**Duplication policy:** TN dropdowns + LR may both list **Discussions** and **Garage** — acceptable if TN is collapsed on smaller laptop widths; avoid **four** different names for the same feed (“Carmunity”, “Carmunity (Preview)”, “Explore”, preview notice).

---

## Part 7 — Signed-out / auth shell rules (target behavior)

| Context | Current behavior (audited) | Target recommendation |
|---------|---------------------------|-------------------------|
| **Marketing pages** (`/`, `/how-it-works`, …) | Full `CarastaLayout` header + footer; mobile bottom **hidden** for signed-out on marketing shell | Keep deliberate marketing experience; **simplify header** per section A. |
| **Auth pages** (`/auth/sign-in`, `/auth/sign-up`) | `MobileBottomNav` returns `null`; **desktop header still full** | Use **minimal header**: logo + optional “Back to home” + no marketing/preview clutter; **do not** duplicate Resources/Market unless product wants preview from auth. |
| **Signed-out app preview** (e.g. `/explore`, `/discussions`) | Full header; preview notice on feed | Single pillar strip + **Signed out preview** banner (existing component pattern). |

---

## Part 8 — SEO roadmap track (official)

Add a dedicated **SEO & discoverability** work track (parallel to nav cleanup):

1. **Technical SEO:** canonical tags, `metadata`/`metadataBase` consistency per segment `(marketing)` vs `(app)`, `robots.txt` / sitemap strategy, crawl budget for thin preview pages.  
2. **Metadata / canonical:** align title templates with pillar names post-rename; avoid `/carmunity` vs `/explore` duplicate without `rel=canonical` if both ever surface publicly.  
3. **Indexing strategy:** public **listings** (`/auctions/[id]`), **discussions** threads, **resources** articles — explicit allow/deny matrix for authenticated-only UI.  
4. **Events / shows (later):** URL scheme, structured data (`Event`), index timing.  
5. **Structured data:** `Organization`, `WebSite`, `Product`/`Vehicle` for listings where appropriate; `BreadcrumbList` for Resources hub.  
6. **Carmunity / Market public content:** profile and garage pages — policy for noindex until quality thresholds; messaging threads stay noindex.  
7. **Measurement:** Search Console properties, query landing parity after nav URLs change.

---

## Implementation sequencing hint (for a future phase)

1. **Single source of truth** for nav arrays (typed config: label, href, `session`, `roles`, `flags`, `surface`).  
2. **Rename trio** in one pass: avatar seller link, seller page `<h1>`, sidebar “Marketing” — after copy deck approval.  
3. **Admin avatar link** rename + optional removal.  
4. **Signed-out header** dedupe + collapse marketing.  
5. **Dropdowns** (or interim mega-menu) before deleting LR entries users rely on.

---

## Avatar cleanup — explicit decisions to make later

| Topic | Recommendation |
|-------|----------------|
| Display name vs “You” | Replace **You** with `session.user.name` (truncate) or handle `@x` fallback chain. |
| Marketing Dashboard vs Command Center | Pick **one external name**; update **avatar**, **sidebar**, and **`<h1>`** together. |
| Seller marketing (review) | Rename to **Marketing summary (admin)** or **Platform marketing**; never “Seller …” for `/admin/marketing`. |
| Marketing summary location | **Primary:** `/admin` card (already). **Avatar:** optional; default **off** unless admins request. |
