# Carasta Homepage and Content Plan

## Scope
This document covers:
- current homepage and public IA audit,
- live `carasta.com` content extraction,
- recommended homepage structure for the new site,
- content architecture recommendations,
- navigation/header recommendations,
- keep / move / redesign / remove guidance tied to current files.

## Current New-Site Homepage Audit
Route: `app/(marketing)/page.tsx`

### Current section order and assessment
1. `AuctionImageStrip`
   - Status: **keep**
   - Reason: this is one of the most distinctive and kinetic homepage elements, and it satisfies the requirement to keep the scrolling car banner at the top.

2. `ShowroomHero`
   - Status: **keep but move lower**
   - Reason: it is visually strong, but it currently dominates first impression and makes the site feel auction-first before users understand the broader product.

3. `HomeStatsStrip`
   - Status: **keep, possibly restyled**
   - Reason: it adds proof of traction and helps bridge social plus marketplace signals.

4. `LiveActivityFeed`
   - Status: **keep, reposition and widen**
   - Reason: it is one of the best “alive right now” indicators in the product, but it is currently visually secondary and spatially narrow.

5. `Ending Soon` and `Recently Added`
   - Status: **keep lower**
   - Reason: strong proof of marketplace activity, but they should validate the platform later on the page rather than define it at the top.

6. `InstagramShowcase`
   - Status: **redesign or replace**
   - Reason: it currently uses mock content and weakens trust. The concept of social proof is good; the current implementation is not.

7. Closing value prop + app download
   - Status: **merge / simplify**
   - Reason: the current message duplicates earlier value-prop territory and can be absorbed into a more intentional CTA structure.

## Current Public IA Audit
### Existing public navigation
From `components/carasta/CarastaLayout.tsx`:
- `Home`
- `How It Works`
- `Contact`
- `Terms`
- `Privacy`
- `Carmunity`
- `Discussions`
- `Auctions`
- `Sell`
- `Messages`
- notification bell
- profile menu

### Current IA strengths
- It surfaces both public and logged-in product areas.
- It already names the ecosystem clearly enough to support a broader product narrative.
- It acknowledges that Carasta is more than auctions.

### Current IA problems
- Marketing pages and application pages are mixed into one top nav with little hierarchy.
- Legal pages are surfaced prominently, but they are still draft outlines.
- `Garage` is important conceptually but under-exposed in public navigation.
- There is no richer public “resources/help/FAQ/platform concepts” layer.
- `Messages` is top-level, but there is not yet an assistant/help layer to complement it.

## Live Public Site Extraction
### Current live-site page inventory
Observed public pages during this audit:
- `https://www.carasta.com/`
- `https://www.carasta.com/contact`

Observed missing or non-public pages during this audit:
- `https://www.carasta.com/how-it-works` returned `404`
- `https://www.carasta.com/about` returned `404`
- likely legal pages are not exposed as clean standalone routes in the same way as the new app

Implication:
- the live public site currently behaves more like a marketing landing site with a contact page than a fully developed public information architecture.

### What the live site currently communicates well
From `https://www.carasta.com/` and `https://www.carasta.com/contact`:
- Carasta is “The Social Network for Car Enthusiasts.”
- Carmunity is a first-class identity concept.
- Profiles, garages, and dream garages matter.
- Auctions are part of a larger enthusiast environment.
- “Built by Enthusiasts, for Enthusiasts” is still a strong brand line.
- “Trusted transactions” through Caramel is a trust-building message.

### What on the live site is worth porting conceptually
- “What is Carasta?” explanatory content
- “Why Carasta is Different?” differentiation framing
- the three-part “How Carasta Works” model:
  - create profile / garage
  - explore Carmunity
  - list, browse, bid, buy
- the community-first language around enthusiasts, profiles, and passion
- partnership/contact language for dealerships and partnerships

### What should be rewritten, not copied
- repetitive launch-style headline stacks
- thin generic contact/about language
- app-download-first framing
- dated or awkward phrasing
- any launch-soon positioning that no longer fits current product maturity

### What should be retired
- any copy that implies auctions are mostly future-state if the new product already supports them
- any content structure that behaves like a single landing page instead of a proper public product site

### Content disposition recommendation
- Port directly in concept:
  - Carmunity-first framing
  - profiles, garage, dream garage
  - built-by-enthusiasts positioning
  - transparent auction mechanics
- Rewrite substantially:
  - homepage value proposition
  - contact/about copy
  - how-it-works explanation
  - dealership outreach language
- Merge into stronger new pages:
  - “What is Carasta?” + “Why Carasta is Different?” into `Home` and `Why Carasta`
  - live-site how-it-works concepts into a fuller `How It Works`
  - support-like snippets into a future `Resources` / `FAQ` structure
- Retire:
  - launch-style repetitive headline stacks
  - app-download-heavy framing as the primary public story

## Recommended New Public Content Architecture
### Recommended top-level public architecture
- `Home`
- `How It Works`
- `Why Carasta`
- `Carmunity`
- `Auctions`
- `Sell`
- `Resources`
- `Contact`

`Resources` should eventually contain:
- FAQ
- platform glossary
- buying and selling basics
- policies and trust content
- support/help entry points

