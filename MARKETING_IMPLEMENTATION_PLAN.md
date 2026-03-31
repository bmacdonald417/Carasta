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
| Admin | `/admin`, `/admin/marketing`, `/admin/reputation/[handle]` | Protected by `middleware.ts` (`role === ADMIN`). |
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
- **Server insert + dedupe:** `lib/marketing/track-marketing-event-server.ts` — windowed DB dedupe (see **Phase 10** for current constants and metadata rules).
- **Source inference:** `lib/marketing/resolve-marketing-source.ts` — optional `utm_source` / referrer host mapping into `MarketingTrafficSource`; otherwise **UNKNOWN**.
- **Metadata:** `lib/marketing/sanitize-marketing-metadata.ts` — event-scoped string keys only; **Phase 10** removed client `visitorKey` from stored metadata except server-injected normalized key.
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

**Next recommended step (PR 9):** Implemented as Phase 9 (below).

---

## 12j. Phase 9 — Saved marketing presets (implemented)

**Goal:** Seller-only **saved presets** for Share & Promote: reusable **UTM campaign** label, **primary channel** (caption URL), **caption variant** emphasis, **hashtags/keywords** inclusion; CRUD at `/u/[handle]/marketing/presets`; auction drill-down **applies** presets without automation or new external APIs.

**Implemented:**

- **Schema:** `MarketingPreset` (+ `User.marketingPresets`); migration **`20260331120000_marketing_preset`**.
- **Validation / reads:** `lib/validations/marketing-preset.ts`, `lib/marketing/get-seller-marketing-presets.ts`.
- **Actions:** `app/(app)/u/[handle]/marketing/presets/actions.ts` — create / update / delete; single **default** per seller.
- **Bundle helpers:** `lib/marketing/build-share-promote-bundle.ts` (uses `build-marketing-links` + `generate-share-copy`); optional `utmCampaignOverride` on link kit builder.
- **UI:** preset list / new / edit + `marketing-preset-form.tsx`, `marketing-preset-delete-button.tsx`; marketing overview **Manage presets**; `ShareAndPromotePanel` preset selector + **Manage presets** on auction marketing page.

**Notes:** `MARKETING_PHASE_9_NOTES.md`.

**Next recommended step (PR 10):** Implemented as Phase 10 (below).

---

## 12k. Phase 10 — Marketing ingestion hardening (implemented)

**Goal:** Conservative **dedupe/throttle** clarity, **metadata guardrails**, **visitorKey** normalization, **retention/prune** ergonomics — **no** Redis, **no** seller UI redesign, **no** bid/buy-now/campaign/community core changes. **No** anonymous VIEW sampling (throttle-only model documented).

**Implemented:**

- **`lib/marketing/track-marketing-event-server.ts`** — exported dedupe windows: authenticated VIEW **60s**, anonymous VIEW **90s**, SHARE_CLICK **8s**, BID_CLICK **12s**; JSDoc dedupe key matrix; anonymous VIEW still **not** deduped without `userId` or `visitorKey`.
- **`lib/marketing/sanitize-marketing-metadata.ts`** — per-`eventType` allowlists, per-field length caps, **4096** total string budget; **no** client `visitorKey` in stored metadata (server injects normalized key only).
- **`lib/marketing/visitor-key.ts`** — trim, strip controls, collapse whitespace, **lowercase**, max 128 / min 8.
- **`lib/validations/marketing.ts`** — metadata ≤ **12** keys, safe key names, string values only (max **4096** each).
- **`lib/marketing/send-marketing-track.ts`** — stop duplicating `visitorKey` inside `metadata` JSON.
- **`scripts/prune-traffic-events.ts`** — **`--dry-run`** and **`--days N`** without requiring `TRAFFIC_EVENT_PRUNE_ENABLED`; destructive prune still gated; npm **`marketing:prune-traffic-events:dry-run`**.
- **`lib/marketing/prune-traffic-events.ts`** — JSDoc for env vars and behavior.

**Notes:** `MARKETING_PHASE_10_NOTES.md`.

**Next recommended step (PR 11):** Implemented as Phase 11 (below).

---

## 12l. Phase 11 — Structured Carmunity ↔ auction linkage (implemented)

**Goal:** Optional **`Post.auctionId`** so Carmunity promo posts from seller marketing are structurally tied to listings; **`/explore` create flow** unchanged; seller auction marketing drill-down shows **linked promo posts** (read-only). No public auction page block in this PR.

