# Marketing Management — Implementation Plan (Audit)

This document records a **read-only audit** of the Carasta repo and a **safe, incremental** path to add Marketing Management. No subsystem was built during this phase; **no code or schema migrations were applied** as part of this audit.

---

## 1. Executive Summary

Carasta is a **Next.js App Router** app with a **global shell** (`CarastaLayout` + `AppSidebar` + `MobileBottomNav`), **Prisma/PostgreSQL**, and **NextAuth** (JWT sessions). Auctions and bids are the core commerce domain; **“Community”** in the UI is the explore feed built on `Post` / `Like` / `Comment`. There is **no separate “manager” role**—only `Role.USER` and `Role.ADMIN`; seller-facing tools should follow **ownership checks** (same pattern as `/u/[handle]/listings`).

**Recommended approach:** Add Marketing as **seller-scoped routes** under `app/(app)/u/[handle]/marketing/*`, link from the **profile** (owner-only) and optionally from **auction detail** for the listing owner. Persist **additive** Prisma models for traffic and rollups/campaigns; ingest via **new API route(s)** or **server actions**, keeping **existing auction bid/sell paths untouched**. Align new model naming with existing conventions (`PascalCase` models, `camelCase` fields, `cuid()` IDs, `Json?` for flexible payloads where appropriate).

---

## 2. Current Architecture Summary

### 2.1 App / router structure

| Area | Path / pattern | Notes |
|------|----------------|--------|
| Route groups | `app/(marketing/*)`, `app/(app/*)`, `app/(auth/*)`, `app/(admin/*)` | Groups do not affect URLs; they organize layouts and concerns. |
| Root layout | `app/layout.tsx` | Wraps everything in `Providers` + `CarastaLayout`. |
| Public marketing | `/`, `/how-it-works`, `/contact`, `/terms`, `/privacy`, `/merch`, `/auctions`, `/auctions/[id]`, `/explore`, `/community/leaderboard` | Auction detail and explore are under `(marketing)` but are core product surfaces. |
| Authenticated “app” | `/settings`, `/sell`, `/u/[handle]`, `/u/[handle]/garage`, `/dream`, `/garage`, listings | Seller listing management: `/u/[handle]/listings` (owner-only via server check). |
| Admin | `/admin`, `/admin/reputation/[handle]` | Protected by `middleware.ts` (`role === ADMIN`). |
| API | `app/api/*` | e.g. `auth`, `auctions/[id]`, `notifications`, `activity-feed`, `explore/*`, `contact`. |

### 2.2 Dashboard / user account structure

- **There is no dedicated “dashboard” route tree.** The closest equivalents:
  - **Profile hub:** `app/(app)/u/[handle]/page.tsx` — stats, links to Garage, Dream, Listings.
  - **Listings management:** `app/(app)/u/[handle]/listings/page.tsx` — filters, cards linking to `/auctions/[id]`.
  - **Settings:** `app/(app)/settings/page.tsx` — profile and social URLs; protected by middleware.
- **Header account menu** (`components/carasta/CarastaLayout.tsx`): Profile (`/u/{handle}`), Settings, Admin (if `ADMIN`), Sign out.
- **Sidebar** (`components/layout/AppSidebar.tsx`): Showroom, Auctions, Community, Sell, Garage (to user garage or sign-in), Merch.

### 2.3 Auction domain

- **Model:** `Auction` in `prisma/schema.prisma` — `status` is a **string** (`DRAFT` | `LIVE` | `SOLD` | `ENDED`), relations to `Bid`, `AutoBid`, `AuctionImage`, `AuctionDamageImage`, `AuctionFeedback`, seller/buyer `User`.
- **Listing creation:** `app/(app)/sell/actions.ts` — `createAuction`, `saveAuctionDraft` (transactions).
- **Bidding / buy-now / auto-bid / feedback:** `app/(marketing)/auctions/actions.ts` — delegates to `lib/auction-utils.ts` and reputation helpers.
- **Detail page:** `app/(marketing)/auctions/[id]/page.tsx` — server component; loads auction; **DRAFT** hidden except to seller; uses `AuctionDetailClient` for live bidding UI.
- **Public auction JSON:** `app/api/auctions/[id]/route.ts` — bid/high/reserve/buy-now fields for polling.

### 2.4 Community / “Carmunity” / social posts