### Recommended header behavior
- Keep a compact public marketing nav on the left/center.
- Keep application entry points visible but grouped more intentionally.
- For signed-out users, emphasize `Join Carmunity` and `Browse Auctions`.
- For signed-in users, shift more weight to `Carmunity`, `Discussions`, `Messages`, and the user menu.

### Recommended garage treatment
Garage should be elevated as part of public messaging, but it does not need to be a main top-nav item if the homepage explains it clearly and user/profile surfaces highlight it better.

## Recommended Homepage Structure
The homepage should introduce Carasta in this order:

1. **Top scrolling vehicle banner**
   - Source: keep `AuctionImageStrip`
   - Purpose: immediate motion, proof of live inventory, recognizable signature
   - CTA: light CTA only; this should not replace the main hero narrative

2. **Carmunity-first hero / brand statement**
   - Source: new section replacing top placement of current `ShowroomHero`
   - Purpose: explain the platform before the marketplace
   - Core message: social automotive platform, discussions, messaging, profiles, garages, auctions
   - CTA:
     - primary: `Join Carmunity`
     - secondary: `Explore Discussions`
     - tertiary: `Browse Live Auctions`

3. **Product pillars band**
   - Purpose: quickly explain the ecosystem in 4 to 5 modules
   - Suggested modules:
     - Carmunity feed
     - Discussions
     - Messaging
     - Garage / profile identity
     - Auctions / sell tools
   - Reuse candidates: `HomeStatsStrip` can be reworked to support this

4. **Platform activity / proof section**
   - Purpose: show that the network is active, not conceptual
   - Suggested content:
     - social activity
     - trending discussion threads
     - marketplace metrics
   - Reuse candidates:
     - `LiveActivityFeed`
     - stats data from `getHomeStats`
   - Redesign need: should feel broader than a narrow activity column

5. **Why Carasta is different**
   - Purpose: port and modernize the strongest concepts from the live site
   - Content themes:
     - built by enthusiasts
     - transparent auction mechanics
     - community identity beyond the sale
     - seller tools and intelligent workflows
   - Draws from old site content: yes

6. **Live marketplace proof**
   - Source: current `ShowroomHero`, moved here
   - Purpose: let the marketplace validate the broader narrative
   - CTA:
     - `Browse Live Auctions`
     - `See How Bidding Works`
     - `Sell Your Car`

7. **Ending Soon / Recently Added**
   - Source: current auction sections
   - Purpose: depth and inventory proof
   - CTA: `View all live auctions`

8. **Seller intelligence / marketing workspace teaser**
   - Purpose: explain seller-side differentiation, which is currently under-told publicly
   - Content:
     - marketing planning
     - share/promote tooling
     - analytics
     - AI copilot
   - CTA:
     - `See seller tools`
     - `Start selling`

9. **How it works snapshot**
   - Purpose: concise public process explanation
   - Draw from:
     - live-site conceptual model
     - current `HowItWorksTimeline`
   - CTA: `Read How It Works`

10. **Community / trust / support CTA footer band**
   - Purpose: reinforce legitimacy, provide path to contact/resources
   - CTA:
     - `Contact`
     - `Resources`
     - `Join Carmunity`

## Section-by-Section Reuse Guidance
### Reuse largely as-is
- `AuctionImageStrip`
- data primitives behind `HomeStatsStrip`
- `LiveActivityFeed` logic
- auction listing data feeds used by current homepage

### Reuse but redesign
- `ShowroomHero`
- `HomeStatsStrip`
- `HowItWorksTimeline`
- `CarastaLayout` header grouping

### Replace or remove
- `InstagramShowcase` in its current form
- duplicated “Built by Enthusiasts, for Enthusiasts” closing section as a standalone homepage block

## Public Support / Information Plan
### Current state in new app
- `Contact` is serviceable but minimal
- `How It Works` is concise but too thin for a strong public product narrative
- `Terms`, `Privacy`, and `Community Guidelines` are draft placeholders

### Recommended additions
- `Resources` landing page
- `FAQ`
- `Platform glossary`
- `Buying on Carasta`
- `Selling on Carasta`
- `What is Carmunity?`
- `Profiles, garages, and dream garages`
- `Auctions and smart bidding tools`

These should later become the first assistant knowledge corpus.

## Recommended Copy Direction
### Brand positioning
Use language closer to:
- enthusiast network
- community for people who actually care about cars
- auctions with transparent mechanics
- profiles, garages, and conversations that outlive the transaction
- seller tools that feel intelligent, not generic

### Avoid
- launch-soon phrasing
- generic “premium marketplace” language without proof
- crypto-looking or hype-heavy copy
- over-indexing on app-download prompts

## Likely Affected Files
- `app/(marketing)/page.tsx`
- `components/home/AuctionImageStrip.tsx`
- `components/home/ShowroomHero.tsx`
- `components/home/HomeStatsStrip.tsx`
- `components/home/LiveActivityFeed.tsx`
- `components/carasta/InstagramShowcase.tsx`
- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `app/(marketing)/how-it-works/page.tsx`
- `components/how-it-works/HowItWorksTimeline.tsx`
- future public resource pages under `app/(marketing)/`

## Recommended Next Step for This Area
Implement a homepage/content architecture pass before deeper visual polish:
- reorder sections,
- write the new public story,
- create the missing public content scaffolding,
- then do visual refinement once the hierarchy is stable.
