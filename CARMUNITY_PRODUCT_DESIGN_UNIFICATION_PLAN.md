# Carmunity by Carasta — Product & Design Unification Plan

**Status:** Planning (no broad visual restyle in this document)  
**Scope:** Next.js website (`app/`, `components/`, `styles/`) + Flutter app (`carmunity_app/`)  
**Companion:** [CARMUNITY_DESIGN_SYSTEM_DIRECTION.md](./CARMUNITY_DESIGN_SYSTEM_DIRECTION.md) — token-level design direction

---

## Executive summary

Carasta already has **two product surfaces** evolving in parallel: the web app remains **auction- and showroom-forward** with social features tucked under “Community” (`/explore`), while the Flutter app is explicitly **“Carmunity by Carasta”** with **social-first IA** (Home feed, Forums, Create, Auctions, You). Backend support for Carmunity (posts under `/api/carmunity/*`) and **forums** (`ForumSpace` / `ForumCategory` / `ForumThread` in Prisma + `/api/forums/*`) exists on the server, but **the website does not expose forums in navigation or pages**, and **naming, accent color, typography, and feed patterns diverge**.

This plan unifies both clients under **Carmunity by Carasta** as the umbrella product: **social + forums first**, **auctions important but secondary**, **one IA story**, **one design language** (dark performance-luxury, not generic startup), implemented in **phases that avoid rework** (naming/IA → tokens → surfaces → polish).

---

## Current problems (evidence-based)

### 1. Naming & brand hierarchy

| Area | Web today | Mobile today |
|------|-----------|----------------|
| Product naming | Header wordmark **“Carasta”**; nav label **“Community”**; explore H1 **“Community”** | App title **“Carmunity by Carasta”**; Home app bar **“Carmunity / by Carasta”** |
| Metadata | `app/layout.tsx`: “Premium Collector Car Auctions” | N/A (store listing uses app name) |
| Social surface | Path **`/explore`**, copy “Posts from the community” | Path **`/home`**, branded Carmunity |

**Code touchpoints (rename / hierarchy):** `components/carasta/CarastaLayout.tsx`, `components/layout/AppSidebar.tsx`, `components/layout/MobileBottomNav.tsx`, `components/layout/nav.tsx`, `app/(marketing)/explore/page.tsx`, root `app/layout.tsx` metadata.

### 2. Information architecture mismatch

| Concept | Web | Mobile |
|---------|-----|--------|
| Primary “home” | **`/`** = Showroom (auctions hero, strips, sections) | **`/home`** = Carmunity feed |
| Social | **`/explore`** only; no top-level Forums | **`/home`** + **`/forums`** + **`/create`** |
| Auctions | **`/auctions`** (prominent in nav + home) | **`/auctions`** (one of five pillars) |
| Profile / garage | **`/u/[handle]`**, garage routes under `(app)` | **`/you`** (profile, garage placeholder, saved auctions) |
| Merch | **`/merch`** in **mobile bottom nav only** (not in `AppSidebar`) | Same |

Forums: **Prisma models and REST handlers exist** (`app/api/forums/spaces`, `.../threads`, etc.) but **no `(marketing)` or `(app)` forum browser UI** was found in the route inventory—mobile consumes APIs; **web users cannot discover forums**.

### 3. Styling & design language drift

- **Web accent:** primary / performance red `#ff3b5c` (Tailwind + `styles/carasta.css` “neon” mapped to red).
- **Flutter accent:** warm **copper** `#E8A54B` (`carmunity_app/lib/app/theme/app_colors.dart`).
- **Web display type:** Oswald uppercase + Playfair — **automotive editorial / auction**.
- **Flutter type:** Material 3 `TextTheme` from `AppTypography` — **product UI**, no Oswald/Playfair pairing.

Result: same dark backgrounds roughly, but **different “performance” cues** and **different personality**.

### 4. Feature exposure & social UX

- **Feed API split:** Web explore client uses **`/api/explore/feed`**; Carmunity mobile uses **`/api/carmunity/posts`** (and related routes). Two conceptual pipelines for the same product story.
- **Feed tabs:** Web `community-feed.tsx` — **Trending / Following** only. Mobile `HomeScreen` — **Following / Trending / Latest** (Latest explicitly blocked until API supports chronological sort).
- **Feed presentation:** Web uses generic **shadcn Tabs + Card**; mobile uses **`FeedPostCard`** (media-first, optimistic like). Feels like different products.
- **Home page:** `app/(marketing)/page.tsx` is **auction-first** (hero carousel, ending soon, recently added); Carmunity is a **narrow LiveActivityFeed band** + Instagram + download CTA—not parity with mobile’s social hub.

