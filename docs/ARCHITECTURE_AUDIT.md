# Carasta Architecture Audit & Alignment Report

**Principal Software Architect Review**  
**Date:** March 2025  
**Scope:** Full repository audit before feature expansion

---

## 1. Technology Stack Verification

| Component | Current State | Notes |
|-----------|---------------|-------|
| **Next.js** | 14.2.35 | App Router confirmed |
| **React** | 18.3.1 | |
| **TypeScript** | 5.6.3 | |
| **Prisma** | 5.22.0 | PostgreSQL |
| **NextAuth** | 4.24.10 | JWT strategy, Credentials + optional Google |
| **State Management** | None (local `useState` only) | No Zustand, Redux, Recoil |
| **Framer Motion** | 12.34.1 | Used in 8 components |
| **Tailwind** | 3.4.15 | |
| **shadcn-style UI** | Radix primitives + CVA | `components/ui/` |

**App Router:** ✅ Confirmed. All routes under `app/` with `page.tsx`, `layout.tsx`, route groups, dynamic segments.

---

## 2. Prisma Schema Structure

### 2.1 User Model
```prisma
User: id, email, passwordHash, handle, name, bio, avatarUrl, location, image,
      emailVerified, role (USER|ADMIN), instagramUrl, facebookUrl, twitterUrl, tiktokUrl,
      accounts, sessions, followers, following, posts, likes, comments, garageCars,
      auctions, purchasedAuctions, bids, autoBids, notifications
```
- **Indexes:** None on User (relies on `@unique` for email, handle)
- **Gaps:** No `updatedAt`; `image` duplicates `avatarUrl` (NextAuth convention)

### 2.2 Auction Model
```prisma
Auction: id, sellerId, buyerId, title, description, year, make, model, trim, vin,
         mileage, reservePriceCents, buyNowPriceCents, buyNowExpiresAt,
         startAt, endAt, status (DRAFT|LIVE|SOLD|ENDED), createdAt, updatedAt
```
- **Indexes:** sellerId, buyerId, status, endAt, (make, model, year)
- **Gaps:** `status` is `String` not `enum`; no composite index for `(status, endAt)` for common "LIVE + ending soon" queries

### 2.3 Other Models
- **Account, Session, VerificationToken** — NextAuth standard
- **Follow** — @@unique(followerId, followingId), indexes on both FKs
- **Post** — authorId, createdAt
- **Like** — @@id(userId, postId), index on postId
- **Comment** — postId; **missing** index on authorId
- **GarageCar** — ownerId, (ownerId, type)
- **GarageCarImage** — garageCarId
- **AuctionImage** — auctionId
- **Bid** — auctionId, bidderId
- **AutoBid** — @@unique(auctionId, bidderId), index on auctionId
- **Notification** — userId; **schema issue:** `readAt DateTime?` — typically `Boolean read` or `DateTime? readAt`; no index on `(userId, readAt)` for unread queries

---

## 3. Server vs Client Component Split

### 3.1 Server Components (RSC) — No `"use client"`
- `app/page.tsx` — Home, fetches auctions, passes to client children
- `app/auctions/page.tsx` — List + filters
- `app/auctions/[id]/page.tsx` — Detail shell, fetches auction
- `app/explore/page.tsx` — Community shell
- `app/u/[handle]/page.tsx` — Profile
- `app/u/[handle]/garage/page.tsx`, `dream/page.tsx`, `listings/page.tsx`
- `app/sell/page.tsx`, `settings/page.tsx`, `contact/page.tsx`
- `app/auth/sign-in/page.tsx`, `sign-up/page.tsx`
- `app/layout.tsx` — Root layout (no client)

### 3.2 Client Components — `"use client"`
| File | Purpose |
|------|---------|
| `providers.tsx` | SessionProvider |
| `CarastaLayout.tsx` | Layout with nav, sidebar, mobile menu |
| `ShowroomHero.tsx` | Embla carousel, requires interactivity |
| `AuctionImageStrip.tsx` | Scrolling strip |
| `AuctionCard.tsx` | Hover, link behavior |
| `auction-filters.tsx` | Form state, router |
| `auction-detail-client.tsx` | Bidding UI, Pusher, polling |
| `community-feed.tsx` | Tabs, fetch, like/comment |
| `TrendingDreamGarage.tsx` | Client fetch |
| `create-post-form.tsx`, `comment-form.tsx` | Form state |
| `create-auction-wizard.tsx` | Multi-step form |
| `add-garage-car-form.tsx` | Form state |
| `sign-in-form.tsx`, `sign-up-form.tsx` | Form state |
| `settings-form.tsx` | Form state |
| `follow-button.tsx` | Optimistic UI |
| `ContactForm.tsx` | Form state |
| `AppSidebar.tsx`, `MobileBottomNav.tsx`, `nav.tsx` | Navigation, session |
| `ReserveMeter.tsx`, `CountdownTimer.tsx` | Live updates |
| `GarageCard3D.tsx`, `GarageShowroom.tsx` | Motion |
| `InstagramShowcase.tsx` | Hover, fetch |
| `share-buttons.tsx` | Copy state |
| `loading.tsx` | Skeleton animation |