**Implemented:**

- **Schema:** nullable **`Post.auctionId`** → **`Auction`** (`onDelete: SetNull`); **`Auction.promoPosts`**; migration **`20260401153000_post_auction_link`**.
- **Publish:** **`publishCarmunityPromoPost`** sets **`auctionId`** on create (ownership unchanged).
- **Reads:** **`getSellerMarketingAuctionDetail`** → **`linkedPromoPosts`** (seller + `authorId` match, newest first, cap 20).
- **UI:** **`components/marketing/auction-linked-promo-posts.tsx`** on **`/u/[handle]/marketing/auctions/[auctionId]`** (empty + list states).

**Notes:** `MARKETING_PHASE_11_NOTES.md`.

**Next recommended step (PR 12):** Implemented as Phase 12 (below).

---

## 12m. Phase 12 — Application-level rate limiting for marketing track (implemented)

**Goal:** In-process **burst guard** on **`POST /api/marketing/track`** (IP + optional auth identity, **event-aware** windows), **soft success** when limited so clients stay calm; **no** Redis; **no** change to dedupe semantics inside **`recordTrafficEvent`**.

**Implemented:**

- **`lib/marketing/marketing-track-rate-limit.ts`** — **10s** fixed windows; per-key caps: **VIEW 45**, **SHARE_CLICK 18**, **BID_CLICK 18**; key = `clientIp + userId + window`; IP from **`X-Forwarded-For`** (first hop) or **`X-Real-IP`**; map pruning when large.
- **`app/api/marketing/track/route.ts`** — after Zod + JWT, before auction lookup / insert; if limited → **`{ ok: true }`** HTTP **200** (same shape as success, no write).

**Notes:** `MARKETING_PHASE_12_NOTES.md`.

**Next recommended step (PR 13):** Implemented as Phase 13 (below).

---

## 12n. Phase 13 — Seller marketing notifications (in-app) (implemented)

**Goal:** Deterministic **seller-only** marketing alerts via existing **`Notification`** (`type` prefix **`MARKETING_`**, JSON **`payloadJson`** with **`title`**, **`marketingHref`**, ids); **no** email/push; **no** cron — generation on **marketing overview + auction drill-down** load (**idempotent** + **dedupe**).

**Implemented:**

- **`lib/marketing/marketing-notification-types.ts`** — type constants + payload shape.
- **`lib/marketing/generate-marketing-notifications.ts`** — **`ensureSellerMarketingNotifications(sellerId, handle)`**: rules (ending soon high/low interest, bid-click surge, no recent activity, campaign start); **72h** auction / **120h** campaign dedupe via **`payloadJson` contains** + `type`.
- **`lib/marketing/get-seller-marketing-notifications.ts`** — recent **`MARKETING_*`** rows for UI.
- **UI:** **`components/marketing/marketing-alerts-panel.tsx`** on **`/u/[handle]/marketing`** and filtered on **`.../marketing/auctions/[auctionId]`**; **`NotificationDropdown`** prefers **`marketingHref`** when present.

**Notes:** `MARKETING_PHASE_13_NOTES.md`.

**Next recommended step (PR 14):** Implemented as Phase 14 (below).

---

## 12o. Phase 14 — Weekly marketing email digest (opt-in) (implemented)

**Goal:** **Opt-in** weekly seller digest via **`User.weeklyMarketingDigestOptIn`** + **`lastMarketingDigestSentAt`**; **HTML email** built from existing marketing rows/metrics; **manual** `npm run marketing:send-digest` with **Resend** (`RESEND_API_KEY`, `MARKETING_DIGEST_FROM`); **no** cron, **no** per-event email.

**Implemented:**

- **Schema:** optional digest fields on **`User`**; migration **`20260402120000_user_weekly_marketing_digest`**.
- **Data:** **`lib/marketing/generate-marketing-digest.ts`** — snapshot (overview, **`MARKETING_*`** alerts, top views / bid clicks / ending soon / low-signal live listings, active campaigns).
- **Template:** **`lib/marketing/render-marketing-digest-email.ts`** — HTML + plaintext, links to **`/u/[handle]/marketing`** and listing marketing URLs.
- **Send:** **`lib/email/send-marketing-digest-email.ts`** — Resend HTTP API (`fetch` only).
- **Script:** **`scripts/send-marketing-digest.ts`** — `--dry-run`; send requires **`MARKETING_DIGEST_SEND_ENABLED=true`**; **~6.5 day** min spacing (**`MARKETING_DIGEST_FORCE=1`** overrides).
- **UI:** **Settings → Email** checkbox; marketing overview links to Settings.