### 5. Auctions vs Carmunity positioning

- Web **metadata and hero** reinforce auctions first; Carmunity is supporting narrative.
- Mobile **navigation order** places Home and Forums before Auctions—aligned with desired direction.

### 6. Internal duplication / concepts to converge

- **“Showroom”** (web nav) vs **“Home”** (mobile) — same mental slot (entry), different metaphor.
- **`/explore`** vs **`/home`** — same feature (feed), different naming and URL.
- **`CommunityFeed`** component name vs product name **Carmunity**.
- **`app/(marketing)/community/leaderboard`** — “community” path vs Carmunity branding.

---

## Target brand & product identity

**Name:** **Carmunity by Carasta** (Carmunity = social layer; Carasta = trust, auctions, transactions).

**Pillars (primary → secondary):**

1. **Feed (Carmunity)** — posts, media, follows, discovery.
2. **Forums** — long-form threads by space/category; distinct from feed posts (matches Prisma comment on `ForumThread`).
3. **Garage / identity** — builds, collections, dream garage, profile reputation.
4. **Auctions** — live bidding, watchlists; **always reachable**, never hidden, but **not the homepage monopoly**.
5. **Create** — post, thread, share-link flows (mobile already has hub; web needs equivalent entry points).

**Tone:** Dark, premium, **high-performance automotive** (precision, metal, torque, shop lighting), **not** neon gamer, **not** beige classifieds, **not** “template auction site.”

---

## Target product model (unified IA)

### Primary pillars (both platforms)

| Pillar | User-facing name | Purpose |
|--------|------------------|---------|
| Home | **Carmunity** (lockup “by Carasta” where space allows) | Feed + lightweight discovery |
| Forums | **Forums** | Spaces → categories → threads |
| Create | **Create** | Composer entry (post / thread / link) |
| Auctions | **Auctions** | Search, detail, watch |
| You | **You** / **Profile** | Profile, garage, saved auctions, settings |

### Recommended top-level navigation

**Web (desktop):** Carmunity (feed) · Forums · Auctions · Garage¹ · Create² · You³  
**Web (mobile web):** Same five–six items in bottom bar **or** collapsible “More” if width constrained (match mobile app count where possible).

¹ *Garage:* surface as `/u/[handle]/garage` (exists) but **label and prominence** align with mobile “Garage.”  
² *Create:* web may start as **header CTA + `/explore` composer** until a dedicated `/create` route exists.  
³ *You:* session user → `/u/[handle]` or `/settings` cluster; align naming with app **You**.

**Mobile (already close to target):** Home · Forums · Create · Auctions · You — **keep**; ensure web converges **to this model**, not the reverse.

### How pillars relate

- **Carmunity (feed)** and **Forums** are siblings: feed = fast, graphy, media; forums = structured discussion. Cross-link: thread cards in feed (future), “Discuss in forums” on high-engagement posts.
- **Garage** hangs off **You** / profile (owner’s inventory of vehicles and story).
- **Auctions** cross-sell from feed (auction cards, mentions) but live in their own IA branch.
- **Create** is the **intent capture** hub so users do not hunt for “where to post.”

### Web-only vs app-only vs both

| Capability | Web | App | Notes |
|------------|-----|-----|--------|
| Feed | Both | Both | Unify API + card design |
| Forums browse/post | **Both (web missing UI)** | Both | Implement web against existing APIs |
| Auction bidding / condition reports | Both | Both | Visual parity later |
| Seller marketing dashboards | Web (rich) | Optional / minimal | Keep web-first |
| Admin | Web | No | Unchanged |
| Native media capture / push | App | App | Web uses mobile-friendly upload (already `carmunity` media API) |

---

## Shared design system direction (summary)

Full detail: **[CARMUNITY_DESIGN_SYSTEM_DIRECTION.md](./CARMUNITY_DESIGN_SYSTEM_DIRECTION.md)**.

**Decisions to make once (Phase B):**

