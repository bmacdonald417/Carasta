# Carmunity Phase 8: Corpus and Support Refinement

## Summary
Phase 8 continues improving the Carasta Assistant using the stronger retrieval, logging, and corpus foundation established in earlier phases.

This implementation focused on:

- recurring support-routing and account-boundary question patterns
- clearer “where do I go?” answers
- stronger explanations of how major product surfaces relate
- tighter support-route suggestions in the assistant response model
- more actionable logging for future corpus work

It stayed within scope:

- no app rollout
- no account-specific support expansion
- no embeddings or vector infrastructure
- no large-scale documentation sprawl
- no loosening of assistant safety boundaries

## Files Created
- `CARMUNITY_PHASE_8_CORPUS_AND_SUPPORT_REFINEMENT.md`
- `lib/assistant/assistant-support-routing.ts`
- `docs/assistant/common-support-situations.md`
- `docs/assistant/how-surfaces-fit-together.md`

## Files Modified
- `app/api/assistant/answer/route.ts`
- `docs/assistant/community-and-conversation.md`
- `docs/assistant/help-routing.md`
- `docs/assistant/seller-workspace-and-ai.md`
- `lib/assistant/assistant-answer-service.ts`
- `lib/assistant/assistant-log-analysis.ts`
- `lib/assistant/assistant-query-analysis.ts`
- `lib/assistant/assistant-source-registry.ts`

## Biggest Corpus Additions and Refinements
### Added
- `common-support-situations.md`
  - explains how to route:
    - account-specific questions
    - trust questions
    - seller workflow questions
    - auction/buyer help
    - community participation questions

- `how-surfaces-fit-together.md`
  - explains how:
    - Carmunity
    - Discussions
    - Messages
    - Profiles
    - Garage
    - Auctions
    - Sell
    fit together as one system

### Refined
- `community-and-conversation.md`
  - stronger forum/Discussions mapping
  - stronger usage framing

- `help-routing.md`
  - clearer support-routing examples

- `seller-workspace-and-ai.md`
  - clearer explanation of where seller tools live
  - tighter description of what seller AI is good for

## Support-Flow Improvements
- Added `lib/assistant/assistant-support-routing.ts`
- The assistant can now return route-specific next steps instead of only a generic escalation message
- The assistant UI now supports clearer route suggestions when escalation is appropriate
- Account-boundary questions now route more explicitly toward:
  - `Contact`
  - `Resources`
- Trust-help questions now route more cleanly to the correct trust/help surface

## Retrieval / Routing Improvements
### Registry and metadata
- Added new corpus docs to `assistant-source-registry.ts`
- Expanded registry coverage with:
  - better summaries
  - tags
  - aliases
  - more practical public-facing hrefs for seller guidance

### Query analysis
- Added more phrasing support for:
  - `watchlist`
  - saved auctions
  - `notifications`
  - `settings`
- Strengthened routing for:
  - community intent
  - seller intent
  - navigation intent
  - trust intent
  - account-boundary cases

### Answer flow
- Assistant answers can now include `recommendedRoutes`
- Route guidance is now tied to detected intent and escalation state
- The assistant remains bounded while being more practically useful

## Corpus Hygiene Improvements
- The new docs reduce overload on older catch-all docs by giving:
  - support-routing questions a clearer home
  - surface-relationship questions a clearer home
- Adjusted source registration so seller-workspace guidance points to a more usable public-facing path rather than a placeholder handle route
- Reduced overlap by making the new docs more targeted instead of broad rewrites of existing sources

## Logging / Improvement-Loop Improvements
- `assistant-log-analysis.ts` now adds:
  - `topicArea`
- `app/api/assistant/answer/route.ts` now logs:
  - `topicArea`
  - `recommendedRoutes`
- This makes future review easier because logs now indicate:
  - what category a question belongs to
  - whether corpus work is likely needed
  - which routes the assistant tried to send the user toward

## Safety / Boundary Notes
- The assistant remains retrieval-grounded
- It still does not provide legal advice
- It still does not provide unsupported account-specific answers
- It still does not make moderation decisions
- Support-flow improvements did not widen scope into real account support or personalized assistance

## App / Site Parity Notes
- No app rollout was introduced
- Product vocabulary remains aligned:
  - Carmunity
  - Discussions
  - Messages
  - Profiles
  - Garage
  - Auctions
  - Sell
- The new corpus docs remain conceptually compatible with a future app assistant surface

## Validation Notes
- `npm run lint` completed successfully
  - unrelated existing `img` warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Re-tested:
  - account-boundary support routing
  - product-surface relationship answers
  - trust/help routing answers
- Verified the assistant still stays grounded and bounded in those cases

## Intentionally Deferred
- embeddings / vector infrastructure
- personalization
- account-specific support
- app rollout
- broader support-platform work
- large corpus expansion outside the highest-value gaps

## Recommendation for Phase 9
### Phase 9
Targeted corpus and support-flow refinement from growing real question volume

### Recommended scope
- continue reviewing the richer assistant logs
- identify the next repeated weak-coverage or routing issues
- add only the next highest-value missing corpus docs
- keep tightening support routing without broadening assistant scope
