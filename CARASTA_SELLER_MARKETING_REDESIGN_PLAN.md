# Carasta Seller Marketing Redesign Plan

## Executive Summary
The current seller marketing system is one of the strongest under-leveraged assets in the codebase. It already has meaningful analytics, campaigns, share/promo tooling, AI copilot hooks, exports, notifications, and per-listing drill-downs. The problem is not capability. The problem is how capability is presented.

Today the seller marketing area looks like a functional extension of the main dark site theme. It does not yet feel like a premium, intelligent seller workspace. To become a real differentiator, it should evolve into a **seller growth workspace** with stronger hierarchy, more opinionated information architecture, better scanability, better decision support, and a visual system that feels more analytical and premium than the consumer-facing product.

## Current State Audit
### Core routes
- overview: `app/(app)/u/[handle]/marketing/page.tsx`
- per-listing detail: `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`

### Current strengths
- Strong functional breadth already exists.
- Ownership and feature gating are handled cleanly.
- Per-listing drill-down already combines analytics, alerts, share/promote, Carmunity promo, campaigns, workspace plan, and AI copilot.
- Export and workflow utilities already exist.
- Marketing notifications and analytics are already being generated and surfaced.

### Current weaknesses
- The overview is mostly KPI cards, alerts, a campaigns table, and listing cards. It feels additive, not orchestrated.
- The per-listing page reads like a long stack of sections rather than a guided workspace.
- Visual treatment is repetitive: dark panels, muted text, red icon chips, simple bars, plain tables.
- Hardcoded red values and white-on-dark surfaces make the experience feel more “auction accent” than “growth intelligence.”
- There is limited concept of readiness, health, priority, momentum, or next-best action.
- The system tells sellers what happened, but it does not yet strongly tell them what to do next.

## Why the Current Theme Direction Is Weak
### Dark + gold / copper
Weaknesses:
- It feels brand-forward but not decision-forward.
- Copper works as an accent, but as a primary product chrome it can feel heavy and ornamental.
- On analytics surfaces, copper does not create strong semantic clarity for states, trends, health, or urgency.
- Combined with dark glass panels, it can drift into luxury styling without improving readability.

### Older red-forward direction
Weaknesses:
- Red is great for live urgency and bidding, but it is too emotionally narrow for a full seller workspace.
- Heavy use of red increases stress and visual fatigue.
- It makes the workspace feel reactive and “alerty,” not strategic.
- It is hard to use red pervasively while still reserving it for meaningful exceptions and urgency.

## Recommended Product Model
The marketing area should be reframed as a **Seller Growth Workspace** with two levels:

1. **Portfolio level**
   - overview across the seller’s active and recent listings
   - health, priorities, alerts, trends, campaigns

2. **Listing level**
   - one listing as an active campaign workspace
   - plan, channels, content, signals, recommendations, activity, AI support

This is not a new backend product. It is a stronger front-end orchestration layer over the systems already in place.

## Recommended Information Architecture
### Seller Growth Workspace overview
Recommended top-level modules:
- `Overview`
- `Listings`
- `Campaigns`
- `Templates / Presets`
- `AI Copilot`
- `Alerts`
- `Exports / Reports`

### Per-listing workspace IA
Recommended section order:
1. Listing header with status, countdown, bid context, and quick actions
2. Performance snapshot
3. Health / readiness / momentum summary
4. Next best actions
5. AI copilot panel
6. Channel plan and tasks
7. Content/artifacts
8. Share/promote tools
9. Carmunity promo module
10. Campaign log
11. Analytics details
12. Recent activity and audit trail

This order puts decision-making and actionability before long-tail reference data.

## Recommended New Modules
### Overview workspace modules
- **Seller growth summary**
  - active listings
  - healthy listings
  - at-risk listings
  - campaigns in flight

- **Priority queue**
  - listings needing action now
  - ending soon with low interest
  - surge opportunities
  - no recent activity

- **Performance trends**
  - views
  - share clicks
  - bid clicks
  - conversion proxy trend

- **AI insights**
  - campaign gaps
  - missing content
  - best next steps

- **Recent campaign activity**
  - changes, status shifts, recent outputs, pending tasks

### Per-listing workspace modules
- **Listing health score**
  - readiness
  - momentum
  - promotion coverage
  - content completeness

- **Recommendation cards**
  - what to do
  - why it matters
  - expected outcome type
  - direct action entry

- **Channel strategy board**
  - selected channels
  - current plan
  - cadence
  - content coverage

- **Content pack**
  - headlines
  - captions
  - forum copy
  - email copy
  - CTA lines
  - reusable variants