- **UI label:** “Community” → `/explore`.
- **Models:** `Post`, `Like`, `Comment`, `Follow` (see schema).
- **Mutations:** `app/(marketing)/explore/actions.ts` — `createPost`, `likePost`, `unlikePost`, `addComment` (also triggers `broadcastActivityEvent` for `new_comment`).
- **Feed API:** `app/api/explore/feed/route.ts` (referenced in codebase layout).
- **Posts today** are not linked to `auctionId`; any “promote this listing to the feed” feature would be an **additive** extension (optional FK or `meta` JSON), not assumed existing.

### 2.5 Authentication and roles / permissions

- **Config:** `lib/auth.ts` — NextAuth with Prisma adapter, JWT strategy; Google + credentials; `handle` and `role` on JWT/session.
- **Roles:** `enum Role { USER, ADMIN }` only.
- **Middleware:** `middleware.ts` — `withAuth`; `/admin/*` requires `ADMIN`; `/settings` requires auth; **all other routes pass through** (including `/sell`, `/u/*` — those rely on page-level `getSession()` / `redirect` / `notFound()`).
- **Authorization pattern for sellers:** compare `(session.user as any).id` to `auction.sellerId` or `user.id` on listing pages.

### 2.6 Database schema / Prisma models (relevant subset)

- **User-centric:** `User`, `Account`, `Session`, `Follow`, social fields on `User`.
- **Community:** `Post`, `Like`, `Comment`.
- **Garage:** `GarageCar`, `GarageCarImage`.
- **Auctions:** `Auction`, images, damage images, `Bid`, `AutoBid`, `AuctionFeedback`.
- **Notifications:** `Notification` (`type` string + `payloadJson`); **list/unread API exists**; **no in-repo writers** were found in the audit grep—plan for marketing alerts may need **new writers** later.
- **Reputation:** `ReputationEvent` and counters on `User` — **trust metrics**, not marketing analytics.

### 2.7 API routes / server actions / service layer

- **Server actions:** Colocated under routes (e.g. `explore/actions.ts`, `auctions/actions.ts`, `sell/actions.ts`, `settings/actions.ts`, `garage/actions.ts`) with `"use server"`.
- **Services:** Logic concentrated in `lib/auction-utils.ts`, `lib/auction-metrics.ts`, `lib/reputation.ts`, `lib/pusher.ts`, etc. **No separate `services/` folder** — follow `lib/*` for new marketing logic.
- **Real-time:** `lib/pusher.ts` + `lib/activity-emitter.ts` + SSE `app/api/activity-feed/route.ts` for **public activity feed** (`ActivityEvent` types in `lib/activity-types.ts`: `new_bid`, `new_comment`, `ending_soon`).

### 2.8 Analytics, tracking, watchlist, favorites, notifications

| Capability | Status in repo |
|------------|----------------|
| **Product analytics (seller)** | **Not present**; admin home aggregates counts/volume in `app/(admin)/admin/page.tsx` only. |
| **Traffic / UTM / funnel** | **Not present** in schema or routes. |
| **Watchlist / favorites** | **Not in Prisma**; copy on `/how-it-works` mentions watchlist—**no implemented model** found. |
| **Notifications** | Model + `GET` list/count APIs + `NotificationDropdown` + `markAllNotificationsRead`; **creation paths not located** in this audit. |
| **Share** | `components/ui/share-buttons.tsx` on auction detail — client-side share URLs + copy link; **no persistence** of share events. |

### 2.9 UI component patterns

- **Styling:** Tailwind; dark “cyber-luxury” shell; `font-display` headings; accent `#ff3b5c`; cards `rounded-2xl border border-white/10 bg-white/5` (common on profile/listings).
- **Primitives:** `components/ui/*` (shadcn-style: `Button`, `Card`, `DropdownMenu`, `Input`, etc.).
- **Motion:** `framer-motion` in layout/sidebar.
- **Domain UI:** `components/auction/*`, `components/reputation/*`, `components/profile/*`.

### 2.10 Layout / navigation / sidebar

- **Global:** `CarastaLayout` — header links (marketing + app nav), `AppSidebar`, `main`, `MobileBottomNav`, footer.
- **Nav sources of truth:** `mainNav` in `AppSidebar.tsx`, `navItems` in `MobileBottomNav.tsx`, parallel arrays in `CarastaLayout` (`marketingNav`, `appNav`). **Any new top-level nav item requires updating multiple files** if it should appear everywhere.

---

## 3. Safe Extension Points