**Notes:** `MARKETING_PHASE_14_NOTES.md`.

**Next recommended step (PR 15):** Implemented as Phase 15 (below).

---

## 12p. Phase 15 — Hosted weekly digest trigger (implemented)

**Goal:** **Protected** **`GET` / `POST`** entrypoint so production can run the weekly digest without SSH/manual script; **reuse** the same batch logic as the CLI; **no** job queue, **no** extra cadences, **no** schema.

**Implemented:**

- **Shared runner:** **`lib/marketing/run-marketing-digest-send.ts`** — spacing (~6.5 days), snapshot build, render, Resend send, **`lastMarketingDigestSentAt`** updates; **`force`** is caller-defined (CLI maps **`MARKETING_DIGEST_FORCE=1`**; hosted handler always **`force: false`**).
- **Route:** **`app/api/jobs/marketing-digest/route.ts`** — **`MARKETING_DIGEST_CRON_SECRET`** (min 16 chars); **`Authorization: Bearer <secret>`** or **`?secret=`** (weaker — may appear in logs); **`?dryRun=1`**; **503** if secret unset; **401** on mismatch (generic body); **noop** JSON when **`MARKETING_ENABLED`** off or real send off (**`MARKETING_DIGEST_SEND_ENABLED`** not `true`) unless dry-run.
- **Script:** **`scripts/send-marketing-digest.ts`** — calls **`runMarketingDigestSend`** (+ optional **`onDryRunPreview`** for console).

**Notes:** `MARKETING_PHASE_15_NOTES.md` (deploy: **Railway** + external HTTPS cron; optional Vercel Cron example).

**Next recommended step (PR 16):** Implemented as Phase 16 (below).

---

## 12q. Phase 16 — Edge / WAF runbook for marketing track (implemented)

**Goal:** **Operator-facing** guidance for protecting **`POST /api/marketing/track`** with **edge / WAF / proxy** controls that **complement** Phase 12 in-memory limits and Phase 10 dedupe—**documentation-first**, no behavior change.

**Implemented:**

- **Runbook:** **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** — purpose, in-app baseline (limiter + dedupe + validation), recommended path/method/body/rate/bot strategy, Railway + Cloudflare-style examples, monitoring, rollout, rollback, multi-instance / header-trust caveats.
- **Code:** **JSDoc / comments only** — `app/api/marketing/track/route.ts`, `lib/marketing/marketing-track-rate-limit.ts` (pointers to runbook).

**Notes:** `MARKETING_PHASE_16_NOTES.md`.

**Next recommended step (PR 17):** Implemented as Phase 17 (below).

---

## 12r. Phase 17 — Observability for marketing track (implemented)

**Goal:** **Lightweight** operational visibility for **`POST /api/marketing/track`**: outcome labels, event type + coarse auth + optional source — **no** JSON contract change, **no** seller UI.

**Implemented:**

- **`lib/marketing/marketing-track-observability.ts`** — bounded in-memory counters (`outcome|eventType|authMode`); **`console.info`** for anomaly outcomes by default; **`MARKETING_TRACK_OBSERVABILITY_VERBOSE`** for per-request logs on hot paths; **`getMarketingTrackObservabilitySnapshot()`** for in-process inspection.
- **`app/api/marketing/track/route.ts`** — observes all paths; uses **`recordTrafficEvent`** **`skipped`** for **`event_deduped`** vs **`event_inserted`**.

**Notes:** `MARKETING_PHASE_17_NOTES.md`.

**Next recommended step (PR 18):** Implemented as Phase 18 (below).

---

## 12s. Phase 18 — Protected admin JSON snapshot for marketing track observability (implemented)

**Goal:** **Internal** **`GET`** JSON for **`getMarketingTrackObservabilityReport()`** so ops can inspect **this instance’s** counters without seller UI or public exposure.

**Implemented:**