- **Accent strategy:** Single **primary accent** for interactive emphasis + **secondary** for auction bid urgency (e.g. copper or amber for brand actions; controlled red only for bids/alerts), OR unify on one accent—**must pick** to resolve web red vs app copper split.
- **Typography:** One **display** family for marketing + headers (Oswald **or** a more geometric automotive face), one **UI** sans (Inter / similar on web = Flutter’s M3 scale with compatible weights).
- **Cards:** Shared rules for radius, border (`white/6–10%`), elevation (shadow vs flat), and **media aspect ratios** between `FeedPostCard` and web feed cards.

---

## Web / mobile alignment plan (concrete)

### A. Rename Community → Carmunity (copy + IA labels)

- Replace nav string **“Community”** with **“Carmunity”** everywhere it refers to the social product (not generic English “community”).
- **`/explore`:** Keep URL initially for **SEO and bookmarks**, add **`/carmunity`** as canonical social hub with **308 redirect** from `/explore` once the new page ships (or reverse: rename in-place first, add redirect later—pick one in Phase A and avoid changing twice).
- Explore page H1/subcopy: **Carmunity** + one-line value prop (gearheads/builders), not “Community.”
- **`app/(marketing)/community/*`:** Rename route segment to **`carmunity`** or **`carmunity/leaderboard`** and redirect old URLs.

### B. Forums on the website

- Add **`app/(marketing)/carmunity/forums`** (or `/forums` at root marketing if shorter) implementing:
  - Spaces list → `GET /api/forums/spaces`
  - Space detail → existing slug route pattern (mirror mobile `ForumRepository`)
  - Category threads + thread detail + replies (read path first; compose can reuse patterns from explore post form or server actions)
- Add **Forums** to `CarastaLayout` app nav, `AppSidebar`, and bottom nav (replace or reconcile **Merch**—either move Merch under You/Shop or keep as sixth item on web only with explicit rationale).

### C. Feed evolution (both)

- **Tab parity:** Add **Latest** on web when `GET /api/explore/feed` (or unified endpoint) supports `tab=latest` with `orderBy: createdAt desc`; mobile already documents the gap—fix **once** at API layer, then both clients consume.
- **Unify data access:** Prefer **`/api/carmunity/posts`** as the canonical feed read for both (deprecate duplicate logic in `/api/explore/feed` or make it a thin wrapper) to reduce drift.
- **Card UX:** Spec a **single feed card contract** (avatar row, media, body truncation, actions row, comment affordance) implemented as **web component** + **Flutter widget** with the same information hierarchy (see design system doc).

### D. Profile / Garage

- Web **`/u/[handle]`**: align section titles and visuals with app **You** (tabs: Posts / Garage / Auctions activity if applicable).
- Mobile **Garage placeholder**: plan web/mobile **shared empty states** and eventual feature parity (no implementation in this phase).

### E. Auctions secondary but integrated

- **Home (`/`):** Rebalance layout: **Carmunity strip** (feed preview or featured posts) **above the fold** with auctions as secondary module, **or** a **tabbed** landing “Carmunity | Auctions” (decision in Phase C to avoid layout thrash).
- Keep auction strength in **`/auctions`** and listing cards—update **visual system** to match new tokens (Phase F).

### F. Exact match vs platform-adapted patterns

| Pattern | Match exactly | Adapt |
|---------|---------------|--------|
| Brand lockup, names, IA order | Yes | — |
| Corner radius, border, type scale | Yes (token-level) | — |
| Navigation control | — | Web: top + sidebar; Mobile: bar/rail |
| Composer | Conceptual parity | Web modal/drawer; Mobile full screen |
| Motion | Same philosophy (subtle) | Web framer-motion vs Flutter implicit |

---

## Phased implementation roadmap (minimize backtracking)

### Phase A — Naming + IA alignment (foundation)

**Goal:** One vocabulary and one nav story before pixels move.

**Tasks:**

- Replace **Community** strings with **Carmunity** in layout/nav/explore; add **Carmunity by Carasta** where appropriate (footer, meta, explore).
- Introduce **Forums** link in web nav (can point to a **minimal index** placeholder that lists spaces if full UI not ready—prefer **read-only list** over dead link).
- Decide canonical social URL (**`/carmunity`** recommended) and plan redirects from **`/explore`** and **`/community/*`**.
- Update `metadata` in `app/layout.tsx` to social-first **subtitle** (auctions still in description).

**Exit criteria:** No user-facing “Community” for the Carmunity product; nav labels match pillar model.