| Extension | Recommendation | Why it’s safe |
|-----------|----------------|---------------|
| **Seller marketing “home”** | `app/(app)/u/[handle]/marketing/page.tsx` (+ nested routes as needed) | Mirrors `listings/page.tsx`: `notFound()` unless `session` user matches profile; no change to auction engine. |
| **Nav entry for owners** | `app/(app)/u/[handle]/page.tsx` — button row next to Garage / Listings | Conditional `isOwnProfile` already exists; single-page edit. |
| **Optional header link** | `DropdownMenu` in `CarastaLayout.tsx`: “Marketing” → `/u/{handle}/marketing` | Additive; only for signed-in users with `handle`. |
| **Auction-level entry** | `app/(marketing)/auctions/[id]/page.tsx`: when `currentUserId === auction.sellerId` and status allows, show link “Listing insights” or small tab strip | Server component already has `session` and `auction`; pass flag into a thin client wrapper if needed. |
| **Persistence** | New Prisma models + `lib/marketing-*.ts` helpers | Additive migrations; no renames of existing models. |
| **Ingestion** | `app/api/marketing/*` (e.g. `track` POST) or server action from a tiny client hook | Keeps bidding code paths isolated; rate-limit and validate `auctionId` + optional auth. |
| **Rollups** | Cron/scheduled job or on-read aggregation (phase 2+) | Can start with **on-the-fly** queries from `TrafficEvent` for low volume; add `AuctionAnalytics` when needed. |

**Reuse existing models:**

- `Auction` (required FK for auction-scoped metrics).
- `User` (seller `sellerId`; optional `userId` on events when viewer is logged in).
- `Post` / `Comment` / `Like` — future “promote to community” can reference listing in copy or add optional FK later.

---

## 4. Risks / Fragile Areas To Avoid (Unless Necessary)

| Area | Risk | Guidance |
|------|------|----------|
| `lib/auction-utils.ts` / `placeBidAndProcess` | **High** — core money/bid logic | Do not inject tracking or marketing side effects here until design is explicit; prefer separate API called from UI. |
| `app/(marketing)/auctions/actions.ts` | **High** — same | Avoid adding nonessential DB writes to bid/buy-now paths. |
| `prisma/schema.prisma` + migrations | **Medium/high** if rushed | Additive only; review indexes; avoid changing `Auction` columns without strong reason. |
| `middleware.ts` | **Medium** | Narrow matcher; over-broad auth on `/u/*` could break public profile intent (profiles are public today). Prefer page-level guards for seller-only marketing. |
| `CarastaLayout.tsx` / `AppSidebar.tsx` | **Medium** | Easy to over-clutter global nav; prefer profile + owner dropdown first. |
| `ShareButtons` | **Low** | Extend with optional `onShare` callback or wrapper component rather than breaking props contract. |
| **High-write traffic table** | **Operational** | Raw `TrafficEvent` inserts can explode; plan sampling, batched rollups, or edge pipeline before production scale. |

---

## 5. Proposed New Routes

All routes are **proposed**; none exist yet.

| Route | Purpose | Access |
|-------|---------|--------|
| `/u/[handle]/marketing` | Seller marketing dashboard (overview, links to listing tools) | Owner only (`session.user.id === user.id`), same as listings. |
| `/u/[handle]/marketing/auctions/[auctionId]` | Auction-level marketing detail (traffic, shares, campaign attribution) | Owner + owns `auctionId`. |
| `/u/[handle]/marketing/campaigns` | Campaign list / create (phase 2+) | Owner only. |
| `/u/[handle]/marketing/campaigns/[campaignId]` | Campaign detail | Owner only. |

**Optional** (if you prefer flatter URLs): `/marketing` redirecting to `/u/{session.handle}/marketing` — adds redirect logic and duplicate SEO surface; **nested under `/u/[handle]` is consistent with existing listings/garage.**

---

## 6. Proposed New Prisma Models (Additive — Not Migrated Yet)

Align with existing style: **`@id @default(cuid())`**, **`DateTime`**, **`Json?`** for flexible metadata, **`@@index`** for query paths. `Auction.status` uses **strings**; new enums are optional—using **string `status`** on `Campaign` matches `Auction` flexibility.

### 6.1 `TrafficEvent` (proposed)

Raw events for **views, share clicks, outbound referrals** (Privacy: avoid storing raw PII; use hashed `visitorKey` or session id).

- `id`, `auctionId`, `eventType` (e.g. `PAGE_VIEW`, `SHARE_COPY`, `SHARE_PLATFORM`)
- `visitorKey` (optional string), `userId` (optional)
- UTM: `utmSource`, `utmMedium`, `utmCampaign` (nullable strings) or single `referrer` + `meta` Json
- `createdAt`
- Relations: `Auction`, optional `User`
- Indexes: `[auctionId, createdAt]`, `[auctionId, eventType]`

### 6.2 `AuctionAnalytics` (proposed rollup)

