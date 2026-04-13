# Carasta App — Architecture & Integration Plan

**Document purpose:** Define an enterprise-grade, maintainable **Flutter client** (iOS + Windows) for the **existing** Carasta web platform (Next.js, NextAuth, PostgreSQL/Prisma). This is a **new client**, not a forked product or parallel backend.

**Last updated:** 2026-04-13

---

## 1. Executive Summary

Carasta’s platform already centralizes auctions, Carmunity (posts/likes/comments), profiles, notifications, seller tooling, and admin flows in a single PostgreSQL database with Prisma and Next.js. The new app should **prioritize Carmunity** (feed, post detail, creation, engagement) and present **auctions as a secondary but first-class** area (browse, detail, watchlist, bid).

**Recommended stack:** **Flutter 3.x** with **Material 3** (and platform-adaptive tweaks), targeting **iOS** and **Windows desktop**, consuming **versioned HTTP APIs** on the existing deployment (`https://<carasta-host>`). The app must **not** reimplement business rules (bidding, auto-bid, anti-snipe, reputation, etc.); it calls the same server-side logic the website uses, exposed via stable contracts.

**Critical gap today (repo audit):**  
- **Reads:** Several JSON routes exist and are suitable for mobile (e.g. auction search is explicitly documented for web + mobile).  
- **Writes:** Carmunity actions (create post, like/comment) and auction actions (place bid, buy now, etc.) are implemented as **Next.js Server Actions** (`"use server"`), not as general REST/tRPC endpoints for non-browser clients.  
- **Auth:** NextAuth **JWT sessions** power the site; notification APIs use `getToken` from `next-auth/jwt`. A **first-class mobile auth contract** (how the app sends identity on every request) must be agreed and implemented on the server.  
- **Forums:** No `Forum` / thread models appear in the current Prisma schema; “Mechanics Corner” and “Gear Interests” require **backend design** (or a deliberate interim mapping, e.g. tagged posts).  
- **Media:** Post creation currently accepts an **image URL string**, not a documented upload pipeline—camera/gallery uploads need a **server-side upload or presign** story.

This plan structures the Flutter codebase, navigation, feature modules, service layer, and phased delivery so the app **tracks backend evolution** with minimal rework.

---

## 2. Product Positioning

| Dimension | Direction |
|-----------|-----------|
| **Primary loop** | Open app → scroll Carmunity → engage (like, comment) → open profiles → return often |
| **Secondary loop** | Discover auctions → watch → bid → receive notifications |
| **Feel** | Media-first, modern enthusiast social (clean typography, generous imagery, fast feedback) |
| **Brand** | Align with Carasta web: reuse color tokens, corner radii, and motion language; avoid a separate “sub-brand” |
| **Platform honesty** | The app is a **client**; advanced seller/admin/marketing workflows may remain web-first until explicitly productized |

---

## 3. App vs Website Role Split

| Area | In app (v1–v2) | Prefer web (until API/product is ready) |
|------|----------------|----------------------------------------|
| Carmunity feed, post detail, likes, comments | **Yes** | — |
| Post creation (text + media) | **Yes** (after upload contract) | — |
| Auction browse, detail, watchlist, bid | **Yes** (after bid/watchlist APIs + auth) | Complex seller listing creation can stay web |
| Profile (view/edit basics, avatar) | **Yes** (scope TBD) | Full reputation/legal admin |
| Notifications | **Yes** | — |
| Seller marketing campaigns, exports, admin | **No** (deep link to web) | Full tooling |

**Rule:** Anything that **mutates** domain state must go through **server APIs** that delegate to shared services (`lib/auction-utils`, future extracted Carmunity services, etc.), not duplicated in Dart.

---

## 4. Recommended Tech Stack

| Layer | Choice | Notes |
|-------|--------|------|
| **UI / app** | Flutter (Dart 3), Material 3 | Single codebase for iOS + Windows |
| **State** | `riverpod` or `bloc` (pick one) | Prefer one global pattern for testability |
| **Networking** | `dio` or `http` + thin wrappers | Interceptors for auth, logging, retries |
| **JSON** | `json_serializable` or freezed | DTOs versioned per endpoint |
| **Local cache** | `drift` or `hive` (optional) | Start minimal; cache feed for offline *read* only if needed |
| **Routing** | `go_router` | Declarative routes + deep links |
| **Env** | `--dart-define` / flavors | `API_BASE_URL`, feature flags |
| **Real-time** | Pusher client (bids) + SSE client (activity) | Align with `lib/pusher.ts` and `app/api/activity-feed` |
| **Analytics** | Optional; same events as web where possible | Respect privacy policy |

