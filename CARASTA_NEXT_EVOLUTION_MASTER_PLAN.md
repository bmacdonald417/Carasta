# Carasta Next Evolution Master Plan

## Executive Summary
Carasta already has the core ingredients of a differentiated product: live auctions, a social feed, discussions, messaging, profiles, garages, seller marketing tooling, and two AI-assisted seller workflows. The current issue is not lack of surface area. It is product hierarchy. The new web build currently opens like an auction site with social features attached, while the live public site still explains Carasta more as an enthusiast network with auctions layered in. That mismatch creates brand drift and weakens first impression clarity.

The recommended path is to reposition the public site and homepage as **Carmunity-first, marketplace-proven, seller-intelligent**. Keep the scrolling vehicle banner at the top. Move the oversized live-auction hero lower. Lead with a stronger public explanation of what Carasta is: a social automotive platform with discussions, messaging, profiles, garage identity, and a transparent auction ecosystem. Then elevate the seller side from a functional but visually flat marketing area into a true seller growth workspace.

At the same time, the AI work should evolve in three lanes, not one:

1. `Listing AI` should become a safer enthusiast-grade drafting and readiness system.
2. `Marketing Copilot` should become a channel-specific execution planner tied to real listing context and performance context.
3. A new `Carasta Assistant` should be introduced as a site-aware, retrieval-grounded help layer for users and sellers.

The cleanest phased implementation path is:

1. public IA + homepage restructuring,
2. seller workspace redesign system,
3. AI quality/grounding upgrades,
4. Carasta Assistant MVP,
5. analytics and feedback loops.

This order minimizes rework because it stabilizes brand language, public content architecture, and seller information hierarchy before deeper AI and experience work.

## Product / Engineering Audit Summary
### Product strengths already present
- The app already supports a credible multi-surface ecosystem: `Carmunity`, `Discussions`, `Auctions`, `Sell`, `Messages`, user profiles, and garages.
- The homepage is modular and easy to reorder because it is composed from distinct components in `components/home/`.
- Seller marketing already has useful primitives: overview analytics, per-listing drill-down, campaigns, share/promo bundles, Carmunity promo posting, AI copilot, notifications, and CSV export.
- AI systems are not hand-wavy experiments. They already use guarded JSON outputs, Zod validation, feature flags, ownership checks, and audit tables.
- The repo already contains phase notes that show incremental evolution rather than ad hoc hacking, especially around seller marketing.

### Product weaknesses already present
- The homepage hierarchy is marketplace-first even though the broader product ambition is social-first.
- The current public site and the new web app are telling related but not identical stories.
- Public support and trust content are thin or draft-only in the new app: `terms`, `privacy`, and `community-guidelines` are explicitly placeholders.
- The seller marketing area is useful but does not feel premium, analytical, or alive; it reads as a stack of dark cards and tables rather than a cohesive workspace.
- The design system is split across semantic tokens and older branded CSS, with hardcoded red values still embedded in marketing pages and components.
- The assistant/help layer does not yet exist as a maintainable knowledge system.

### Current homepage audit
Current homepage route: `app/(marketing)/page.tsx`

Current section order:
1. `AuctionImageStrip`
2. `ShowroomHero`
3. `HomeStatsStrip`
4. `LiveActivityFeed`
5. `Ending Soon`
6. `Recently Added`
7. `InstagramShowcase`
8. closing value prop + app download

Assessment:
- Keep: `AuctionImageStrip` at the top, per your requirement.
- Move lower: `ShowroomHero`, because it is currently the dominant opening identity.
- Keep but restyle/reframe: `HomeStatsStrip` and `LiveActivityFeed`; both are useful proof-of-activity modules.
- Replace or redesign: `InstagramShowcase`, because it currently uses mock content and pushes external social proof harder than native Carmunity proof.
- Tighten or merge: the closing value-prop/app-download section, because its message duplicates earlier brand copy.

### Navigation / IA audit
Primary global shell lives in `components/carasta/CarastaLayout.tsx`.