Optional **materialized daily (or hourly) bucket** per auction to avoid scanning raw events in UI.

- `id`, `auctionId`, `bucketDate` (`DateTime` date-only UTC)
- Counters: e.g. `viewCount`, `uniqueVisitorEstimate`, `shareActionCount` (names can match your product language)
- `updatedAt`
- `@@unique([auctionId, bucketDate])`

**Note:** Phase 1 can **omit** this table and aggregate from `TrafficEvent` until volume demands rollups.

### 6.3 `Campaign` (proposed)

- `id`, `sellerId`, `name`, `status` (`DRAFT` | `ACTIVE` | `PAUSED` | `ENDED`)
- `auctionId` optional (primary listing)
- `utmCampaign` optional (align with inbound tracking)
- `startsAt`, `endsAt` optional
- `createdAt`, `updatedAt`
- Relations: `User`, optional `Auction`

### 6.4 `CampaignEvent` (proposed audit log)

- `id`, `campaignId`, `type` (e.g. `CREATED`, `LINK_COPIED`, `NOTES_UPDATED`)
- `meta` `Json?`, `createdAt`
- Relation: `Campaign`

### 6.5 Optional: `MarketingAsset` (defer)

Use only if you need **DB-backed** creative (image URLs, copy variants). Otherwise store assets in blob storage + URL on `Campaign.meta` for v1.

### 6.6 Naming alignment

The schema uses names like `AuctionDamageImage`, `ReputationEvent`. **`TrafficEvent`** is clear; if “traffic” is too narrow later, **`MarketingEvent`** is an alternative—pick one to avoid rename migrations.

---

## 7. Proposed New Services / API Endpoints

| Piece | Responsibility |
|-------|----------------|
| `lib/marketing-tracking.ts` (or similar) | Validate auction ownership for seller endpoints; normalize UTM params; hashing helper for `visitorKey`. |
| `lib/marketing-analytics.ts` | Read paths: summarize per auction, date range; optionally refresh rollups. |
| `POST /api/marketing/track` (or `/api/auctions/[id]/track`) | Accept event type + auction id + optional UTM; **public** for `PAGE_VIEW` with bot filtering later; rate limit. |
| `GET /api/marketing/auctions/[auctionId]/summary` | Seller-only: aggregates for dashboard (or use server components + prisma directly). |
| Server actions `app/(app)/u/[handle]/marketing/actions.ts` | Create/pause campaign, fetch dashboard data (keeps pattern with rest of app). |

**Attribution:** When `Campaign` exists, generated links can append `utm_*` matching `Campaign.utmCampaign`; `TrafficEvent` stores parsed params.

---

## 8. Proposed UI Components

| Component | Role |
|-----------|------|
| `MarketingDashboardShell` | Layout under `/u/[handle]/marketing` — title, tabs (Overview, Listings, Campaigns). |
| `MarketingOverviewCards` | Reuse stat card pattern from admin page (`border-white/10 bg-white/5`). |
| `AuctionMarketingSummary` | Embeddable strip on auction detail for sellers or full subpage. |
| `SellerAuctionInsightsLink` | Small CTA linking to `/u/[handle]/marketing/auctions/[id]`. |
| Extend or wrap `ShareButtons` | Fire `track` on copy/share (client-side) with debounce. |

Use existing **`Card`**, **`Button`**, **`Tabs`** (if present in `components/ui`) — verify `tabs` exists before importing.

---

## 9. Recommended Build Order

1. **Schema (additive)** — `TrafficEvent` (+ optional `AuctionAnalytics`, `Campaign`, `CampaignEvent`); migrate in staging; generate client.
2. **Read path proof** — owner-only page at `/u/[handle]/marketing` with **stub stats** (zeros) and listing table reusing queries similar to listings page.
3. **Write path** — `POST` track endpoint + minimal client call from auction detail page view (respect privacy; document behavior).
4. **Seller UX** — profile button + optional auction detail CTA; optional header dropdown link.
5. **Campaigns** — CRUD after events prove stable; link UTM generation to `ShareButtons` or dedicated “Copy tracking link”.
6. **Carmunity hooks** — optional `Post` association or “suggested copy” modal; **after** core tracking works.
7. **Rollups / performance** — `AuctionAnalytics` + nightly job or incremental updater when row counts hurt queries.

---

## 10. Rollback / Safety Notes