**Why Flutter:** Strong iOS + Windows support, one codebase, good media lists and custom painters for branding; no conflict with the existing TypeScript backend.

---

## 5. Navigation Architecture

### 5.1 Primary shell (recommended)

**Product implementation (Carmunity by Carasta, Phase 1):** Bottom navigation **5 tabs**:

1. **Home** — Carmunity feed (Following / Trending / Latest)  
2. **Forums** — Mechanics Corner, Gear Interests (hub)  
3. **Create** — post / thread / media / link (scaffolded; APIs later)  
4. **Auctions** — browse-first; secondary to social  
5. **You** — profile, garage, posts; notifications via app bar entry  

**Windows:** Same **five** destinations; **NavigationRail** + constrained content width for a spacious desktop feel (`carmunity_app`).

**Earlier 4-tab sketch:** The list below was an initial sketch; the **5-tab** product decision above is authoritative for the shipped app shell.

**Mobile (legacy sketch):** Bottom navigation **4 tabs**:

1. **Carmunity** — feed (default landing)  
2. **Auctions** — search/browse (secondary but visible)  
3. **Forums** — category hub (Mechanics Corner, Gear Interests)  
4. **You** — profile, notifications entry, settings  

**Windows (legacy sketch):** Same **four destinations**; use **NavigationRail** + content pane on wide screens, or compact bottom nav + side drawer—choose one pattern and keep route names identical.

### 5.2 Stack vs tab (within each tab)

- **Carmunity:** Feed → Post detail → User profile (push) → Comment thread (modal or page)  
- **Auctions:** Search results → Auction detail → Bid confirmation (sheet) → Watchlist  
- **Forums:** Category list → Thread list → Thread detail → Reply composer  
- **You:** Profile → Settings → Notification list → Notification detail (deep link target)

### 5.3 Global entry points

- **Compose** FAB on Carmunity (primary creation)  
- **Search** optional on Auctions tab app bar  

---

## 6. Feature Modules

Monorepo-style **feature folders** keep boundaries clear and mirror backend domains.

```
lib/
  app/                    # MaterialApp, router, theme, localization
  core/
    config/               # env, build flavors
    network/              # ApiClient, interceptors, errors
    auth/                 # session, token storage, refresh
    analytics/            # optional
  design_system/          # Carasta tokens, typography, components
  features/
    carmunity/
      data/               # DTOs, mappers, CarmunityRepository
      domain/             # entities (optional pure layer)
      presentation/       # screens, widgets, controllers
    auctions/
      data/
      presentation/
    forums/
      data/
      presentation/
    profile/
      data/
      presentation/
    notifications/
      data/
      presentation/
    settings/
      presentation/
```

**Dependency rule:** `presentation` → `data` → `core`; features do not import each other’s `presentation`; shared widgets live in `design_system` or `core`.

---

## 7. API / Service Layer Strategy

### 7.1 Principles

1. **Repository pattern** per domain (`CarmunityRepository`, `AuctionRepository`, …) hiding HTTP details.  
2. **DTOs** match JSON exactly; **mappers** to view models for UI.  
3. **OpenAPI or hand-written contract docs** maintained alongside the Next app (even if generated later).  
4. **Versioning:** Prefer `/api/v1/...` when adding new mobile-oriented routes; existing routes can stay until a migration window.

### 7.2 Assumed contracts (current repo + required extensions)

| Concern | Existing / observed | App expectation |
|--------|---------------------|-----------------|
| **Feed** | `GET /api/explore/feed?tab=trending|following&userId=` | Returns `{ posts: [...] }` with author, counts, `liked` |
| **Auction search** | `GET /api/auctions/search` — documented in `AUCTION_SEARCH_ARCHITECTURE.md` | Use for browse; pagination + filters |
| **Auction detail (partial)** | `GET /api/auctions/[id]` | Subset of fields; app may need richer detail (images, description) — confirm or extend |
| **Notifications** | `GET /api/notifications/list` uses JWT from cookie | **Needs** Bearer or header strategy for mobile |
| **Activity feed** | `GET /api/activity-feed` SSE | **Needs** Flutter SSE client; optional fallback polling |
| **Carmunity mutations** | Server Actions in `app/(marketing)/explore/actions.ts` | **Needs** `POST`/`DELETE` REST (or tRPC) endpoints that call the same DB logic |
| **Auction mutations** | Server Actions in `app/(marketing)/auctions/actions.ts` | **Needs** REST endpoints wrapping `placeBidAndProcess`, `buyNow`, etc. |
| **Watchlist** | Not verified in Prisma as dedicated model | **Product decision:** persist table + API or reuse another mechanism |

