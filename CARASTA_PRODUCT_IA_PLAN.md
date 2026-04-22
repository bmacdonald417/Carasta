# Carasta Product IA Plan (Carmunity-first)

**Objective:** Translate the current product direction into a clear information architecture (IA) and roadmap-aware navigation strategy for **logged-in**, **logged-out/public**, and **guest-preview** experiences.

## Non-negotiables (locked direction)
- **Social-first platform**: Carmunity is the centerpiece and default mental model.
- **AI is a cornerstone**: prominent where it helps, not the main nav “center.”
- **Market is the commerce umbrella**: all buying/selling flows live under Market.
- **Resources is the trust/help layer**: education, guides, safety, support, policies.
- **Profile access**: reachable under **Carmunity** and also in **avatar/user menu** without clutter.
- **Live auction banner**: persistent top banner where it belongs; treated as a system-level rail, not a nav item.

---

## 1) Recommended top-level IA (two modes)

### A) Logged-in IA (primary)
**Top-level navigation (recommended):**
1. **Carmunity** (default landing after login)
2. **Market**
3. **Resources**
4. **Avatar/User menu** (account + personal utilities)

**Key decision:** For signed-in users, **do not keep “Home” as a primary nav item**. Use **Carmunity as the default**.  
Rationale: “Home” becomes redundant in a social-first thesis; Carmunity *is* the home feed.

### B) Logged-out / public IA (hybrid)
**Top-level public navigation (recommended):**
1. **Carmunity (Preview)**
2. **Market (Browse)**
3. **Resources**
4. **Sign in / Join**

**Key decision:** The logged-out “home” is a **marketing landing** (brand + proof + taste of Carmunity + market trust + AI seller value), not a feed.

---

## 2) IA definitions: what each pillar means

### Carmunity (centerpiece)
**Purpose:** identity + community + social graph + discussion + discovery of people, cars, and culture.  
**Primary outcomes:** follow/engage, create posts, join discussions, build profile/garage presence.

**Likely Carmunity sub-areas:**
- **Feed / Explore** (default)
- **Forums / Spaces** (topic-first, durable discussions)
- **Garage** (your cars; show-and-tell; ownership identity)
- **Clubs / Groups** (later bucket; optional)
- **Events / Meets** (later bucket; optional)
- **Profiles** (people) and **creator/seller identity**

### Market (commerce umbrella)
**Purpose:** monetize attention and intent without becoming the product’s identity.  
**Primary outcomes:** browse listings/auctions, bid/buy/sell, seller tooling, trust & transaction flows.

**Likely Market sub-areas:**
- **Live / Auctions** (spotlighted globally via banner + Market section)
- **Browse** (categories/filters/search)
- **Sell** (create/manage listings)
- **Seller tools** (AI-assisted marketing/pricing; analytics; lead capture)
- **Watchlist / Saved**
- **Orders / Payments / Delivery** (scope depends on model; may evolve)

### Resources (trust, education, help)
**Purpose:** reduce risk, increase confidence, explain how it works, and support users.  
**Primary outcomes:** trust building, problem resolution, learning.

**Likely Resources sub-areas:**
- **Buyer guides** (inspections, bidding, ownership)
- **Seller guides** (best practices, prep, photography, compliance)
- **Safety & policies** (fraud prevention, community rules)
- **Support / Help center**
- **Glossary / vehicle education** (later)

---

## 3) Profile placement without clutter
**Recommendation:**
- **Avatar/User menu** is the primary access point for “account utilities.”
- Under **Carmunity**, include a single “Profile” entry **only where it’s contextually appropriate** (e.g., in Carmunity → “You” or “Garage”), not duplicated everywhere.

**Avatar/User menu contains (examples):**
- **Your profile** (public-facing)
- **Garage**
- **Messages/Notifications** (if/when present)
- **Saved (cross-pillar)**: posts saved + watchlist (or split if needed)
- **Settings**
- **Billing/Subscriptions** (if premium AI tools)
- **Sign out**

---

## 4) Homepage role (public vs logged-in)

### Logged-out homepage = marketing landing
**Job:** convert; explain; demonstrate value fast.
- Brand promise: “Social-first automotive platform”
- Carmunity proof: social snippets + real posts (teased)
- Market trust: live auction presence + credibility cues
- AI seller value: “sell smarter” and “market better” (teased)

### Logged-in homepage = Carmunity feed (no separate Home)
**Job:** daily habit loop.
- community feed, follow suggestions, forums highlights
- subtle Market hooks (e.g., “Live auctions now”)
- assistant availability (contextual, not demanding attention)

---

## 5) Roadmap-aware navigation strategy (stable now, expandable later)
**Principle:** Keep top-level stable (Carmunity / Market / Resources). Add future modules as **sub-areas** first, and only promote to top-level if they become the primary identity driver (unlikely vs Carmunity).

Likely future expansions that remain sub-areas:
- Clubs/Groups, Events, Messaging, Creator tools → **Carmunity**
- Buy Now/Storefront integrations, fulfillment → **Market**
- Knowledge base, glossary, VIN/vehicle education → **Resources**

---

## 6) How the live auction banner fits IA (system rail)
**Recommendation:** Treat the live auction banner as a **global system rail** that can appear on:
- all “major surfaces” (public landing, Carmunity feed, Market browse, listing detail)
- not on sensitive flows where it harms focus (checkout/payment steps, critical settings, onboarding forms)

**Why:** It’s a platform heartbeat and monetization signal, but it must not interrupt completion flows.

---

## 7) Carmunity vs Market vs Resources: practical boundaries
- **If it’s social identity or conversation → Carmunity**
- **If it’s transacting or selling tooling → Market**
- **If it’s trust/education/support/policy → Resources**

Edge case rule (important):
- Social posts that reference listings/auctions are **still Carmunity content**; the commerce object lives in **Market**. Linking is encouraged; ownership is not duplicated.