### Phase B — Shared visual system / tokens

**Goal:** One accent philosophy + shared radii/spacing.

**Tasks:**

- Document tokens in `CARMUNITY_DESIGN_SYSTEM_DIRECTION.md` (source of truth).
- Implement **CSS variables** on web; mirror in **`AppColors` / `AppSpacing` / `AppTypography`** on Flutter.
- Resolve **red vs copper** (hybrid allowed with roles).

**Exit criteria:** Feed card restyle can proceed without re-debating colors.

### Phase C — Web Carmunity hub + feed redesign

**Goal:** `/carmunity` (or upgraded `/explore`) feels like mobile Home.

**Tasks:**

- Layout: composer, feed list, **three tabs** when API ready.
- Rebuild feed item as **premium card** (not default shadcn card).
- Optional: embed **“trending threads”** sidebar on desktop.

**Exit criteria:** Side-by-side with Flutter Home, same hierarchy and density class.

### Phase D — Forums surfaced on web (full read path + posting)

**Goal:** Feature parity for discovery and participation.

**Tasks:**

- Marketing routes for spaces/categories/threads/replies; SSR where useful for SEO.
- Wire to existing **`app/api/forums/*`**.
- Deep links aligned with app routes (`/forums/...`) for future universal links.

**Exit criteria:** User can browse and reply on web without touching admin tools.

### Phase E — Profile + Garage redesign (both)

**Goal:** You / profile feels like one identity system.

**Tasks:**

- Web profile template: header, stats, tabs, garage grid—match Flutter structure.
- Shared **empty states** and **loading skeletons** per design system.

### Phase F — Auction surface visual alignment

**Goal:** Auctions feel part of Carmunity, not a different startup.

**Tasks:**

- `AuctionCard`, `ShowroomHero`, reserve meter: apply tokens; tune **copy** (“Market” vs “Showroom” language audit).
- Home page module order after Phase C decision.

### Phase G — Polish: motion, responsiveness, a11y

**Goal:** Premium finish.

**Tasks:**

- Motion budget (200–300ms, reduced motion respect).
- Keyboard/focus for feed and forums.
- Large screen max-widths consistent with `carasta-container`.

---

## Concrete next recommended build step

**Execute Phase A (Naming + IA alignment)** as the first engineering slice:

1. Update **`CarastaLayout`**, **`AppSidebar`**, **`MobileBottomNav`**, and **`nav.tsx`**: “Community” → **“Carmunity”**; ensure Merch/sidebar inconsistency is **documented and either fixed (add to sidebar) or intentionally removed** from one surface.
2. Update **`app/(marketing)/explore/page.tsx`** headings and body copy to **Carmunity**; consider subheading **“by Carasta”**.
3. Update **root metadata** in `app/layout.tsx` to reflect **social-first** positioning (auctions secondary in title/description).
4. Add a **stub or read-only Forums** route + nav entry so IA is honest before Phase D UI depth.

This ordering avoids painting new components twice and aligns all copy before token and card refactors.

---

## Appendix: Key files for implementation

| Domain | Files / areas |
|--------|----------------|
| Web chrome | `components/carasta/CarastaLayout.tsx`, `components/layout/AppSidebar.tsx`, `components/layout/MobileBottomNav.tsx`, `components/layout/nav.tsx` |
| Web feed | `app/(marketing)/explore/page.tsx`, `app/(marketing)/explore/community-feed.tsx`, `app/api/explore/feed/route.ts`, `app/api/carmunity/posts/route.ts` |
| Web theme | `app/globals.css`, `styles/carasta.css`, `tailwind.config.ts` |
| Forums API | `app/api/forums/**` |
| Schema | `prisma/schema.prisma` (`ForumSpace`, `Post`, etc.) |
| Flutter shell | `carmunity_app/lib/app/widgets/app_shell.dart`, `carmunity_app/lib/app/router/app_router.dart` |
| Flutter theme | `carmunity_app/lib/app/theme/app_colors.dart`, `app_theme.dart`, `app_typography.dart` |
| Flutter feed | `carmunity_app/lib/features/home/presentation/home_screen.dart`, `widgets/feed_post_card.dart` |

---

## Document control

| Version | Date | Notes |
|---------|------|--------|
| 1.0 | 2026-04-18 | Initial audit + phased plan from repository inspection |