**Non-goal:** Embedding Prisma types or server-only objects in JSON responses (already avoided in auction search).

---

## 8. Auth Strategy

### 8.1 Current platform behavior

- NextAuth **JWT** sessions (`session: { strategy: "jwt" }` in `lib/auth.ts`).  
- `app/api/notifications/list/route.ts` uses `getToken({ req, secret: process.env.NEXTAUTH_SECRET })`.

### 8.2 Recommended direction for mobile

Pick one **explicit** pattern (product + security review):

1. **Authorization header with JWT**  
   - After login, client stores an access token (short-lived) + refresh (if issued).  
   - Each API route validates JWT (same `NEXTAUTH_SECRET` or a dedicated signing key for API access).  

2. **OAuth2-style token endpoint**  
   - Exchange credentials / Google auth code for API tokens.  
   - Keeps NextAuth for web; mobile uses token API.  

3. **Session token bridge**  
   - One-time exchange of NextAuth session for a mobile token (careful with XSS on web; mobile-only flow).  

**Implementation note:** Flutter should use **secure storage** (Keychain / Windows Credential Manager via plugins) for tokens.

**Sign-in UX:** Support email/password and Google if parity is required; **Apple Sign-In** may be required for iOS if using Google-only—confirm with App Store policy.

---

## 9. Media & Upload Strategy

### 9.1 Current state

- `createPost` stores `imageUrl` as a **string** (URL), not multipart upload (`app/(marketing)/explore/create-post-form.tsx`).

### 9.2 Target path for the app

1. **Request upload** — `POST /api/media/upload` or **presigned S3/Blob URL** from server.  
2. **Client uploads** binary to storage.  
3. **Create post** — `POST /api/carmunity/posts` with `{ content, mediaAssetIds | imageUrl }` validated server-side.  

**Constraint:** Do not upload directly to Postgres; store objects in the same CDN/storage the website uses.

---

## 10. Forum Strategy

### 10.1 Gap

Prisma schema today includes **Post** (Carmunity) but **no** forum/thread/reply models. Product names **Mechanics Corner** and **Gear Interests** imply threaded discussion distinct from the global feed.

### 10.2 Recommended approaches (choose with Carasta)

| Option | Pros | Cons |
|--------|------|------|
| **A. Native forum models** (`Forum`, `Thread`, `Post` as reply) | Clear UX, queryable | Requires migration + APIs |
| **B. Tagged Carmunity posts** (`category` enum + filters) | Faster | Weaker threading, harder moderation |
| **C. External forum embed** | Quick | Inconsistent UX, SSO complexity |

**App architecture:** Implement `ForumsRepository` with stable **DTOs** regardless of backend choice; if the backend starts as tags, DTOs can map `Thread` ↔ `Post` until native forums ship.

---

## 11. Notifications & Deep Linking

### 11.1 Data model

- `Notification` table: `type`, `payloadJson`, `readAt` (`prisma/schema.prisma`).  
- App should treat `payloadJson` as a **discriminated union** by `type` (parse safely).

### 11.2 Transport

- **Pull:** list + unread count (existing list route; unread route exists).  
- **Push (optional):** FCM (iOS) + Windows notifications — **requires** backend registration and device tokens.  
- **Real-time:** reuse Pusher where already used for bids (`lib/pusher.ts`).

### 11.3 Deep links

| Scheme | Example | Target |
|--------|---------|--------|
| `carasta://post/{id}` | Open post | Carmunity post detail |
| `carasta://auction/{id}` | Open auction | Auction detail |
| `carasta://u/{handle}` | Profile | Profile screen |

**Web parity:** `https://carasta.com/explore/post/{id}` should open the same content (Universal Links / App Links).

---

## 12. Web / App Consistency Strategy

1. **Design tokens:** Extract colors/spacing from web CSS/theme into a Dart `ThemeExtension` (document source of truth).  
2. **Copy & naming:** “Carmunity”, auction status labels, error messages — **same strings** where possible (or i18n keys aligned).  
3. **Business rules:** Min bid, anti-snipe extension, reserve meter — **only** server; app displays server errors verbatim.  
4. **Feature flags:** Optional remote config to hide features still web-only.  
5. **Documentation:** Any change to `AuctionSearchInput` or feed JSON should update **both** web docs (`AUCTION_SEARCH_ARCHITECTURE.md` pattern) and a **mobile changelog**.