- **Feature flag** (env e.g. `MARKETING_V1_ENABLED`) around nav links and tracking script—**optional** but helpful for staged rollout.
- **Migrations:** keep new tables **isolated**; rollback = drop new tables via down migration in dev/staging only (coordinate with any data you care about).
- **API:** abusive traffic to `track` can be mitigated with rate limits (middleware or edge config)—plan before exposing publicly.
- **Do not** block page render on tracking failures; use `sendBeacon` / fire-and-forget patterns client-side.
- **Admin vs seller:** marketing dashboards belong **seller-side** under `/u/...`; avoid widening `/admin` unless building platform-wide marketing ops.

---

## 11. File-by-File Change Map (Future Work)

### Files to **create** (estimated risk: **low** unless noted)

| File | Why | Risk |
|------|-----|------|
| `app/(app)/u/[handle]/marketing/page.tsx` | Dashboard entry | Low |
| `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` | Auction insights | Low |
| `app/(app)/u/[handle]/marketing/actions.ts` | Server actions for campaigns/summary | Low–medium |
| `lib/marketing-tracking.ts`, `lib/marketing-analytics.ts` | Shared logic | Low |
| `app/api/marketing/track/route.ts` (or under `api/auctions/...`) | Ingest | Medium (abuse, validation) |
| `components/marketing/*` | UI | Low |
| `prisma/migrations/*` | New tables | Medium (DB) |

### Files to **modify** (risk noted)

| File | Why | Risk |
|------|-----|------|
| `prisma/schema.prisma` | New models + relations | Medium |
| `app/(app)/u/[handle]/page.tsx` | Add “Marketing” button for `isOwnProfile` | Low |
| `app/(marketing)/auctions/[id]/page.tsx` | Seller CTA / pass props for insights | Low |
| `components/ui/share-buttons.tsx` or wrapper | Optional tracking callback | Low |
| `components/carasta/CarastaLayout.tsx` | Optional nav item in user dropdown | Low–medium (UX clutter) |
| `components/layout/AppSidebar.tsx` | **Avoid** unless product requires global entry | Medium |
| `middleware.ts` | **Avoid** extending matcher for `/u/*` marketing | Medium–high |

---

## 12. Phase 0 (Audit) — Setup Changes Made

Only this document was added initially: `MARKETING_IMPLEMENTATION_PLAN.md`.

---

## 12b. Phase 1 — Marketing Foundation (implemented)

**Goal:** Feature flag, additive Prisma models, owner-only marketing dashboard shell, read-only lib helpers, contextual nav — **no** tracking ingestion, **no** auction/bid/community logic changes.

**Implemented:**

- **Feature flag:** `MARKETING_ENABLED` — must be exactly `"true"` to expose UI and the marketing route (see `lib/marketing/feature-flag.ts`). Documented in `.env.example`.
- **Prisma (additive):** `TrafficEvent`, `Campaign`, `CampaignEvent` plus enums `MarketingTrafficEventType`, `MarketingTrafficSource`, `MarketingCampaignStatus`. Relations on `User` (`trafficEventsAsViewer`, `marketingCampaigns`) and `Auction` (`trafficEvents`, `marketingCampaigns`).
- **Migration:** `20260330120000_add_marketing_foundation` (`prisma/migrations/20260330120000_add_marketing_foundation/migration.sql`).
- **Route:** `app/(app)/u/[handle]/marketing/page.tsx` — `notFound()` if flag off, profile not found, or non-owner (same pattern as listings).
- **Read layer:** `lib/marketing/get-seller-marketing-overview.ts`, auction row/detail helpers (see Phase 3).
- **Navigation:** Marketing link on own profile (`app/(app)/u/[handle]/page.tsx`) and on My Listings header (`app/(app)/u/[handle]/listings/page.tsx`) when flag enabled; listings page remains owner-only so the link is seller-context only.

**Deviations from earlier plan sketch:**

- No `AuctionAnalytics` rollup table in this PR (explicitly out of scope for foundation).
- `Campaign.type` is **String** (flexible, consistent with `Auction.status` string style for product iteration).
- **`migration_lock.toml`** added under `prisma/migrations/` so Prisma can resolve the migrations provider (folder had SQL migrations but no lock file).

**Lightweight notes:** `MARKETING_PHASE_1_NOTES.md` (env, deploy, PR2 hint).

**Next step after Phase 1:** Implemented as Phase 2 (below).

---

## 12c. Phase 2 — Passive marketing ingestion (implemented)

**Goal:** `TrafficEvent` writes for **VIEW** and **SHARE_CLICK** only, isolated **POST** API, client **sendBeacon** / **fetch keepalive**, **no** changes to bid/buy-now/community server actions.

**Implemented:**