- **`app/api/admin/marketing-track-observability/route.ts`** — **401** `{ ok: false }` if unauthorized; **200** `{ ok: true, generatedAt, totalRequests, counters, totalsByOutcome, totalsByEventType, totalsByAuthMode, scope }`.
- **Auth:** NextAuth JWT **`role === ADMIN`**, **or** optional **`MARKETING_TRACK_OBSERVABILITY_SECRET`** (min 16) via **`Authorization: Bearer …`**.
- **`lib/marketing/marketing-track-observability.ts`** — **`getMarketingTrackObservabilityReport()`** aggregates snapshot keys.

**Notes:** `MARKETING_PHASE_18_NOTES.md`.

**Next recommended step (PR 19):** Implemented as Phase 19 (below).

---

## 12t. Phase 19 — TrafficEvent retention & privacy operator runbook (implemented)

**Goal:** **Operator-facing** retention, privacy, pruning, and rollup alignment for **`TrafficEvent`** — documentation-first handoff for ops/security/maintainers.

**Implemented:**

- **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** — data stored/not stored, minimization, retention vs **`AuctionAnalytics`**, prune env/scripts, incidents (edge, logs, admin snapshot), compliance handoff, production checklist.
- **JSDoc `@see`** on **`lib/marketing/prune-traffic-events.ts`**, **`sanitize-marketing-metadata.ts`**, **`visitor-key.ts`**.

**Notes:** `MARKETING_PHASE_19_NOTES.md`.

**Next recommended step (PR 20):** Implemented as Phase 20 (below).

---

## 12u. Phase 20 — Seller marketing CSV export / reporting (implemented)

**Goal:** **Seller-only** **CSV** exports for overview listings, per-auction marketing breakdown, and campaigns — **on-demand** **`GET`** routes + minimal UI links; **no** new persistence.

**Implemented:**

- **Routes:** **`/api/u/[handle]/marketing/export/auctions`**, **`.../export/campaigns`**, **`.../export/auctions/[auctionId]`** — session + handle ownership + **`MARKETING_ENABLED`**; UTF-8 BOM; attachment filenames.
- **Helpers:** **`lib/marketing/csv-utils.ts`**, **`marketing-export-auth.ts`**, **`export-seller-marketing-overview-csv.ts`**, **`export-seller-auction-marketing-csv.ts`**, **`export-seller-campaigns-csv.ts`**; **`getSellerCampaignsForExport`**; optional **`limit`** on **`getSellerMarketingAuctionRows`** (cap **500**).
- **UI:** Export buttons on **`/u/[handle]/marketing`** (listings + campaigns) and **`.../marketing/auctions/[auctionId]`**.

**Notes:** `MARKETING_PHASE_20_NOTES.md`.

**Next recommended step (PR 21):** Implemented as Phase 21 (below).

---

## 12v. Phase 21 — Seller marketing UX polish (implemented)

**Goal:** **Cohesive** seller marketing UI: clearer hierarchy, standardized actions (**Export CSV**, **Manage Campaigns**, **Manage Presets**, **Share &amp; Promote**, **Promote to Carmunity**, **Marketing Alerts**), tighter copy and empty states — **no** logic, schema, or export API changes.

**Implemented:**

- **`/u/[handle]/marketing`** — KPIs grouped (**Inventory** vs **Tracked engagement**), section dividers, presets strip aligned with **Share &amp; Promote**, campaign/listing empty states + table polish, **Open marketing** / **Manage Campaigns** / **Export CSV** consistency.
- **`.../marketing/auctions/[auctionId]`** — header + grouped actions (**Export CSV**, **View public listing**), KPI bands (**Totals** / **Recent windows** / **Activity**), **Traffic sources** / **Event types**, campaigns + activity copy, **Manage Campaigns** link.
- **Campaigns &amp; Presets** index pages — **← Back to Marketing**, shorter descriptions; presets title **Presets**.
- **Components:** **`marketing-alerts-panel`**, **`share-and-promote-panel`** (**Manage Presets**), **`auction-linked-promo-posts`**, **`carmunity-promo-panel`** (microcopy).

**Notes:** `MARKETING_PHASE_21_NOTES.md`.

**Next recommended step (PR 22):** Implemented as Phase 22 (below).

---

## 12w. Phase 22 — Admin marketing summary tooling (implemented)

**Goal:** **Admin-only**, **read-only** platform-wide marketing health: aggregates from **`TrafficEvent`**, **`AuctionAnalytics`**, **`Campaign`**, and marketing **`Notification`** rows — **no** seller workflow changes, **no** mutations from admin, **no** schema changes.

**Implemented:**

