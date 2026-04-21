# Carmunity Phase 3: Seller Workspace Redesign

## Summary
Phase 3 redesigns the seller marketing area into a stronger seller growth workspace without changing the underlying backend capability model first.

This implementation focused on:

- a seller-specific visual/system foundation
- lighter, higher-contrast analytical surfaces
- stronger decision-first hierarchy
- clearer actionability and next-step framing
- preserving existing seller capabilities while orchestrating them better

It stayed within scope:

- no assistant implementation
- no broad mobile seller parity work
- no large backend system expansion
- no broad site-wide redesign outside the seller area

## Files Created
- `components/marketing/seller-workspace-primitives.tsx`
- `CARMUNITY_PHASE_3_SELLER_WORKSPACE_REDESIGN.md`

## Files Modified
- `styles/carmunity-tokens.css`
- `app/globals.css`
- `app/(app)/u/[handle]/marketing/page.tsx`
- `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`
- `components/marketing/campaign-status-badge.tsx`
- `components/marketing/marketing-alerts-panel.tsx`
- `components/marketing/marketing-auction-sticky-nav.tsx`
- `components/marketing/marketing-copy-button.tsx`
- `components/marketing/marketing-link-copy-row.tsx`
- `components/marketing/marketing-text-copy-block.tsx`
- `components/marketing/marketing-copilot-intake-metrics-panel.tsx`
- `components/marketing/marketing-copilot-run-history.tsx`
- `components/marketing/seller-marketing-workspace.tsx`
- `components/marketing/seller-marketing-copilot.tsx`
- `components/marketing/share-and-promote-panel.tsx`
- `components/marketing/carmunity-promo-panel.tsx`
- `components/marketing/auction-linked-promo-posts.tsx`

## Seller-Specific Primitives and Tokens Added
### Tokens
Added seller workspace tokens in `styles/carmunity-tokens.css` for:
- seller canvas
- seller foreground
- seller panel / muted panel / strong panel
- seller border
- seller muted text
- seller semantic colors:
  - info
  - success
  - caution
  - urgency
- seller shadow

### Global seller shell
Added seller workspace shell/background helpers in `app/globals.css`:
- `.seller-workspace-shell`
- `.seller-grid`

### New primitives
Created `components/marketing/seller-workspace-primitives.tsx` with:
- `SellerWorkspaceShell`
- `SellerStatusBadge`
- `SellerSectionPanel`
- `SellerKpiCard`
- `SellerInsightCard`
- `SellerMicroBar`

These now act as the seller-specific design foundation instead of repeating one-off dark/red cards.

## Overview Hierarchy Changes
### Before
The overview behaved more like:
- heading
- KPI tiles
- alerts
- share/presets strip
- campaigns table
- listings grid

It had useful data, but weak orchestration.

### After
The overview now follows a clearer command-center structure:

1. **Top command bar**
   - workspace identity
   - high-level framing
   - AI access reminder
   - preset state

2. **Summary layer**
   - seller KPI cards
   - portfolio and engagement signals

3. **Decision layer**
   - priority queue
   - portfolio health
   - alerts

4. **Execution layer**
   - campaign command
   - recent campaign activity
   - listing workspaces
   - preset / workflow utility access

### Biggest overview improvements
- Sellers see what needs attention before they hit the full listing/campaign dump.
- KPI cards are lighter, calmer, and more analytical.
- Priority and health are now distinct layers instead of being implied.
- Listings now read more like managed workspaces than simple cards.

## Per-Listing Hierarchy Changes
### Before
The page read like a long stack of modules:
- header
- KPI blocks
- alerts
- workspace
- share/promote
- Carmunity
- promo posts
- campaigns
- analytics
- activity

### After
The page now behaves more like an active campaign workspace:

1. **Listing header / status / quick actions**
2. **Performance snapshot**
3. **Health / momentum layer**
4. **Next best actions**
5. **Alerts**
6. **Workspace plan / AI / tasks / drafts**
7. **Share & Promote**
8. **Promote to Carmunity**
9. **Linked Carmunity posts**
10. **Campaign plan**
11. **Analytics detail**
12. **Activity / audit trail**

### Biggest per-listing improvements
- The upper fold is now analytical and action-oriented.
- Next-best-action framing appears before the long modules.
- Analytics panels use cleaner micro-bars and lighter surfaces.
- Campaign and activity sections now feel like structured workspace panels rather than leftover dark cards.

## Key Visual / System Changes
- Shifted the seller area toward a lighter, higher-contrast sub-theme.
- Reduced dependence on dark glass surfaces.
- Reduced ambient red; red is now more limited to urgency/error usage.
- Blue / blue-violet now carries more of the info/analysis role.
- Tables, copy blocks, sticky nav, alerts, and AI panels now use lighter layered panels and clearer borders.
- Typography remains recognizably Carasta, but dense analytical areas now scan more like tool UI than brand landing UI.

## Existing Capabilities Preserved
The redesign preserved the current seller capability surface:
- analytics
- campaigns
- share/promote
- Carmunity promo
- AI copilot hooks
- alerts
- exports
- per-listing drill-down
- workspace plan / checklist / draft artifacts

This phase reorganized and restyled these capabilities rather than removing them.

## App / Site Parity Notes
- Seller tooling remains intentionally web-first.
- No broad Flutter seller work was introduced.
- Shared terminology stayed aligned:
  - Carmunity
  - Auctions
  - Sell
  - Messages
  - campaigns
  - AI copilot
- The seller workspace now has a stronger conceptual model that can later inform app-facing placeholders or vocabulary without forcing layout parity.

## Validation Notes
- `npm run lint` completed successfully
  - existing unrelated warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Verified local route responses:
  - seller overview: `/u/bmacd/marketing` -> `200`
  - known per-listing workspace: `/u/bmacd/marketing/auctions/cm9rj6wh7000dy8uj39577tvf` -> `200`
- Verified no new lint issues remained in the touched seller files

## Intentionally Deferred
- Chart library introduction
- Deep anomaly detection or closed-loop recommendation backend
- Assistant implementation
- Broad mobile seller workspace work
- Seller backend expansion beyond what was needed to improve hierarchy and actionability
- Site-wide theme migration outside the seller surfaces

## Recommendation for Phase 4
### Phase 4
AI seller systems upgrade

### Recommended scope
- improve listing readiness and guidance quality
- deepen marketing copilot strategy logic
- connect recommendations more directly to real listing context and performance context
- preserve current auditability and feature-flag structure