- **Endpoint:** `POST /api/marketing/track` (`app/api/marketing/track/route.ts`) — gated by `MARKETING_ENABLED` (returns **204** with no body when disabled). Validates body with Zod (`lib/validations/marketing.ts`); requires known `auctionId` (invalid/unknown id returns **400** `{ ok: false }` to avoid enumeration). Resolves `userId` from JWT when present; supports anonymous events. Generic error responses only.
- **Server insert + dedupe:** `lib/marketing/track-marketing-event-server.ts` — **VIEW:** skip if duplicate within **60s** for same `(auctionId, userId)` or same `(auctionId, visitorKey)` in metadata for anonymous. **SHARE_CLICK:** skip within **5s** for same `(auctionId, userId, shareTarget)` or anonymous with matching `visitorKey` in metadata.
- **Source inference:** `lib/marketing/resolve-marketing-source.ts` — optional `utm_source` / referrer host mapping into `MarketingTrafficSource`; otherwise **UNKNOWN**.
- **Metadata:** `lib/marketing/sanitize-marketing-metadata.ts` — only small string keys (`path`, `referrer`, `shareTarget`, `currentUrl`, `visitorKey`).
- **Client:** `lib/marketing/send-marketing-track.ts` + `getOrCreateMarketingVisitorKey()` (sessionStorage). `components/marketing/auction-view-tracker.tsx` — one **VIEW** per mount when flag on. `components/ui/share-buttons.tsx` — optional `auctionId` + `trackMarketing`; emits **SHARE_CLICK** for twitter / facebook / linkedin / copy_link on deliberate action only.
- **Wiring:** `app/(marketing)/auctions/[id]/page.tsx` — mounts tracker and passes share props only when `isMarketingEnabled()`.

**Limitations (documented):**

- Dedupe is **database-window** scoped (not distributed Redis); adequate for current scale.
- Anonymous users without `visitorKey` get **no VIEW dedupe** on server (client still sends key when storage works).
- No IP-based rate limiting in this PR.

**Notes:** `MARKETING_PHASE_2_NOTES.md`.

**Next step after Phase 2:** Implemented as Phase 3 (below).

---

## 12d. Phase 3 — Seller metrics + auction drill-down (implemented)

**Goal:** Read-only analytics for sellers from **`TrafficEvent`**, no rollups, no auction/bid/community logic changes.

**Implemented:**

- **Read layer:** `get-seller-marketing-overview.ts` — adds **totalViews**, **totalShareClicks** (seller-scoped). `get-seller-marketing-auction-rows.ts` — up to **100** listings with **totalViews**, **totalShareClicks**, **lastMarketingActivityAt** via Prisma `groupBy`. `get-seller-marketing-auction-detail.ts` — per-auction metrics, source/event breakdowns, **shareTarget** counts (capped sample), **50** recent events. `marketing-display.ts` — seller-facing labels and date formatting.
- **Overview:** `app/(app)/u/[handle]/marketing/page.tsx` — six KPI cards (listings, live, events, campaigns, views, share clicks); listing cards show per-auction stats + **View marketing** → drill-down.
- **Drill-down:** `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` — same owner + flag guards; verifies **auction.sellerId === user.id** in the read helper (page uses `notFound()` if null). KPIs, source & event-type bars (CSS), optional share-target breakdown, recent activity table.
- **Removed:** `get-seller-marketing-listings.ts` (replaced by auction rows).

**Ownership:** Both routes: `MARKETING_ENABLED`, session user **must** own `handle`; drill-down additionally requires auction belong to that seller (no cross-seller `auctionId` leakage).

**Limitations:** Metrics are **live queries** on `TrafficEvent` (no materialized rollups). Share-target distribution uses the **latest 3,000** `SHARE_CLICK` rows per auction for aggregation. High volume may need PR4 rollups / archives.

**Notes:** `MARKETING_PHASE_3_NOTES.md`.

**Next step after Phase 3:** Implemented as Phase 4 (below) for share tools; rollups/campaigns remain a later phase.

---

## 12e. Phase 4 — Share & Promote tools (implemented)

**Goal:** Seller-only **Share & Promote** kit on the auction marketing drill-down: deterministic copy, **UTM-tracked** public links aligned with Phase 2 inference, copy-to-clipboard UX — **no** persistence, **no** campaign CRUD, **no** social automation.

**Implemented:**