**Assessment:** ✅ Generally correct. Pages are RSC; interactive pieces are client. Some components could be split (e.g., static parts of AuctionCard as RSC, interactive overlay as client).

---

## 4. Server Actions

| File | Actions |
|------|---------|
| `app/auctions/actions.ts` | placeBid, quickBid, executeBuyNow, setAutoBid |
| `app/u/[handle]/actions.ts` | follow, unfollow |
| `app/settings/actions.ts` | updateProfile |
| `app/sell/actions.ts` | createAuction (wizard) |
| `app/garage/actions.ts` | addGarageCar |
| `app/explore/actions.ts` | createPost, likePost, unlikePost, createComment |

**Pattern:** FormData input, Zod validation, `getSession()`, `revalidatePath()`. ✅ Consistent.

---

## 5. Framer Motion Usage

| Component | Pattern |
|-----------|---------|
| `AppSidebar.tsx` | `motion.div` with whileHover, whileTap (scale) |
| `auction-card.tsx` | `motion.div` with initial, animate, whileHover |
| `CarastaLayout.tsx` | `motion.header` for scroll-based styling |
| `community-feed.tsx` | `motion.div` for list animation |
| `ShowroomHero.tsx` | `motion.div` for overlay fade-in |
| `ReserveMeter.tsx` | `motion.div` for progress bar |
| `GarageCard3D.tsx` | `motion.div` for 3D tilt |
| `GarageShowroom.tsx` | `motion.div` for stagger |
| `loading.tsx` | `motion.div`, `motion.p` for skeleton |

**Assessment:** ✅ Appropriate use. No heavy layout animations. Consider extracting shared variants to `lib/motion.ts` for consistency.

---

## 6. Database Schema Gaps (Relative to Typical Roadmap)

| Gap | Severity | Recommendation |
|-----|----------|----------------|
| Auction.status as String | Low | Convert to `enum AuctionStatus` |
| No composite (status, endAt) on Auction | Medium | Add for "LIVE ending soon" queries |
| getAuctionHighBid called per auction on home | High | Denormalize `highBidCents` on Auction or use single aggregated query |
| Comment missing authorId index | Low | Add if filtering by author |
| Notification.readAt semantics | Low | Clarify: boolean vs timestamp |
| User.image vs avatarUrl | Low | Align with NextAuth; prefer single source |
| No full-text search indexes | Future | Add for auction/post search at scale |

---

## 7. Missing Indexes

| Model | Missing Index | Use Case |
|-------|---------------|----------|
| Auction | `@@index([status, endAt])` | Sneak peek, ending-soon filters |
| Auction | `@@index([status, createdAt])` | Recent live auctions |
| Bid | `@@index([auctionId, amountCents])` | Top bid lookup (covered by auctionId + orderBy) |
| Post | `@@index([createdAt])` | Already present |
| Notification | `@@index([userId, readAt])` | Unread notifications |

---

## 8. Performance Bottlenecks

### 8.1 N+1 Queries
1. **Home page `getFeaturedAuctions()`** — Calls `getAuctionHighBid(a.id)` for each of 5 auctions in `Promise.all`. Each is a separate `prisma.bid.findFirst`. **Fix:** Single query with aggregation or denormalize.
2. **Explore feed `/api/explore/feed`** — For each post, `prisma.like.findUnique` to check `liked`. **Fix:** Batch fetch likes for user+posts, or use `include` with filter.
3. **API `/api/auctions/[id]`** — Fetches auction with bids, then `getAuctionHighBid(id)` again, then `prisma.bid.count`. Redundant; high bid is in `bids[0]`, count in `_count.bids`.

### 8.2 Redundant Fetches
- **Auction API route:** Includes `bids` with take:1, then calls `getAuctionHighBid` (duplicate) and `prisma.bid.count` (could use `_count`).

### 8.3 Polling
- `AuctionDetailClient` polls `/api/auctions/[id]` every 4s when Pusher not configured. Acceptable for demo; consider longer interval or SSE for production.

---

## 9. Anti-Patterns

| Anti-Pattern | Location | Recommendation |
|--------------|----------|----------------|
| `(session.user as any)` | Multiple files | Extend NextAuth types in `types/next-auth.d.ts`; use typed session |
| Dynamic import in hot path | `getFeaturedAuctions` imports `getAuctionHighBid` inside function | Import at top level |
| Silent catch on home page | `app/page.tsx` catch returns empty arrays | Keep logging; consider error boundary or fallback UI |
| Mixed container classes | `carasta-container` vs `container mx-auto` | Standardize on one (e.g. `carasta-container`) |
| `unoptimized` on Next/Image | AuctionCard, AuctionImageStrip | Add remote patterns for auction image hosts; enable optimization |
| `images.unoptimized: true` in next.config | Global | Remove when image hosts are configured |

