# Carasta AI Systems Enhancement Plan

## Scope
This document covers:
- `Listing AI`
- `AI Marketing Copilot`
- the proposed `Carasta Assistant`
- grounding, trust, output, workflow, governance, and phased rollout recommendations

## Current AI Foundation Audit
### Listing AI
Relevant areas:
- `app/api/listings/ai/generate/route.ts`
- `app/api/listings/ai/rewrite-field/route.ts`
- `app/api/listings/ai/runs/route.ts`
- `lib/listing-ai/listing-ai-generate-service.ts`
- `lib/listing-ai/listing-ai-rewrite-field-service.ts`
- `lib/validations/listing-ai.ts`

Current strengths:
- scope-aware prompting already exists: `full`, `condition`, `imperfections`
- structured output is validated
- there are feature flags and rate limits
- audit history already exists via `ListingAiRun`
- prompts already include meaningful safety boundaries

Current likely limitations:
- input context is still fairly narrow
- the system mostly writes copy; it does not yet act like a listing coach
- there is limited output packaging beyond title / description / condition summary
- audience nuance is seller-entered rather than systemically inferred or scaffolded
- readiness, missing-information detection, and quality scoring are not yet core outputs

### Marketing Copilot
Relevant areas:
- `app/api/marketing/copilot/*`
- `lib/marketing/marketing-copilot-generate-service.ts`
- `lib/marketing/marketing-copilot-regenerate-service.ts`
- `lib/marketing/marketing-copilot-prompt.ts`
- `lib/validations/marketing-copilot.ts`
- `lib/marketing/marketing-copilot-analytics-context.ts`
- `lib/marketing/marketing-copilot-sanitize.ts`

Current strengths:
- generate, review, apply, and regenerate flows exist
- seller ownership and feature gating are already enforced
- structured outputs are validated and sanitized
- runs are persisted and auditable
- light metrics are already injected into prompt context
- the system is already positioned as seller intelligence, not generic “AI magic”

Current likely limitations:
- it is still more draft generator than strategic operator
- channel nuance is likely limited by current prompt structure
- performance context is intentionally light, which is safe but may underpower strategic recommendations
- the output model is solid for MVP, but not yet optimized for “why this matters,” “what to do next,” or per-channel execution depth

### Shared AI stack
Strengths:
- JSON object responses
- Zod validation
- server-only key usage
- rate limiting
- persisted runs

Risks:
- documentation drift already exists
- listing AI audit depth is weaker than marketing copilot audit depth
- no curated retrieval-backed knowledge layer yet exists for a site assistant

## Listing AI Enhancement Plan
### Goal
Evolve Listing AI from a copy generator into a safe, enthusiast-grade listing drafting and readiness assistant.

### Recommended improvements
#### 1. Stronger intake design
Add structured seller inputs beyond freeform highlights:
- ownership duration
- service history confidence
- modifications
- originality
- documentation available
- known flaws grouped by severity and area
- selling reason
- tone / audience preset

This should reduce model guesswork and improve nuance.

#### 2. Better audience-aware outputs
Support guided audience modes such as:
- collector
- performance buyer
- weekend enthusiast
- daily driver buyer
- project-car buyer

These should alter emphasis, not facts.

#### 3. Expand output packaging
Recommended structured output additions:
- `titleOptions[]`
- `shortSummary`
- `description`
- `conditionSummary`
- `missingInfo[]`
- `riskFlags[]`
- `readinessScore`
- `readinessReasons[]`
- `disclosureSuggestions[]`

This keeps the current safe draft behavior while making outputs more workflow-useful.

#### 4. Add listing quality and readiness feedback
The system should be able to say:
- what is missing
- what is weak
- what sounds vague
- what should be supported with documentation
- where condition/disclosure language should be strengthened

This would add differentiated value without requiring unsafe factual invention.

#### 5. Guided refinement mode
Beyond single-field rewrite, support iterative seller-side refinement:
- “make this more collector-oriented”
- “tighten title without overselling”
- “improve disclosure clarity”
- “make condition summary more scan-friendly”

This should stay bounded to seller-provided facts.

### Hallucination reduction plan
- Keep the current “do not invent history / VIN decode / guarantees” rules.
- Make unknowns explicit in the output contract.
- Separate seller-provided facts from AI-authored prose internally.
- Add `missingInfo[]` instead of forcing the model to fill gaps.
- Consider hash-based audit parity with marketing copilot for `ListingAiRun`.

### Differentiated value opportunity
Carasta can make Listing AI more useful than generic listing-copy tools by focusing on:
- honest enthusiast voice
- disclosure clarity
- audience targeting without factual drift
- readiness and confidence framing
- structured seller coaching instead of just text generation

## AI Marketing Copilot Enhancement Plan
### Goal
Evolve the copilot from structured draft generation into a listing-aware, platform-aware seller strategist.

### Recommended improvements
#### 1. Stronger channel strategy model
Current channels:
- `carmunity`
- `facebook`
- `instagram`
- `x`
- `google`
- `forums`
- `email`

Upgrade the output to include for each selected channel:
- objective
- why that channel matters for this listing
- recommended cadence
- recommended asset type
- messaging angle
- CTA guidance
- execution checklist

#### 2. Better output structure
Recommended next schema layer:
- `plan`
- `priorityActions[]`
- `channelPlaybooks[]`
- `tasks[]`
- `artifacts[]`
- `watchouts[]`
- `measurementPlan[]`

Each `channelPlaybook` should include:
- channel key
- audience fit
- why selected
- recommended sequence
- tone
- asset suggestions
- do / avoid notes