- **`lib/marketing/site-origin.ts`** — `getPublicSiteOrigin()` from `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, `VERCEL_URL`, or localhost fallback.
- **`lib/marketing/build-marketing-links.ts`** — `buildMarketingLinkKit(auctionId)` / `buildTrackedAuctionUrl` with `utm_source` ∈ `instagram` | `facebook` | `linkedin` | `email` | `carmunity`, `utm_medium` (`social` | `email` | `community`), `utm_campaign=listing_{id}`. Default listing URL has **no** query string.
- **`lib/marketing/generate-share-copy.ts`** — `generateSellerShareCopy` → short/long/ending-soon captions, email subject/body, hashtags line, keywords line (from title, Y/M/M, trim, mileage, end date, **LIVE** high bid when bids exist).
- **`get-seller-marketing-auction-detail.ts`** — extended auction payload: `year`, `make`, `model`, `trim`, `mileage`, `highBidCents` (from top bid) for copy generation only.
- **UI:** `components/marketing/share-and-promote-panel.tsx`, `marketing-link-copy-row.tsx`, `marketing-text-copy-block.tsx`, `marketing-copy-button.tsx` (toasts via existing `useToast`).
- **Page:** `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` — **Share & Promote** section after KPIs.
- **`.env.example`** — optional `NEXT_PUBLIC_SITE_URL`.

**Limitations (historical):** LinkedIn UTM/referrer was Unknown until **Phase 6** added `LINKEDIN` + parsing. Copy is **generated on read**, not stored.

**Notes:** `MARKETING_PHASE_4_NOTES.md`.

**Next recommended step (PR 5):** Implemented as Phase 5 (below).

---

## 12f. Phase 5 — Campaign management CRUD (implemented)

**Goal:** Seller-only **Campaign** create/read/update/delete tied to **seller-owned auctions**, surfaced on marketing overview and auction drill-down — **manual** org layer only; no automation, no outbound messaging, no changes to bids/buy-now/community/share ingestion core.

**Implemented:**

- **`lib/validations/campaign.ts`** — type/status/form validation; optional `startAt`/`endAt` with `endAt > startAt` when both set.
- **`lib/marketing/get-seller-campaigns.ts`** — recent campaigns, all campaigns, per-auction campaigns, auction options for forms, single campaign for edit (all ownership-scoped).
- **`app/(app)/u/[handle]/marketing/campaigns/actions.ts`** — `createMarketingCampaign`, `updateMarketingCampaign`, `deleteMarketingCampaign` with `MARKETING_ENABLED` + handle owner + auction/campaign ownership checks.
- **UI:** `components/marketing/campaign-form.tsx`, `campaign-status-badge.tsx`, `campaign-type-label.tsx`, `campaign-delete-button.tsx`.
- **Routes:** `/u/[handle]/marketing/campaigns`, `/new`, `/[campaignId]/edit`; overview and auction drill-down show campaign summaries + links.

**Schema:** Unchanged — existing `Campaign` + `MarketingCampaignStatus` (`DRAFT`, `ACTIVE`, `PAUSED`, `ENDED`); UI labels **ENDED** as **Completed**.

**Notes:** `MARKETING_PHASE_5_NOTES.md`.

**Next recommended step (PR 6):** Implemented as Phase 6 (below).

---

## 12g. Phase 6 — Analytics rollups + hardening (implemented)

**Goal:** **AuctionAnalytics** daily rollups for **VIEW** / **SHARE_CLICK**, incremental updates on ingest, idempotent SQL backfill, hybrid reads (rollups for headline totals; **TrafficEvent** for breakdowns, recent activity, time-window counts). Conservative **retention/prune** helpers (manual, gated). **LinkedIn** `MarketingTrafficSource` + UTM/referrer mapping. Dedupe uses JSON path filters + trimmed **visitorKey**. No cron, no auction/bid/campaign UI rewrites.

**Implemented:**

- **Schema:** `AuctionAnalytics` (`@@unique([auctionId, day])`, UTC calendar `day` `@db.Date`); enum `MarketingTrafficSource.LINKEDIN`.
- **Migration:** `20260330200000_marketing_auction_analytics_rollup`.
- **Rollups:** `lib/marketing/increment-auction-analytics-rollup.ts` (after each persisted VIEW/SHARE_CLICK; failures logged, ingest succeeds), `lib/marketing/backfill-auction-analytics.ts`, `lib/marketing/utc-marketing-day.ts`.
- **Reads:** `lib/marketing/get-view-share-totals.ts` — prefers rollup sums when any rollup row exists for an auction else raw counts; used by overview KPIs, auction table rows, drill-down headline totals. `viewsLast24h` / `viewsLast7d` still from **TrafficEvent**.
- **Retention:** `lib/marketing/prune-traffic-events.ts`, `scripts/prune-traffic-events.ts` (`TRAFFIC_EVENT_PRUNE_ENABLED` gate; dry-run supported).
- **Scripts:** `scripts/backfill-auction-analytics.ts`, npm **`marketing:backfill-analytics`** / **`marketing:prune-traffic-events`**.
- **Dedupe / hygiene:** `lib/marketing/visitor-key.ts`; JSON `metadata` path matching in `track-marketing-event-server.ts`.

**Notes:** `MARKETING_PHASE_6_NOTES.md`.

**Next recommended step (PR 7):** Implemented as Phase 7 (below).

---

## 12h. Phase 7 — Carmunity draft promotion (implemented)

**Goal:** Seller-only **Promote to Carmunity** on auction marketing drill-down: deterministic drafts from listing data + **`generateSellerShareCopy`**, templates (**New listing** / **Ending soon** / **Featured pick**), editable caption, image preview, live preview card, **manual** publish via **`Post`** (`prisma.post.create`) with strict ownership. No cron, no auto-post, no campaign triggers.

**Implemented:**

- **`lib/marketing/generate-carmunity-draft.ts`** — draft pack; listing URLs normalized to **`links.carmunity`**.
- **`app/(app)/u/[handle]/marketing/auctions/carmunity-promo-actions.ts`** — `publishCarmunityPromoPost` (`MARKETING_ENABLED`, handle match, `sellerId` auction check, server-side image from `AuctionImage` only).
- **UI:** `components/marketing/carmunity-promo-panel.tsx`, `carmunity-post-preview.tsx`; page section after Share & Promote.
- **`getSellerMarketingAuctionDetail`** — `auction.primaryImageUrl` for draft/checkbox.

**Schema:** Unchanged; auction link lives in caption text.

**Notes:** `MARKETING_PHASE_7_NOTES.md`.

**Next recommended step (PR 8):** Implemented as Phase 8 (below).

---

## 12i. Phase 8 — BID_CLICK intent tracking (implemented)

**Goal:** **Non-transactional** bid-intent via **`BID_CLICK`** `TrafficEvent` rows from **auction detail client** only (quick bid, custom bid, auto-bid CTAs, sign-up CTA); **fire-and-forget** `sendMarketingTrack`; server dedupe per **surface** (~12s); seller analytics show totals and windows; **no** `AuctionAnalytics` rollup extension; **no** bid/buy-now mutation changes.

**Implemented:**

- **API / validation:** `BID_CLICK` on **`POST /api/marketing/track`**; `marketingTrackBodySchema`, `track-payload-types`, **`bidUiSurface`** in **`sanitize-marketing-metadata`**.
- **Server:** `findRecentBidClickDuplicate` in **`track-marketing-event-server.ts`** (authenticated `userId` **or** anonymous `visitorKey` + same `bidUiSurface` within **12s**).
- **Client:** **`auction-detail-client.tsx`** — `trackBidClickIntent` before bid actions (after validation where applicable); **not inline** in `placeBid` / `quickBid` server actions.
- **Reads:** `getSellerMarketingOverview` **totalBidClicks**; `getSellerMarketingAuctionRows` **totalBidClicks**; `getSellerMarketingAuctionDetail` **totalBidClicks**, **bidClicksLast24h**, **bidClicksLast7d**, recent table **Detail** column for bid surface labels (**`marketingBidUiSurfaceLabel`**).
- **UI:** Marketing overview KPI + listing cards; drill-down KPI row + copy updates.

**Schema:** Unchanged — `BID_CLICK` already existed on **`MarketingTrafficEventType`**.

**Notes:** `MARKETING_PHASE_8_NOTES.md`.

**Next recommended step (PR 9):** Saved **UTM presets**, ingest **throttle**/sampling, optional **`Post.auctionId`** FK — one slice per PR.

---

## 13. Blockers & Ambiguities

1. **No `MANAGER` role** — clarify if “manager” means **seller**, **account manager**, or **ADMIN**; implementation assumes **seller (USER + owns listing)** unless requirements change.
2. **Notification writes missing** — if marketing alerts depend on `Notification`, you need to introduce **centralized creation helpers** and define `type` + `payloadJson` conventions.
3. **Watchlist** — referenced in UX copy but not in DB; marketing features should not assume watchlist counts until modeled.
4. **Post ↔ Auction** — still no FK; Phase 7 uses **link in caption** only. Structured linkage remains a product decision.
5. **Scale** — raw event ingestion needs a **rate-limit and retention** policy before high traffic.
6. **Privacy / compliance** — define retention for `TrafficEvent` and whether IP/UA are stored (not recommended in clear text).

---

*Plan updated through Marketing Phase 8; see §12b–§12i.*
