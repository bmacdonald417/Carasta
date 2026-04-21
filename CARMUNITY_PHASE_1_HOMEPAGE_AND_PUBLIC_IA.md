# Carmunity Phase 1: Homepage and Public IA

## Summary
This phase implemented the approved homepage and public IA restructuring so Carasta now reads more clearly as:

- Carmunity-first
- marketplace-proven
- seller-intelligent

The implementation stayed within Phase 1 scope. It reordered the homepage, strengthened the public story, improved the public navigation structure, added lightweight public resource scaffolding, and removed a weak trust-breaking homepage section.

## Files Created
- `components/home/HomePublicSections.tsx`
- `app/(marketing)/why-carasta/page.tsx`
- `app/(marketing)/resources/page.tsx`
- `app/(marketing)/resources/faq/page.tsx`
- `CARMUNITY_PHASE_1_HOMEPAGE_AND_PUBLIC_IA.md`

## Files Modified
- `app/(marketing)/page.tsx`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/how-it-works/page.tsx`
- `components/carasta/CarastaLayout.tsx`
- `components/home/HomeStatsStrip.tsx`
- `components/home/LiveActivityFeed.tsx`
- `components/how-it-works/how-it-works-sections.ts`
- `components/layout/MobileBottomNav.tsx`

## Homepage Section Order
### Before
1. `AuctionImageStrip`
2. `ShowroomHero`
3. `HomeStatsStrip`
4. `LiveActivityFeed`
5. `Ending Soon`
6. `Recently Added`
7. `InstagramShowcase`
8. closing value proposition + app download

### After
1. `AuctionImageStrip`
2. new Carmunity-first hero / brand statement
3. product pillars / ecosystem band
4. platform activity / proof section
5. why Carasta is different
6. live marketplace proof intro + moved `ShowroomHero`
7. `Ending Soon`
8. `Recently Added`
9. seller tools / intelligence teaser
10. how it works snapshot
11. trust / support / resources CTA band

## Key Copy and Story Changes
- Replaced the auction-first opening with a Carmunity-first hero that explains the platform before the marketplace.
- Reframed Carasta as a connected system for Carmunity, Discussions, Messages, profiles, Garage identity, auctions, and seller tools.
- Reduced app-download-first framing on the homepage and footer.
- Kept the enthusiast tone, but removed launch-style and placeholder-style messaging.
- Clarified that live auctions are proof of platform maturity, not the only story.
- Added stronger public language around seller intelligence without overbuilding the seller workspace in this phase.

## Navigation and IA Changes
- Updated the public header to center public product-story links:
  - `Home`
  - `How It Works`
  - `Why Carasta`
  - `Resources`
  - `Contact`
- Removed `Terms` and `Privacy` from the top header so legal drafts are no longer over-weighted in the primary nav.
- Kept product entry points visible in the header through:
  - `Carmunity`
  - `Discussions`
  - `Auctions`
  - `Sell`
- Added a `Messages` quick path for signed-in users in the header action area.
- Expanded the footer into a clearer public IA surface with marketing links, product links, and contact.
- Updated the mobile bottom nav to emphasize `Sell` instead of `Merch` to better align with the current product story.

## Weak Sections Removed or Replaced
- Removed `InstagramShowcase` from the homepage flow.
  - Reason: it relied on mock social content and weakened trust.
- Removed the closing homepage block that over-emphasized app download framing.
  - Replaced with seller, how-it-works, and support/resource sections that better reflect platform maturity.

## Public Scaffolding Added
- Added `Why Carasta` page:
  - `app/(marketing)/why-carasta/page.tsx`
- Added `Resources` landing page:
  - `app/(marketing)/resources/page.tsx`
- Added `FAQ` page under Resources:
  - `app/(marketing)/resources/faq/page.tsx`
- Upgraded `How It Works` so it explains the public product more broadly, not just auction mechanics.
- Strengthened `Contact` so it now connects into the public resource/support path.

## App / Site Parity Notes
- Kept shared product vocabulary aligned around:
  - `Carmunity`
  - `Discussions`
  - `Messages`
  - `Profiles`
  - `Garage`
  - `Notifications`
- Standardized `Discussions` in the touched public surfaces and did not introduce new terminology drift.
- Kept seller tooling positioned as a shared product differentiator while remaining intentionally web-first.
- Did not begin mobile implementation work beyond a small nav alignment improvement (`Sell` replacing `Merch` in the mobile bottom nav).

## Validation Notes
- `npm run lint` completed successfully.
- `npx tsc --noEmit` completed successfully.
- Verified local route responses for:
  - `/`
  - `/why-carasta`
  - `/resources`
  - `/resources/faq`
  - `/how-it-works`
  - `/contact`
  - `/auctions`
  - `/explore`
  - `/discussions`
- Verified the homepage HTML includes the new major section markers and Carmunity-first lead message.

## Intentionally Deferred
- Full design-system conversion to a lighter global theme
- Full seller workspace redesign
- Full trust/legal content rewrite beyond IA and placement improvements
- Richer support corpus pages such as:
  - buying guide
  - selling guide
  - glossary
  - deeper trust content
- Mobile parity work beyond terminology and nav alignment
- Assistant/help system implementation

## Recommendation for the Next Implementation Phase
### Phase 2
Public content system and trust layer

### Recommended scope
- expand `Resources` into a richer public knowledge layer
- add buying and selling guides
- add a platform glossary
- deepen FAQ and support content
- turn legal draft pages into more clearly owned trust workstreams
- prepare these pages to become the future assistant knowledge corpus