---

## 13. Build Phases (Enterprise Order)

Phases are ordered to **minimize rework**: establish **contracts and auth** before heavy UI, then **Carmunity** (product priority), then **forums** (depends on backend), then **auctions** (strong API exists for search; mutations need API), then **notifications & polish**.

| Phase | Name | Outcomes |
|-------|------|----------|
| **0** | **Platform + contracts** | Flutter app skeleton; `ApiClient`; env config; **auth token strategy** agreed; **REST (or tRPC) parity** for Carmunity + auction mutations **specified** with backend owners; OpenAPI stubs or markdown contracts; CI for analyze/test |
| **1** | **Shell + theme** | Carasta design system in Flutter; `go_router` shell; tab navigation; **signed-out** state; placeholder screens |
| **2** | **Carmunity feed** | Read feed (`GET /api/explore/feed`); post detail; like/comment **only after** write APIs exist; **auth** integrated; infinite scroll + media cards |
| **3** | **Post creation** | Composer UI; **upload pipeline**; create post API; **error handling**; optimistic UI optional |
| **4** | **Forums** | **Blocked on backend model** — implement UI + repository against agreed DTOs; Mechanics Corner & Gear Interests entry |
| **5** | **Auctions** | Browse via `GET /api/auctions/search`; detail; watchlist API; **bid/buy** via new REST endpoints wrapping `placeBidAndProcess` / `buyNow`; Pusher subscription for live updates |
| **6** | **Notifications + polish** | Notification list; mark read; unread badge; deep links; Windows/iOS-specific polish; performance (image cache, jank) |

**Adjustment vs. a naive “feed first”:** Auction **search** is already a clean contract—**Phase 5** can proceed in parallel with **Phase 4** only if **auth and mutations** are ready; **Phase 4** forums should not block **Phase 1–3** unless product insists on forums before auctions.

---

## 14. Risks / Open Questions

| Risk | Mitigation |
|------|------------|
| **Server Actions only** for mutations | Add thin API routes that call shared `lib/*` services; never duplicate logic in Flutter |
| **JWT / cookie mismatch** | Standardize `Authorization: Bearer` for mobile; document secret rotation |
| **No forum schema** | Product + backend decision before Phase 4 |
| **Image upload missing** | Presign + CDN; virus scanning policy if user-generated |
| **Watchlist** | Confirm data model + endpoints |
| **SSE on mobile** | Test background behavior; fallback polling for activity |
| **Pusher keys** | Expose safe client config; channel auth for private channels |
| **Compliance** | Privacy, COPPA if applicable, auction jurisdiction disclaimers |

---

## 15. Recommended First Build Slice

**Goal:** Prove end-to-end integration with minimal surface.

**Scope:**

1. **Flutter project** with flavors (dev/staging/prod), `ApiClient`, logging.  
2. **Auth spike:** one agreed path (e.g. email/password → token) against staging.  
3. **Single screen:** Carmunity **trending feed** read-only (uses existing `GET /api/explore/feed`).  
4. **Design system:** Carasta colors + typography + one card component.  
5. **Backend ticket (parallel):** `POST /api/carmunity/posts` + `POST /api/carmunity/posts/{id}/like` (or equivalent) delegating to current Prisma logic — **not** implemented in Flutter until merged.

**Deliverable:** Demo on iOS + Windows showing **live feed** from staging with **auth-ready** plumbing.

---

## Appendix A — Repo audit references (Carasta web)

| Area | Location / notes |
|------|------------------|
| NextAuth | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Feed API | `app/api/explore/feed/route.ts` |
| Carmunity actions | `app/(marketing)/explore/actions.ts` |
| Auction search API | `app/api/auctions/search/route.ts`, `AUCTION_SEARCH_ARCHITECTURE.md` |
| Auction detail API | `app/api/auctions/[id]/route.ts` |
| Bid logic | `lib/auction-utils.ts` (`placeBidAndProcess`, …) |
| Auction server actions | `app/(marketing)/auctions/actions.ts` |
| Notifications API | `app/api/notifications/list/route.ts` |
| Activity SSE | `app/api/activity-feed/route.ts` |
| Pusher | `lib/pusher.ts` |

---

## Appendix B — Flutter folder structure (starter)

```
carasta_app/
  lib/
    main.dart
    app/
    core/
    design_system/
    features/
  test/
  pubspec.yaml
```

Add `ios/`, `windows/`, and CI workflows when the repository is created.

---

*This document is the single source of truth for app architecture until superseded. Update it when API routes or auth strategy change.*
