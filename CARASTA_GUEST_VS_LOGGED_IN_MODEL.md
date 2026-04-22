# Carasta Guest vs Logged-in Experience Model

This document defines: **logged-in navigation + flow**, **public/guest experience**, and the **guest preview + participation gating** rules, including how system banners/teasers support conversion.

---

## 1) Logged-in experience model (recommended)

### Top-level nav (signed-in)
- **Carmunity** (default landing)
- **Market**
- **Resources**
- **Avatar/User menu** (account + personal utilities)

### What belongs under each pillar

#### Carmunity (signed-in)
Primary: daily habit + community loop.
- **Feed / Explore** (default)
- **Forums / Spaces**
- **Create** (post composer / media upload entry)
- **Garage** (identity surface)
- **Notifications** (if not global; otherwise in avatar)
- **Profile** (either in a “You” area or “Garage”)

**Carmunity “definition of done” for v1 nav:** a user can land, browse, create, join discussions, and manage their identity without feeling “sent to the marketplace.”

#### Market (signed-in)
Primary: commerce + seller workflows.
- **Live auctions** (also accessible via global live banner)
- **Browse / Search**
- **Listing detail**
- **Bid / buy flows**
- **Sell** (create listing / auctions)
- **Seller tools** (AI-enhanced marketing & pricing, later expansions)
- **Watchlist / Saved** (can be in Market or in avatar if cross-pillar)

#### Resources (signed-in)
Primary: trust + help.
- **Guides** (buyer/seller)
- **Safety / policies**
- **Support**
- **How it works**

### What should stay in avatar/user menu only
Avoid clutter by keeping “utilities” out of the main pillar nav.
- Account settings
- Billing / subscription (if any)
- Saved (if cross-pillar)
- Privacy controls
- Admin/mod tools (role-gated)
- Sign out

---

## 2) Logged-out / public experience model (hybrid)

### Public top-level nav (guest)
- **Carmunity (Preview)**
- **Market (Browse)**
- **Resources**
- **Sign in / Join**

### Landing page role (public)
The public homepage is a **conversion landing**, not a feed.

**Homepage content hierarchy (recommended):**
1. **Brand promise**: social-first car platform; Carmunity centerpiece.
2. **Social proof**: rotating “real” Carmunity previews (posts, threads, garages).
3. **Market trust**: live auction presence + credibility cues.
4. **AI seller value**: “sell smarter” positioning + example outputs.
5. **Join CTA**: repeated, contextual CTAs (Join to react/comment, Join to follow, Join for seller AI tools).

### Public Carmunity preview behavior
Public users should be able to **preview** Carmunity content to understand identity and momentum, but must not be allowed to participate.

**Public can browse (recommended):**
- Feed preview (limited)
- Post detail (limited)
- Forum threads preview (limited)
- Public profiles + garages (limited)

**Public cannot do (hard block):**
- React, comment, reply, repost/share-within-platform actions
- Create posts/threads
- Follow users
- Send messages

### Public Market visibility
Public should be allowed to browse enough of Market to build trust and intent:
- Browse/search listings
- View listing detail
- View live auctions

But require sign-up for transactional intent:
- Bidding / purchasing / watchlist / saving
- Seller creation flows and tools

### Public AI/seller value positioning
AI is **marketed publicly**, but framed as “seller advantage” and “trust uplift,” not the identity center.
- Public teaser: “AI helps sellers price, describe, and market accurately.”
- Deep value behind sign-up: interactive assistant + seller workflows.

---

## 3) Guest preview + participation gating (rule set)

### Core rule: preview is allowed; participation requires account
- **Preview allowed**: browsing limited Carmunity + Market catalog.
- **Participation blocked** while logged out: any action that creates/changes social state or transaction state.

### “What is visible / limited / blocked”

#### Visible (no wall)
- Public homepage / landing
- Resources pages (most should be fully open)
- Market browse + listing/auction detail pages (read-only)
- Carmunity preview surfaces (see limits below)
- Deep-linked content (shared links) should resolve to **read-only** view

#### Limited (metered)
Introduce a **guest meter** that triggers a sign-up wall after meaningful sampling.
- Carmunity feed: limited number of post impressions (e.g., first N cards)
- Post detail: limited number of post detail views
- Forum threads: limited number of thread views
- Profile/garage: limited number of profiles viewed

**Meter behavior (recommended):**
- Count by “content views,” not time.
- Separate meters per surface if helpful (Feed vs Post detail), but keep it simple for v1.
- Reset window (e.g., daily/weekly) is a product tuning lever.

#### Fully blocked (requires sign-up immediately)
Hard-gate these actions with an interrupting auth modal/wall:
- Reacting (like/upvote/etc.)
- Commenting/replying
- Posting/creating threads
- Following
- Saving/watchlist
- Bidding/buying/selling
- Using interactive AI tools (beyond a static teaser)

### Where sign-up prompts should appear
Use prompts that match intent:
- **Inline disabled controls**: reaction/comment UI visible but disabled with “Join to react/comment”
- **End-of-feed wall**: after N preview items, replace with a strong “Join Carmunity” wall
- **On attempt**: clicking a blocked action opens sign-in/join modal
- **Sticky but minimal CTA**: in guest mode, a persistent “Join” button in header is fine; avoid heavy popups

### Traffic, sharing, engagement implications
- **Sharing works**: deep links load read-only content (good for distribution).
- **Conversation converts**: guest sees enough context to want to join, but can’t participate.
- **Market intent converts**: browse is open; bidding/saving triggers sign-up at high-intent moment.

---

## 4) Role of homepage vs Carmunity vs Market vs Resources (public)

### Public homepage = the orchestrator
It should blend:
- **Brand**: who Carasta is
- **Social identity**: Carmunity preview (primary)
- **Marketplace trust**: Market credibility + live auction moment
- **AI seller value**: premium differentiator (secondary headline)

### Carmunity preview = the hook
Primary conversion driver: “real people + real cars + real conversation.”

### Market browse = the credibility + monetization proof
Supports: “this isn’t just social—it’s connected to real commerce.”

### Resources = trust & risk reduction
Supports conversion for cautious buyers/sellers and improves SEO durability.

---

## 5) Top banner + public teaser system (two rails, no clutter)

### A) Permanent top live-auction banner (system rail)
**Placement:** global on major surfaces; suppressed on focus-critical flows.
**Behavior by auth state:**
- Logged-in: links into Market live auctions and personalized watch items if applicable.
- Logged-out: links into public Market live auction browse/detail (read-only).

### B) Public social teaser band (secondary rail)
**Goal:** reinforce Carmunity momentum during public browsing without hijacking the page.

**Where it belongs:**
- Public homepage (below hero)
- Public Market pages (optional, low height): “From Carmunity” snippet carousel
- Resources pages (optional): “Join the discussion” snippet

**How it avoids conflict with top banner:**
- Not fixed/sticky (or only lightly sticky on scroll boundaries).
- Visually subordinate to the top banner.
- Keeps CTA consistent: “Join to react/comment.”

---

## 6) AI positioning in the experience model (public + signed-in)

### Public
- AI is a **value pillar**: “premium seller advantage,” “better listings,” “higher trust.”
- Allow **static examples** and **light teaser** (non-interactive or limited) without shifting focus from Carmunity.

### Logged-in
- AI should appear as:
  - **Contextual helper** inside seller flows (Market → Sell, marketing, pricing)
  - **Optional assistant** launch affordance (global utility)
  - **Content helper** for creators (drafting, summarizing) if/when introduced

**Avoid:** making AI a top-level nav item competing with Carmunity.