- **Page:** **`/admin/marketing`** — `app/(admin)/admin/marketing/page.tsx` (same **`ADMIN`** guard as other admin routes via **`app/(admin)/admin/layout.tsx`** + **`middleware.ts`**).
- **Helper:** **`lib/marketing/get-admin-marketing-platform-summary.ts`** — totals (event counts by type, rollup sums, campaign counts, marketing notification count), top auctions/sellers by traffic engagement, recent campaigns with listing/seller labels; reuses **`getViewShareTotalsForAuctionIds`**, **`isMarketingEnabled`**, **`MARKETING_NOTIFICATION_PREFIX`**.
- **Admin home:** link card to **`/admin/marketing`** on **`app/(admin)/admin/page.tsx`**.
- **Links on page:** public **`/auctions/[id]`** and **`/u/[handle]`** only (no seller marketing owner URLs — avoids misleading edit paths for staff).

**Notes:** `MARKETING_PHASE_22_NOTES.md`.

**Next recommended step (PR 23):** Implemented as Phase 23 (below).

---

## 12x. Phase 23 — Admin time-bounded marketing aggregates (implemented)

**Goal:** **Rolling 7- and 30-day** read-only aggregates on **`/admin/marketing`** so staff see **recent momentum**, not only lifetime totals — **no** schema changes, **no** seller or commerce path changes.

**Implemented:**

- **`loadRecentWindow(cutoff)`** in **`lib/marketing/get-admin-marketing-platform-summary.ts`** — per window: **`TrafficEvent`** total + VIEW / SHARE_CLICK / BID_CLICK; **`Campaign`** rows with **`updatedAt`** or **`createdAt`** in range; marketing **`Notification`** rows by **`createdAt`** + **`MARKETING_NOTIFICATION_PREFIX`**.
- **`recentActivity.last7Days` / `last30Days`** on the summary payload; **`topAuctionsLast7Days`** / **`topSellersLast7Days`** (raw SQL + enrichment, same patterns as lifetime tops).
- **Page:** **`app/(admin)/admin/marketing/page.tsx`** — **Recent activity** band (7 vs 30 panels), **Last 7 days — leaders** tables, then **All-time** KPIs and lifetime leader tables (labels clarified).

**Notes:** `MARKETING_PHASE_23_NOTES.md`.

**Next recommended step (PR 24):** Implemented as Phase 24 (below).

---

## 12y. Phase 24 — Admin marketing CSV exports (implemented)

**Goal:** **ADMIN**-only **`GET`** CSV downloads for the same aggregates as **`/admin/marketing`** — **no** schema changes, **no** seller or commerce changes.

**Implemented:**

- **Auth:** **`requireAdminMarketingCsvAccess()`** in **`lib/marketing/admin-marketing-export-auth.ts`** — **`getSession()`** + **`role === ADMIN`** ( **`/api/admin/*`** is outside **`middleware.ts`** matcher).
- **CSV builders:** **`export-admin-marketing-summary-csv.ts`** (`scope`, `metric`, `value`: meta, all_time, last_7_days, last_30_days), **`export-admin-marketing-tops-last-7-csv.ts`** (two labeled blocks: top listings 7d, top sellers 7d); reuse **`csvRow`** from **`csv-utils.ts`**; UTF-8 BOM on responses.
- **Routes:** **`GET /api/admin/marketing/export/summary`**, **`GET /api/admin/marketing/export/tops-last-7`** — timestamped **`Content-Disposition`** filenames.
- **UI:** **`app/(admin)/admin/marketing/page.tsx`** — **Export summary CSV** / **Export tops (7d) CSV** outline buttons (same pattern as seller exports).

**Notes:** `MARKETING_PHASE_24_NOTES.md`.

**Next recommended step (PR 25):** Implemented as Phase 25 (below).

---

## 12z. Phase 25 — EXTERNAL_REFERRAL support for admin analytics (implemented)

**Goal:** Treat **EXTERNAL_REFERRAL** as a first-class marketing traffic signal: **ingest** via existing **`POST /api/marketing/track`**, **dedupe** like VIEW, **admin** totals/windows/CSV/tables — **no** Prisma migration (enum already present).

**Implemented:**