---

## 10. File Structure Assessment

### Current Structure
```
app/
  (auth)/auth/sign-in, sign-up
  (auth)/contact, terms, privacy
  admin/, auctions/, explore/, merch/, sell/, settings/
  garage/add, dream/add
  u/[handle]/, u/[handle]/garage, dream, listings
  api/auctions/[id], auth/[...nextauth], contact, explore/feed, explore/trending-dream
components/
  auction/, carasta/, garage/, layout/, profile/, ui/
lib/
  auth.ts, db.ts, utils.ts, auction-utils.ts, pusher.ts, scraper/
styles/
  carasta.css
```

### Gaps
- No `app/(marketing)` or `(dashboard)` route groups
- No `lib/validations/` or `lib/schemas/` for shared Zod schemas
- No `hooks/` for shared client hooks
- Actions colocated with routes (good) but no `actions/` barrel
- `components/home/` mixes layout (ShowroomHero) and feature (AuctionImageStrip)

---

## 11. Recommended Structural Changes (Before Feature Expansion)

### 11.1 Migration Plan Order
1. **Phase 1 — Low-risk schema & perf**
   - Add `@@index([status, endAt])` and `@@index([status, createdAt])` on Auction
   - Fix N+1 in `getFeaturedAuctions` (single query or denormalize)
   - Fix explore feed N+1 (batch likes)
   - Fix auction API route redundancy
2. **Phase 2 — Type safety**
   - Extend NextAuth types; remove `as any` on session
   - Add `enum AuctionStatus` to Prisma
3. **Phase 3 — Structure**
   - Introduce route groups: `(marketing)`, `(app)`, `(auth)`
   - Create `lib/validations/` for Zod schemas
   - Create `hooks/` for shared client hooks
4. **Phase 4 — Scalability**
   - Extract shared UI patterns to `components/patterns/`
   - Add `lib/motion.ts` for Framer variants
   - Consider `highBidCents` denormalization if bidding load increases

### 11.2 Proposed Folder Architecture
```
app/
  (marketing)/          # Public: /, /auctions, /explore, /contact
  (app)/               # Authenticated: /sell, /settings, /u/[handle]/*
  (auth)/              # sign-in, sign-up
  (admin)/             # /admin
  api/
lib/
  validations/         # Zod schemas shared by actions + API
  hooks/               # useSessionUser, useToast, etc.
components/
  ui/                  # Primitives (unchanged)
  patterns/            # PageSection, DataGrid, FormSection
  features/            # auction/, garage/, explore/, auth/
  layout/              # AppSidebar, Nav, CarastaLayout
```

### 11.3 Shared UI Component Strategy
- **Container:** Single `Container` component wrapping `carasta-container` + optional max-width variants
- **Section:** `Section` with title, subtitle, optional action (for "Sneak Peek", "Live Auctions", etc.)
- **Card:** Standardize `AuctionCard`, `GarageCard`, `PostCard` with shared base (image, overlay, actions)
- **Forms:** Shared `FormField`, `FormActions` used by sign-up, settings, create-post, etc.
- **Motion:** `lib/motion.ts` with `fadeIn`, `staggerChildren`, `hoverScale` variants

---

## 12. Architecture Stability Confirmation

| Criterion | Status |
|-----------|--------|
| App Router usage | ✅ Stable |
| RSC / Client split | ✅ Correct pattern |
| Prisma schema | ⚠️ Minor gaps; indexes + enum recommended |
| Server Actions | ✅ Consistent |
| State management | ✅ Local state sufficient for current scope |
| Auth flow | ✅ NextAuth + middleware correct |
| API design | ⚠️ Some redundancy; fix N+1 |

**Verdict:** Architecture is **stable enough to proceed** with feature expansion after addressing Phase 1 (indexes + N+1 fixes). Phases 2–4 can be done incrementally alongside new features.

---

## 13. Pre-Expansion Checklist

- [ ] Add Auction composite indexes (status+endAt, status+createdAt)
- [ ] Fix getFeaturedAuctions N+1 (aggregate or denormalize)
- [ ] Fix explore feed N+1 (batch like check)
- [ ] Fix auction API route redundancy
- [ ] Extend NextAuth types; remove session `as any`
- [ ] Add `enum AuctionStatus` to schema (optional, low priority)
- [ ] Document `carasta-container` vs `container` usage
- [ ] Enable Next/Image optimization for known hosts

---

*End of Architecture Audit Report*
