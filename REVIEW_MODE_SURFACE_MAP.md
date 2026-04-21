# Review Mode Surface Map

This document is a reviewer-facing packet for temporary review mode.

Use it to understand:
- which routes are worth reviewing
- what demo/seeded context is being shown
- which interactions are read-only
- what critique areas are most valuable

## Global Caveats
- Review mode is temporary and env-gated.
- Demo/seeded data is intentionally used where empty surfaces would weaken review usefulness.
- Some actions are intentionally disabled in review mode.
- Seller tooling remains web-first and is not mirrored in app here.
- Admin pages exposed in review mode are for review only and are not intended as permanent public surfaces.

## Public-facing experience

### Homepage
- Route: `/`
- Surface name: Homepage
- Intended purpose: First-impression public product story and navigation surface
- Seeded/demo assumptions: Uses current public content system plus live or fallback marketplace data
- Known limitations in review mode: Marketplace depth depends on seeded live auctions
- High-value review questions:
  - Is the visual hierarchy clear?
  - Does the site feel Carmunity-first?
  - Is navigation obvious?
  - Does it feel trustworthy and polished?

### How It Works
- Route: `/how-it-works`
- Surface name: How It Works
- Intended purpose: Public explanation of how the product fits together
- Seeded/demo assumptions: Static content grounded in current product surfaces
- Known limitations in review mode: None beyond content maturity
- High-value review questions:
  - Is the workflow explanation clear?
  - Is the page readable and useful?
  - Does it reduce product confusion?

### Why Carasta
- Route: `/why-carasta`
- Surface name: Why Carasta
- Intended purpose: Public differentiation / product-story page
- Seeded/demo assumptions: Static content from approved public-story work
- Known limitations in review mode: None beyond content maturity
- High-value review questions:
  - Does the differentiation feel real?
  - Is the tone credible?
  - Does it support the broader product identity?

### Resources
- Route: `/resources`
- Surface name: Resources
- Intended purpose: Public help and knowledge directory
- Seeded/demo assumptions: Static public support corpus
- Known limitations in review mode: None beyond current corpus breadth
- High-value review questions:
  - Is the information architecture clear?
  - Is the page easy to scan?
  - Does it look like a real help layer?

### FAQ
- Route: `/resources/faq`
- Surface name: FAQ
- Intended purpose: Fast-answer public help surface
- Seeded/demo assumptions: Static FAQ content
- Known limitations in review mode: Not exhaustive
- High-value review questions:
  - Are the answers useful?
  - Are they too shallow or just right?
  - Does the page feel retrieval-friendly?

### Trust and Safety
- Route: `/resources/trust-and-safety`
- Surface name: Trust & Safety
- Intended purpose: Trust boundaries, support routing, and safety posture
- Seeded/demo assumptions: Static trust guidance
- Known limitations in review mode: Legal pages are still not final production policy docs
- High-value review questions:
  - Does it feel responsible and professional?
  - Are boundaries clear?
  - Is escalation guidance useful?

### Contact
- Route: `/contact`
- Surface name: Contact
- Intended purpose: Direct escalation path
- Seeded/demo assumptions: Live contact form plus review-mode public help context
- Known limitations in review mode: Not meant to simulate a full support operation
- High-value review questions:
  - Is it obvious when to contact?
  - Does it feel like a real support path?
  - Is the page reassuring and clear?

## Social / community surfaces

### Carmunity
- Route: `/explore`
- Surface name: Carmunity
- Intended purpose: Primary social/community feed
- Seeded/demo assumptions: Seeded/demo content where available
- Known limitations in review mode: Activity level depends on seeded posts
- High-value review questions:
  - Does it feel alive?
  - Is the social identity clear?
  - Is navigation between surfaces intuitive?

### Discussions landing
- Route: `/discussions`
- Surface name: Discussions landing
- Intended purpose: Public discussion discovery / taxonomy surface
- Seeded/demo assumptions: Seeded discussion users/threads/taxonomy
- Known limitations in review mode: No real user scale
- High-value review questions:
  - Is thread discovery clear?
  - Does the taxonomy make sense?
  - Does it feel mature enough?

### Representative discussion thread
- Route: dynamic seeded review-mode thread
- Surface name: Discussion thread
- Intended purpose: Full thread/reply review surface
- Seeded/demo assumptions: Seeded demo thread and replies
- Known limitations in review mode: Demo conversation only
- High-value review questions:
  - Is the thread readable?
  - Are moderation/report controls understandable?
  - Does the thread feel socially credible?

### Demo profile
- Route: `/u/nina_shift` (or current review-mode profile handle)
- Surface name: Profile page
- Intended purpose: Identity/trust/profile/garage-adjacent surface
- Seeded/demo assumptions: Seeded demo user/profile activity
- Known limitations in review mode: Demo profile, not real social graph depth
- High-value review questions:
  - Does the identity model feel rich?
  - Are trust cues strong enough?
  - Does the profile feel useful beyond vanity?