- **Validation:** **`marketingTrackBodySchema`** — **`EXTERNAL_REFERRAL`** in **`eventType`** enum.
- **Ingest:** **`app/api/marketing/track/route.ts`** maps to **`MarketingTrafficEventType.EXTERNAL_REFERRAL`**; **rate limit** + **observability** labels extended.
- **Persistence:** **`sanitize-marketing-metadata`** — same allowed keys as VIEW (**path**, **referrer**, **currentUrl**). **`recordTrafficEvent`** — **`findRecentUserOrVisitorKeyedDuplicate`** for VIEW + EXTERNAL_REFERRAL (separate windows constants); rollups still **VIEW / SHARE_CLICK** only.
- **Admin:** **`getAdminMarketingPlatformSummary`** — **`externalReferralEvents`** on **`totals`** and **`AdminMarketingRecentWindow`**; lifetime + 7d top listing rows include **Ext ref** counts; **CSV** summary + tops export columns updated.
- **UI:** **`/admin/marketing`** — recent-activity panels, all-time KPI, listing tables **Ext ref** column.

**Notes:** `MARKETING_PHASE_25_NOTES.md`.

**Next recommended step (PR 26):** Implemented as Phase 26 (below).

---

## 12za. Phase 26 — Admin marketing JSON snapshot (implemented)

**Goal:** **`GET /api/admin/marketing/snapshot`** returns **`getAdminMarketingPlatformSummary()`** as **JSON** for internal tools / BI — **read-only**, **ADMIN** session, **no** schema change.

**Implemented:**

- **Route:** **`app/api/admin/marketing/snapshot/route.ts`** — **`Content-Type: application/json`**, **`Cache-Control: no-store`**.
- **Auth:** **`requireAdminMarketingCsvAccess()`** (same as CSV exports).
- **Payload:** **`buildAdminMarketingSnapshotJson()`** in **`lib/marketing/admin-marketing-snapshot-json.ts`** — **`ok`**, **`generatedAt`** (ISO), **`note`**, **`marketingEnabled`**, **`totals`**, **`recentActivity`** (7d/30d, including **external referral** counts), **`topAuctions`**, **`topSellers`**, **`topAuctionsLast7Days`**, **`topSellersLast7Days`**, **`recentCampaigns`** (**`updatedAt`** as ISO string).
- **UI:** **`/admin/marketing`** — **JSON snapshot** outline button (opens in new tab; session cookie sent).

**Notes:** `MARKETING_PHASE_26_NOTES.md`.

**Next recommended step (PR 27):** Implemented as Phase 27 (below).

---

## 12zb. Phase 27 — EXTERNAL_REFERRAL landing runbook + thin client helper (implemented)

**Goal:** Practical **EXTERNAL_REFERRAL** from the browser: **runbook**, **`MarketingTrackPayload`** support, **`sendMarketingTrackExternalReferralLanding`** + **`urlHasUtmAttributionParams`**, **UTM**-gated beacon on **public auction detail** — **no** schema change.

**Implemented:**

- **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** — semantics vs **VIEW**, when to fire, dedupe, metadata, QA.
- **`lib/marketing/track-external-referral-landing.ts`** — thin helpers; reuse **`sendMarketingTrack`**.
- **`lib/marketing/track-payload-types.ts`** — **EXTERNAL_REFERRAL** on **eventType** union.
- **`components/marketing/auction-view-tracker.tsx`** — after **VIEW**, one **EXTERNAL_REFERRAL** when the URL has **UTM** or supported **click-id** params (Phase 29 expands beyond UTM only).
- **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** — related-doc link.

**Notes:** `MARKETING_PHASE_27_NOTES.md`.

**Next recommended step (PR 28):** Implemented as Phase 28 (below).

---

## 12zc. Phase 28 — ETag / If-None-Match for admin marketing snapshot (implemented)

**Goal:** **Conditional GET** on **`GET /api/admin/marketing/snapshot`** — **304** when unchanged, **conservative caching** — **no** auth or field-shape change on **200**.

**Implemented:**

