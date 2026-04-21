# Carmunity Phase 2: Public Content and Trust

## Summary
Phase 2 expands Carasta's public content system from a light marketing layer into a more usable knowledge and trust layer.

This implementation focused on:

- clearer product explanation
- stronger public support paths
- more retrieval-friendly content structure
- more responsible trust-page framing
- a better foundation for the future Carasta Assistant knowledge base

It stayed within scope:

- no seller workspace redesign
- no assistant implementation
- no broad app implementation
- no full visual redesign

## Files Created
- `CARMUNITY_PHASE_2_PUBLIC_CONTENT_AND_TRUST.md`
- `components/resources/resource-links.ts`
- `components/resources/ResourceCardGrid.tsx`
- `components/resources/ResourcePageLayout.tsx`
- `app/(marketing)/resources/what-is-carasta/page.tsx`
- `app/(marketing)/resources/what-is-carmunity/page.tsx`
- `app/(marketing)/resources/discussions-basics/page.tsx`
- `app/(marketing)/resources/profiles-and-garage/page.tsx`
- `app/(marketing)/resources/messages-basics/page.tsx`
- `app/(marketing)/resources/auction-basics/page.tsx`
- `app/(marketing)/resources/buying-on-carasta/page.tsx`
- `app/(marketing)/resources/selling-on-carasta/page.tsx`
- `app/(marketing)/resources/glossary/page.tsx`
- `app/(marketing)/resources/trust-and-safety/page.tsx`

## Files Modified
- `app/(marketing)/how-it-works/page.tsx`
- `app/(marketing)/why-carasta/page.tsx`
- `app/(marketing)/resources/page.tsx`
- `app/(marketing)/resources/faq/page.tsx`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/community-guidelines/page.tsx`
- `components/carasta/CarastaLayout.tsx`
- `components/legal/LegalDraftBanner.tsx`

## New and Expanded Public Pages
### Expanded
- `Resources`
  - changed from a small directory into a grouped knowledge hub
- `FAQ`
  - expanded beyond the initial Phase 1 lightweight version
- `How It Works`
  - now links more intentionally into deeper guides and trust content
- `Why Carasta`
  - now connects positioning to explanatory resource pages
- `Contact`
  - now does a better job as a support entry point
- `Terms`
  - upgraded from placeholder bullets to a clearer draft structure
- `Privacy`
  - upgraded from placeholder bullets to a clearer draft structure
- `Community Guidelines`
  - upgraded from placeholder bullets to a more readable conduct structure

### Added
- `What is Carasta?`
- `What is Carmunity?`
- `Discussions basics`
- `Profiles and Garage`
- `Messages basics`
- `Auction basics`
- `Buying on Carasta`
- `Selling on Carasta`
- `Platform glossary`
- `Trust and safety`

## Content Architecture Improvements
- Added reusable public content primitives:
  - shared resource link registry
  - reusable resource card grid
  - reusable resource page layout
- Turned `Resources` into a real multi-section public knowledge directory:
  - Getting started
  - Platform concepts
  - Buying and selling
  - Trust and support
- Added stronger cross-linking so pages no longer behave like dead-end articles
- Organized content so future expansion can happen without rebuilding IA again

## Trust and Support Improvements
- Reframed legal/trust pages to be clearer and more responsible while still explicitly draft
- Replaced obvious placeholder-style sections in touched trust pages with real explanatory structure
- Added `Trust and safety` as a first-class public page
- Improved footer support linking with:
  - FAQ
  - Glossary
  - Trust & Safety
  - Get Help
- Strengthened `Contact` as the escalation path after self-serve help
- Kept trust language careful:
  - no fake guarantees
  - no overstated platform responsibility
  - no false legal finality

## Assistant-Readiness Notes
- Content is now more retrieval-friendly:
  - clearer page boundaries
  - stronger headings
  - lower ambiguity
  - concept-focused page titles
- A glossary now exists for shared terminology
- Product concepts are separated into guide pages that should chunk cleanly later
- Trust/support concepts now have public source pages instead of mostly thin scaffolding
- The content system is better positioned to become the assistant's first knowledge corpus

## App / Site Parity Notes
- Kept vocabulary aligned around:
  - `Carmunity`
  - `Discussions`
  - `Messages`
  - `Profiles`
  - `Garage`
  - `Auctions`
  - `Sell`
- Did not introduce new terminology drift
- Kept knowledge framing conceptually compatible with the app even where web content is now deeper
- No broad app work was started in this phase

## Validation Notes
- `npm run lint` completed successfully
  - existing unrelated warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Verified local route responses for:
  - `/`
  - `/resources`
  - `/resources/faq`
  - `/resources/what-is-carasta`
  - `/resources/what-is-carmunity`
  - `/resources/discussions-basics`
  - `/resources/profiles-and-garage`
  - `/resources/messages-basics`
  - `/resources/auction-basics`
  - `/resources/buying-on-carasta`
  - `/resources/selling-on-carasta`
  - `/resources/glossary`
  - `/resources/trust-and-safety`
  - `/how-it-works`
  - `/why-carasta`
  - `/contact`
  - `/terms`
  - `/privacy`
  - `/community-guidelines`
- Verified resource landing page markers for:
  - `Getting started`
  - `Platform concepts`
  - `Buying and selling`
  - `Trust and support`

## Intentionally Deferred
- Full assistant implementation
- Seller workspace redesign
- Full legal finalization
- Deep policy ownership workflows outside the touched public pages
- Broad mobile/app help implementation
- Global visual system conversion beyond what was needed for coherent content pages

## Recommendation for Phase 3
### Phase 3
Seller growth workspace redesign

### Recommended scope
- redesign seller-facing marketing/workspace hierarchy
- improve dashboard clarity and premium feel
- preserve current marketing and analytics primitives
- build on the vocabulary and trust/content foundation established in Phases 1 and 2