- **Anomalies / opportunities**
  - low traffic
  - low bid intent
  - rising engagement
  - ending soon with low promotion

## Recommended Layout System
### Overview page
Use a three-band structure:

1. **Top command bar**
   - page title
   - primary actions
   - timeframe filters
   - seller presets / export shortcuts

2. **Decision layer**
   - priority queue
   - summary KPIs
   - trend modules

3. **Execution layer**
   - listings grid or table
   - campaigns
   - alerts

### Per-listing page
Use a sticky in-page tab or section nav, but make the top of the page a strong analytical command center rather than a simple heading and buttons.

Recommended upper fold:
- listing identity
- live status and key auction state
- headline metrics
- health indicators
- next best actions

## Visual Direction Recommendation
### Recommended path
Use a **lighter or mixed-surface analytical sub-theme** for the seller workspace.

This means:
- keep Carasta brand cues,
- but shift away from full dark-glass dominance,
- use white or light-neutral work surfaces where they improve scanning,
- keep darker panels only where emphasis is helpful,
- reserve red for live urgency and exceptions,
- use a cooler secondary accent for charts, info states, and analysis.

### Why a sub-theme is recommended
The seller workspace serves a different job than the public site:
- public site = brand, identity, emotion, community
- seller workspace = planning, diagnosis, action, monitoring

A sub-theme helps the seller area feel more like a premium tool rather than another branded landing environment.

### Recommended palette behavior
- primary brand accent: controlled Carasta accent, less ornamental
- neutral base: warm white or cool off-white plus slate neutrals
- analytic accent: blue or blue-violet for information and charts
- positive: emerald
- caution: amber
- urgency: red, used sparingly

## UX Recommendations
### Make the workspace more actionable
Every major metric block should connect to a recommendation or action.

Examples:
- “Views are steady but bid clicks are weak” -> suggest stronger CTA copy and refreshed promotion timing
- “Listing is ending within 24 hours and interest is low” -> prompt a short execution checklist
- “Share clicks are concentrated from Carmunity” -> suggest follow-up content there first

### Make AI feel embedded, not bolted on
The AI copilot should stop feeling like one section among many. It should also power:
- readiness feedback,
- missing-information prompts,
- next-best-action suggestions,
- channel completion recommendations,
- listing-specific content gap detection.

## Phased Redesign Approach
### Phase A: Structural redesign without backend expansion
- redesign overview and per-listing layout
- add health/readiness framing
- improve action hierarchy
- keep current APIs and data contracts

### Phase B: Visual system and component pass
- create new module/card system
- add chart treatments
- reduce hardcoded red
- create reusable seller workspace primitives

### Phase C: Intelligence layer
- add recommendation cards
- add anomaly states
- add confidence-scoped AI summaries

### Phase D: Deeper closed-loop optimization
- connect recommendations to performance shifts
- improve seller memory and channel planning persistence

## Likely File / Component Impact
### High impact
- `app/(app)/u/[handle]/marketing/page.tsx`
- `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`
- `components/marketing/seller-marketing-workspace.tsx`
- `components/marketing/seller-marketing-copilot.tsx`
- `components/marketing/marketing-alerts-panel.tsx`
- `components/marketing/marketing-auction-sticky-nav.tsx`
- `components/marketing/share-and-promote-panel.tsx`
- `components/marketing/carmunity-promo-panel.tsx`
- `components/marketing/auction-linked-promo-posts.tsx`

### Medium impact
- `lib/marketing/get-seller-marketing-overview.ts`
- `lib/marketing/get-seller-marketing-auction-detail.ts`
- `lib/marketing/marketing-copilot-intake-metrics.ts`
- any future reusable seller dashboard component library

### Theme impact
- `styles/carmunity-tokens.css`
- `styles/carasta.css`
- `app/globals.css`
- token-aware UI primitives in `components/ui/*`

## Recommended Decision
Adopt a distinct seller-growth workspace system, not just a cosmetic refresh of the current dark/red marketing pages. Keep the data model and flow architecture. Redesign the interface around hierarchy, insight, actionability, and confidence.

## Open Questions
1. Do you want the seller workspace to feel meaningfully lighter than the main site, or only slightly less dark?
2. Should the overview prioritize portfolio management across many listings, or go deeper on one active listing at a time?
3. Are there any seller personas you want treated as primary first, such as dealer, enthusiast private seller, collector, or consignment partner?
4. Do you want campaign analytics to remain intentionally lightweight, or should future phases support more explicit funnel-style reporting?