### Seller listings page
- Route: `/u/trackdaytom/listings` (or current review-mode seller handle)
- Surface name: Seller listings page
- Intended purpose: Seller-owned listing review surface
- Seeded/demo assumptions: Seeded live auctions
- Known limitations in review mode: Temporarily exposed through review mode
- High-value review questions:
  - Are listing cards readable and useful?
  - Does the seller-owned route feel coherent?
  - Is the page worth reviewing in its current state?

## Messaging

### Conversations list
- Route: `/messages`
- Surface name: Messages list
- Intended purpose: Private 1:1 conversation list
- Seeded/demo assumptions: Seeded review-mode conversation
- Known limitations in review mode: Sending is disabled
- High-value review questions:
  - Is the list easy to scan?
  - Does the empty/populated state feel good?
  - Is read-only preview behavior clear?

### Seeded listing-scoped conversation
- Route: `/messages/<seeded_conversation_id>`
- Surface name: Listing-scoped message thread
- Intended purpose: Review a message thread tied to a listing
- Seeded/demo assumptions: Seeded demo conversation and messages
- Known limitations in review mode: Sending is disabled
- High-value review questions:
  - Is the thread readable?
  - Does the listing context help?
  - Does the surface feel like product, not mockup?

## Seller workspace

### Seller marketing overview
- Route: `/u/trackdaytom/marketing`
- Surface name: Seller growth workspace overview
- Intended purpose: Portfolio-level seller command center
- Seeded/demo assumptions: Seeded live listing, seeded campaign, seeded traffic, seeded notification
- Known limitations in review mode: Demo-only traffic and campaign context
- High-value review questions:
  - Is the hierarchy strong?
  - Does it feel analytical and premium?
  - Is it action-oriented?
  - Does it feel meaningfully different from a dashboard dump?

### Per-listing marketing workspace
- Route: `/u/trackdaytom/marketing/auctions/<seeded_auction_id>`
- Surface name: Per-listing seller workspace
- Intended purpose: Managed active-campaign workspace for one listing
- Seeded/demo assumptions: Seeded plan, tasks, artifacts, promo post, traffic, and conversation context
- Known limitations in review mode: Some actions are preview-only or read-only
- High-value review questions:
  - Is the top fold decision-oriented?
  - Do the modules feel useful?
  - Does AI feel embedded in workflow?
  - Does the surface feel premium and coherent?

### Public listing detail for seller review context
- Route: `/auctions/<seeded_auction_id>`
- Surface name: Public listing detail
- Intended purpose: Public-facing listing the seller workspace is built around
- Seeded/demo assumptions: Same seeded live listing
- Known limitations in review mode: Demo listing only
- High-value review questions:
  - Does the public listing feel strong enough?
  - Are seller/public surfaces coherent together?
  - Is the trust posture adequate?

## Admin surfaces

### Admin home
- Route: `/admin`
- Surface name: Admin home
- Intended purpose: Top-level admin summary and navigation surface
- Seeded/demo assumptions: Seeded users, live auctions, and aggregate data
- Known limitations in review mode: Review-only exposure
- High-value review questions:
  - Is the admin UX clear?
  - Is the summary useful?
  - Does it feel reviewable and intentional?

### Admin marketing
- Route: `/admin/marketing`
- Surface name: Admin marketing
- Intended purpose: Platform-wide marketing review surface
- Seeded/demo assumptions: Seeded marketing traffic / campaign / notification context
- Known limitations in review mode: Review-only exposure
- High-value review questions:
  - Is the data hierarchy clear?
  - Does the page feel admin-appropriate?
  - Is the density manageable?

### Discussion moderation
- Route: `/admin/moderation/discussions`
- Surface name: Discussion moderation
- Intended purpose: Admin moderation queue review surface
- Seeded/demo assumptions: Seeded demo discussion report
- Known limitations in review mode: Mutation controls are disabled
- High-value review questions:
  - Is the moderation workflow understandable?
  - Does it surface enough context?
  - Is read-only preview behavior clear?

## Assistant

### Assistant launcher
- Route: global launcher, appears across the web product
- Surface name: Carasta Assistant
- Intended purpose: Bounded, retrieval-grounded product/workflow help
- Seeded/demo assumptions: Uses curated assistant docs, not account data
- Known limitations in review mode: No account-specific support, no personalization
- High-value review questions:
  - Does it feel clearly bounded?
  - Are answers useful and well-grounded?
  - Are citations helpful?
  - Does the fallback behavior feel responsible?

### Suggested assistant test prompts
- What is Carasta?
- What is Carmunity?
- How do forums work on Carasta?
- Where do seller tools live?
- Where do I find notifications or settings?
- Where should I go if the assistant cannot verify my account situation?

## Known limitations in review mode
- Message send is disabled
- Notification read actions are preview-only
- Admin moderation mutation actions are disabled
- Some routes are temporarily more permissive than they would be in production
- Seller tooling is intentionally web-first and not mirrored in app here

## Routes not especially useful to review yet
- Any route that depends on real account-specific state beyond seeded/demo assumptions
- Any production-grade support/account workflow that would require real users or real PII
- Broad app-only parity surfaces that are intentionally out of scope for this web-first review stage