#### 3. Better context inputs
Add more structured context when available:
- listing completeness / readiness
- stronger description and condition summaries from listing AI
- recent marketing activity trends
- nearing-end timing context
- seller intent and budget
- prior copilot plan or prior run summary

#### 4. Make it workflow-smarter
The copilot should directly support:
- launch checklist for a new listing
- low-traction recovery plan
- ending-soon push plan
- channel expansion suggestions
- content refresh suggestions

#### 5. Explain the reasoning
Add `whyThisMatters` style outputs so sellers understand:
- why a recommendation exists
- why a channel matters
- why a task is prioritized now

This will improve trust and adoption.

### Hallucination reduction plan
- Continue using only listing context and seller intake as authoritative facts.
- Keep metrics as guidance only, not predictive claims.
- explicitly prohibit performance guarantees
- prefer “recommended because” over “this will produce”
- keep channel guidance bounded to tactics, not unsupported promises

### Differentiated value opportunity
Carasta’s copilot can stand out by being:
- auction-aware
- seller workflow-aware
- Carmunity-aware
- end-of-auction aware
- marketing-data aware

That is more valuable than just generating captions.

### Future phases
- results feedback loop
- seller strategy memory
- persona/channel templates
- AI asset recommendation prompts
- campaign optimizer suggestions

## Carasta Assistant Plan
### Product model recommendation
Recommended MVP:
- a dedicated assistant drawer or panel
- opened from a floating help button and optionally from `Messages`
- clearly branded as a Carasta help and guidance assistant, not a general chatbot

Why this is the recommended path:
- a floating button provides discoverability for public visitors
- a dedicated panel keeps the function distinct from user-to-user messages
- optional message-thread integration can come later if needed

### Recommended fallback
Launch it first only inside authenticated surfaces or `Messages`.

Tradeoff:
- lower surface area and lower support risk,
- but weaker public help value and weaker onboarding benefit.

### Knowledge architecture
The assistant should be grounded in curated internal docs, not ad hoc prompt stuffing.

Recommended source classes:
- platform overview
- how-it-works docs
- glossary
- FAQ
- policy/legal/support docs
- seller workflow docs
- auction mechanics docs
- Carmunity / discussions / garage explanations

Recommended governance model:
- curated markdown source-of-truth in-repo
- clear ownership per content area
- versioning through git
- freshness review cadence

### Suggested knowledge corpus structure
Create a future knowledge area such as:
- `docs/assistant/platform-overview.md`
- `docs/assistant/how-auctions-work.md`
- `docs/assistant/selling-on-carasta.md`
- `docs/assistant/carmunity-and-discussions.md`
- `docs/assistant/policies-and-boundaries.md`
- `docs/assistant/glossary.md`
- `docs/assistant/faq.md`

These docs should be intentionally written for retrieval, not just for humans scanning long prose.

### Retrieval strategy
Recommended path:
- curated markdown corpus
- chunking with stable metadata
- retrieval before answer generation
- answer generation constrained to retrieved sources
- citations back to internal pages or public routes when possible

Fallback path:
- no retrieval at first, only tightly curated prompt context and hardcoded FAQ responses

Tradeoff:
- faster to ship,
- but harder to scale and easier to drift.

### UX behavior recommendations
- clear welcome message explaining scope
- sample prompts
- visible boundaries
- citations or “based on” links
- support escalation prompt when confidence is low
- “I’m not sure” behavior instead of fabricated certainty

Sample prompt areas:
- how bidding works
- what Carmunity is
- how garage and profiles work
- how to list a car
- what the marketing workspace does
- where to find messages / discussions / settings

### Technical architecture recommendations
#### MVP
- assistant UI surface
- backend answer route
- curated corpus ingestion step
- retrieval layer
- model answer generation with source citations
- event logging

#### Logging requirements
Log:
- question
- retrieved sources
- answer confidence bucket
- fallback used or not
- unresolved / unanswered marker

This enables a strong unanswered-question loop.

### Boundaries and policy
The assistant should never:
- give legal advice
- invent fees or binding policies without a cited source
- fabricate account-specific facts
- make moderation rulings
- claim certainty where docs are draft or missing

### Phased rollout
#### Phase A
- general site/product/workflow assistant
- curated docs only
- simple retrieval
- floating button or drawer

#### Phase B
- expanded support corpus
- unanswered-question review loop
- stronger citation UX

#### Phase C
- seller-specific workflow guidance
- deeper linkage to public and authenticated routes

#### Phase D
- cautious personalization, if approved later
- account-specific integration only when data safety and policy are clear

## Cross-System Recommendations
### Shared trust improvements
- align AI system docs with current code behavior
- add clearer observability around AI calls
- improve audit parity across listing AI and marketing copilot
- create explicit ownership for knowledge content

### Shared workflow improvements
- let listing AI feed better listing context into marketing copilot
- let marketing copilot reuse listing readiness signals
- let the assistant cite the same source-of-truth docs that public resources use

## Recommended Next AI Phase
The next AI phase should prioritize:

1. `Listing AI` readiness and missing-info support
2. `Marketing Copilot` richer channel playbooks and reasoning
3. foundation docs for the future `Carasta Assistant`

This sequence improves the seller product immediately while preparing the knowledge architecture the assistant will need.

## Open Questions
1. Should Listing AI remain purely seller-authored-copy support, or should it eventually surface stronger quality scoring in the sell flow itself?
2. Do you want Marketing Copilot to remain intentionally lightweight and human-executed, or move toward more operational campaign orchestration over time?
3. Should the first Carasta Assistant be public-facing, signed-in only, or both?
4. Are there any existing internal docs outside this repo that would need to become part of the assistant knowledge base later?