Current top nav:
- marketing: `Home`, `How It Works`, `Contact`, `Terms`, `Privacy`
- app: `Carmunity`, `Discussions`, `Auctions`, `Sell`, `Messages`

Current desktop side navigation:
- primary app routes
- seller subnav under Sell: `My listings`, `Marketing`
- secondary item: `Garage`
- `Merch`

Key issues:
- Public marketing nav and app nav are visually merged into one header instead of feeling intentionally structured.
- `Garage` is discoverable in the sidebar but is not elevated as a core identity object in the public story.
- Mobile bottom nav emphasizes `Merch` but not `Sell`, which weakens seller utility on small screens.
- There is no clear public trust/resource layer beyond minimal pages.

### Social / auction / seller architecture audit
- `Carmunity` feed at `/explore` already has meaningful onboarding, following, trending, and cross-linking to discussions.
- `Discussions` are more mature than simple comments: they have taxonomy, recommendation logic, and thread discovery.
- `Messages` are in place and can anchor future assistant/help escalation.
- `Auctions` already have a serious marketplace layer with filters, reserve meter, auto-bid, map view, and analytics-backed marketing.
- Seller marketing has the deepest “unfinished opportunity”: it is structurally strong but under-designed.

### Design system audit
Relevant files:
- `styles/carmunity-tokens.css`
- `styles/carasta.css`
- `app/globals.css`
- `tailwind.config.ts`

Main finding:
- The system has semantic tokens, but the product is still visually coupled to the current dark/copper/red direction through CSS variables, old theme utilities, and hardcoded red use in seller marketing pages and supporting components.

### AI audit
The current AI stack is stronger than the public product likely communicates:
- `Listing AI` exists with multiple scopes and audit persistence.
- `Marketing Copilot` already supports generate, review, apply, regenerate, audit runs, and rate limits.
- Both use structured outputs and server-side validation.

Main gap:
- There is no shared, curated knowledge architecture yet for a site-aware assistant.

### Public content audit
The live public site at `https://www.carasta.com/` still contributes valuable positioning:
- “The Social Network for Car Enthusiasts”
- profiles + garage + dream garage
- Carmunity as a core identity concept
- transparent auctions with smart tools
- “built by enthusiasts, for enthusiasts”

What is weak or outdated on the live site:
- It behaves more like a simple launch/landing page than a mature public product site.
- Messaging is repetitive.
- It is app-download heavy and light on clear web-era IA.
- Contact/about content is simple and thin.

What is weak or missing in the new app compared with the live site:
- clear “what is Carasta” explanation
- clearer explanation of profiles / garages / dream garages / Carmunity
- a more intentional brand narrative before users hit listings
- mature public support/trust pages

## Recommended Strategic Direction
### Recommended path
Position Carasta as:
- a social-first enthusiast platform,
- with discussions, messaging, identity, and garage culture,
- plus transparent auction and seller-growth tooling.

This path uses the strongest parts of both the live site and the new app:
- live site brand language,
- new app feature depth,
- existing homepage motion and auction proof,
- existing seller marketing infrastructure,
- existing AI foundations.

### Fallback path
Keep Carasta more auction-forward on the homepage, but add a stronger Carmunity explainer band above the current hero and improve public support/trust pages without materially changing the homepage skeleton.

### Tradeoffs
Recommended path:
- Pros: strongest differentiation, aligns with stated goal, best use of Carmunity/discussions/messages investment, better future fit for assistant/help UX.
- Cons: requires more content strategy work and a more deliberate homepage rewrite.

Fallback path:
- Pros: lower cost, faster to ship, less immediate homepage refactor work.
- Cons: weaker brand differentiation, higher risk that Carasta still reads as “another auction site with social extras.”

## Phased Roadmap
### Phase 1: Public story, IA, and homepage restructuring
- rewrite homepage hierarchy and copy architecture
- keep top scrolling vehicle strip
- move `ShowroomHero` lower
- add stronger Carmunity-first sections
- refresh public nav and trust/resource architecture
- port the strongest concepts from the live site into better modern copy

### Phase 2: Public content system and trust layer
- upgrade `How It Works`
- add richer FAQ/support/resources structure
- turn legal drafts into clearly owned tracked workstreams
- add product glossary / platform concepts content that can later feed the assistant