- **`lib/marketing/admin-marketing-snapshot-etag.ts`** — stable JSON for hashing (**omits `generatedAt`**), **SHA-256** **base64url** strong **`ETag`**, **`If-None-Match`** parser (**`*`**, weak **W/**, comma list).
- **`app/api/admin/marketing/snapshot/route.ts`** — **`NextRequest`**, **304** empty body + **`ETag`** when matched; **200** same JSON as before with **`ETag`**; **`Cache-Control: private, max-age=15`** (replaces **no-store** on this route).
- **Note:** **ETag** reflects data only; **200** responses still include a new **`generatedAt`**. **304** clients keep prior body (standard).

**Notes:** `MARKETING_PHASE_28_NOTES.md`.

**Next recommended step (PR 29):** Implemented as Phase 29 (below).

---

## 12zd. Phase 29 — Conservative click-id support for EXTERNAL_REFERRAL (implemented)

**Goal:** Recognize common ad **click-id** query params (**`gclid`**, **`fbclid`**, **`msclkid`**) alongside **UTM** for the default **`AuctionViewTracker`** **EXTERNAL_REFERRAL** beacon — **no** new event type, **no** metadata expansion beyond existing **`path` / `referrer` / `currentUrl`**.

**Implemented:**

- **`lib/marketing/track-external-referral-landing.ts`** — **`EXTERNAL_MARKETING_CLICK_ID_PARAMS`**, **`urlHasClickIdAttributionParams`**, **`urlHasExternalMarketingAttributionParams`** (UTM **or** click id); **`urlHasUtmAttributionParams`** unchanged.
- **`components/marketing/auction-view-tracker.tsx`** — uses **`urlHasExternalMarketingAttributionParams()`**.
- **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** — UTM vs click ids, limitations, QA.

**Notes:** `MARKETING_PHASE_29_NOTES.md`.

**Next recommended step (PR 30):** Implemented as Phase 30 (below).

---

## 12ze. Phase 30 — Admin marketing snapshot observability (implemented)

**Goal:** Lightweight operational visibility for **`GET /api/admin/marketing/snapshot`**: **200** vs **304** vs **401** vs **500** without changing response bodies, **ETag** semantics, or JSON shape.

**Implemented:**

- **`lib/marketing/admin-marketing-snapshot-observability.ts`** — in-memory counters per outcome; **`console.info`** for **401** / **500** by default; **`200`** / **`304`** when **`ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE`** is set; **`getAdminMarketingSnapshotObservabilitySnapshot()`** for in-process inspection.
- **`app/api/admin/marketing/snapshot/route.ts`** — calls **`observeAdminMarketingSnapshot`** on each major branch (**401** before returning **`auth.response`**; **304** / **200** in success path; **500** in **`catch`** before rethrow so framework error handling is unchanged).

**Notes:** `MARKETING_PHASE_30_NOTES.md`.

**Next recommended step (PR 31):** Implemented as Phase 31 (below).

---

## 12zf. Phase 31 — Protected admin snapshot observability JSON (implemented)

**Goal:** Expose **`getAdminMarketingSnapshotObservabilitySnapshot()`** via a **protected** **`GET`** JSON route so ops can read **this instance’s** snapshot-route counters without log scraping.

**Implemented:**

- **`app/api/admin/marketing-snapshot-observability/route.ts`** — **401** **`{ ok: false }`** if neither **ADMIN** JWT nor **`Authorization: Bearer <MARKETING_TRACK_OBSERVABILITY_SECRET>`** (same env + rules as track observability, min 16 chars). **200** returns **`ok`**, **`generatedAt`**, **`counters`**, **`totals.observedRequests`**, and a short **`note`** on per-process limits.

**Notes:** `MARKETING_PHASE_31_NOTES.md`.

**Next recommended step (PR 32):** Conservative **EXTERNAL_REFERRAL** click-id allowlist expansion (**`twclid`**, etc.) with privacy/compliance notes — **one** narrow PR (**no** schema).

---

## 13. Blockers & Ambiguities

1. **No `MANAGER` role** — clarify if “manager” means **seller**, **account manager**, or **ADMIN**; implementation assumes **seller (USER + owns listing)** unless requirements change.
2. **Notifications** — marketing sellers use **`MARKETING_*`** `Notification` rows (Phase 13); other product notifications may still need centralized helpers.
3. **Watchlist** — referenced in UX copy but not in DB; marketing features should not assume watchlist counts until modeled.
4. **Post ↔ Auction** — optional **`Post.auctionId`** (Phase 11) for Carmunity marketing promos; caption URLs remain for other cases.
5. **Scale** — Phase 12 **app-layer** track limits + **TrafficEvent** prune; edge limits still recommended at volume.
6. **Privacy / compliance** — operator baseline: **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** (retention/prune, what is stored; IP/UA not on `TrafficEvent`; legal review still required per jurisdiction).

---

*Plan updated Marketing Phase 31; see §12b–§12zf.*