### Phase 3: Seller growth workspace redesign
- introduce new visual sub-theme and module system
- redesign overview and per-listing workspace
- convert current tables/cards into clearer dashboard hierarchy
- preserve existing marketing data, workflows, and APIs

### Phase 4: AI seller systems upgrade
- improve listing intake and readiness
- deepen marketing copilot channel strategy logic
- increase grounding, output packaging, and workflow usefulness
- preserve current auditability and feature-flag approach

### Phase 5: Carasta Assistant MVP
- launch curated-knowledge assistant
- answer site/company/workflow questions with citations
- log unanswered questions
- route help/escalation appropriately

### Phase 6: Closed-loop optimization
- add analytics-informed recommendations
- improve seller guidance from results
- expand knowledge base governance and freshness loops

## Risks and Dependencies
### Product risks
- If the public story is rewritten without preserving auction credibility, the marketplace can feel secondary in the wrong way.
- If the seller workspace is redesigned only visually and not structurally, it will remain hard to scan and low-trust.
- If an assistant launches before source-of-truth docs are curated, it will feel brittle and hallucination-prone.

### Design risks
- A broad restyle without token cleanup will create more inconsistency, not less.
- The current copper + red system can easily drift into visual noise if reused indiscriminately.

### Engineering risks
- Some UI surfaces still use hardcoded colors and old branded CSS, which increases redesign effort.
- Existing docs are partially stale, especially `CARMUNITY_PHASE_P2_AI_COPILOT_MVP.md`, so planning must not rely on docs alone.
- Legal/public policy pages are currently draft outlines, which limits how far support/assistant claims can safely go.

### Key dependencies
- legal/policy ownership for binding public pages
- design direction approval for public surfaces versus seller workspace surfaces
- content ownership for glossary, support, how-it-works, and assistant knowledge
- analytics confidence and event coverage for smarter seller recommendations

## Recommended Next Implementation Phase
The next implementation phase should be:

**Phase 1: Homepage + public IA restructuring**

Reason:
- It resolves the highest-level product-story problem first.
- It prevents rework in support content, assistant knowledge design, and navigation decisions.
- It creates the right frame for the seller and AI work that follows.

Scope for that next phase should include:
- homepage reorder and copy architecture
- public nav/header refinement
- replacement of weak or placeholder social proof sections
- support/resource page architecture
- file-level cleanup plan for reusable homepage sections

## Likely Affected Areas
### Public site / IA
- `app/(marketing)/page.tsx`
- `components/home/*`
- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `app/(marketing)/how-it-works/page.tsx`
- `components/how-it-works/*`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/community-guidelines/page.tsx`

### Seller growth workspace
- `app/(app)/u/[handle]/marketing/page.tsx`
- `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`
- `components/marketing/*`
- `lib/marketing/*`

### AI systems
- `lib/listing-ai/*`
- `lib/marketing/marketing-copilot-*`
- `lib/validations/listing-ai.ts`
- `lib/validations/marketing-copilot.ts`
- future assistant docs/content store under a new curated knowledge area

### Theme and visual system
- `styles/carmunity-tokens.css`
- `styles/carasta.css`
- `app/globals.css`
- token-aware UI primitives in `components/ui/*`

## Clarifying Questions
1. Do you want the public homepage to sell the web product itself first, the mobile app first, or both equally?
2. Is `Merch` still strategically important enough to keep in the mobile bottom nav during the next public IA pass?
3. Are there existing legal/policy owners for replacing the current draft `terms`, `privacy`, and `community-guidelines` pages?
4. Do you want the seller growth workspace to remain visibly branded as Carasta, or can it adopt a more distinct sub-theme that feels closer to a premium SaaS analytics product?
5. Do you already have preferred visual references for the new seller workspace direction?
6. Should the future Carasta Assistant eventually answer account-specific questions, or should the first versions remain strictly general/site-level?
7. Is there a preferred source-of-truth location for future assistant knowledge docs inside the repo, or should that be proposed fresh?
