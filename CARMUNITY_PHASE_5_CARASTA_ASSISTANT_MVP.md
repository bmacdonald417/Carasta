# Carmunity Phase 5: Carasta Assistant MVP

## Summary
Phase 5 introduces the first web-first Carasta Assistant MVP.

This implementation focused on:

- a bounded, Carasta-specific assistant
- retrieval grounded in curated source content
- a lightweight global web entry point
- source-aware answers with links back to public pages
- clear fallback and escalation behavior
- lightweight observability for future improvement

It stayed within scope:

- no broad app rollout
- no account-specific concierge behavior
- no generalized AI framework rewrite
- no legal or moderation decision engine

## Files Created
- `CARMUNITY_PHASE_5_CARASTA_ASSISTANT_MVP.md`
- `app/api/assistant/answer/route.ts`
- `components/assistant/carasta-assistant-launcher.tsx`
- `docs/assistant/platform-overview.md`
- `docs/assistant/community-and-conversation.md`
- `docs/assistant/identity-and-garage.md`
- `docs/assistant/auctions-buying-and-selling.md`
- `docs/assistant/trust-safety-and-help.md`
- `docs/assistant/seller-workspace-and-ai.md`
- `docs/assistant/faq-and-glossary.md`
- `lib/assistant/assistant-types.ts`
- `lib/assistant/assistant-source-registry.ts`
- `lib/assistant/assistant-retrieval.ts`
- `lib/assistant/assistant-answer-service.ts`
- `lib/assistant/assistant-log.ts`

### Runtime log artifact
- `reports/assistant/assistant-query-log.jsonl`

## Files Modified
- `app/layout.tsx`

## Knowledge Source Architecture
The assistant is grounded in a curated in-repo corpus under `docs/assistant/`.

Initial source documents:
- `platform-overview.md`
- `community-and-conversation.md`
- `identity-and-garage.md`
- `auctions-buying-and-selling.md`
- `trust-safety-and-help.md`
- `seller-workspace-and-ai.md`
- `faq-and-glossary.md`

These documents are intentionally:
- Carasta-specific
- curated
- written for retrieval
- mapped back to real public routes through `assistant-source-registry.ts`

The source registry provides:
- source id
- title
- file path
- public href
- summary

## Retrieval / Answer Approach
### Retrieval
The MVP uses a practical retrieval layer in `lib/assistant/assistant-retrieval.ts`:

- load curated markdown docs from `docs/assistant/`
- chunk them by heading and paragraph boundaries
- normalize and tokenize the user question
- score chunks with lexical overlap and phrase matching
- return the top scored chunks only

This is intentionally simple, but it still preserves grounding discipline.

### Answer generation
The answer layer in `lib/assistant/assistant-answer-service.ts`:

1. retrieves relevant chunks first
2. passes only those chunks to the model
3. instructs the model to answer only from retrieved sources
4. requires structured JSON output
5. maps citation ids back to real source titles and route hrefs

### Fallback
If no relevant chunks are found, or if the answer path fails, the assistant returns:
- a low-confidence bounded fallback
- escalation guidance
- a relevant help or trust page where possible

## UI Entry / Interaction Model
### Entry point
The assistant is available globally through:
- `components/assistant/carasta-assistant-launcher.tsx`

It is mounted from `app/layout.tsx` so it is accessible across the web product.

### Interaction model
The assistant uses a lightweight dialog-based UI:
- floating launcher button
- welcome state
- scope / boundaries explanation
- example prompts
- freeform question input
- structured answer card
- source links
- suggested follow-up questions

It is clearly framed as:
- Carasta Assistant
- site / product / workflow help
- not generic user chat

## Logging / Improvement Loop Notes
Added lightweight assistant observability through:
- `lib/assistant/assistant-log.ts`
- runtime JSONL logging to `reports/assistant/assistant-query-log.jsonl`

Captured fields include:
- user question
- confidence
- escalation flag
- source ids used
- chunk ids used
- timestamp
- error path when relevant

This creates a basic improvement loop without introducing a full analytics subsystem yet.

## Safety / Boundary Notes
The assistant is explicitly bounded:

### It can help with
- what the site is
- what Carasta means
- what Carmunity means
- Discussions, Messages, Profiles, Garage, Auctions, Sell, and seller tools
- general buyer and seller workflow guidance
- where to get help

### It should not do
- legal advice
- fabricated policy claims
- moderation decisions
- unsupported account-specific assertions
- fake certainty about ambiguous or draft material

### Enforced in architecture
- curated retrieval-first source selection
- no unconstrained answer prompt stuffing
- source ids limited to retrieved sources
- structured answer contract
- explicit fallback path

## App / Site Parity Notes
- This MVP is web-first only
- The assistant identity is intentionally compatible with a later app rollout
- The implementation avoids account-specific assumptions that would make future platform expansion awkward
- No broad Flutter or app assistant work was started

## Validation Notes
- `npm run lint` completed successfully
  - unrelated existing `img` warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Verified homepage renders with assistant launcher text
- Verified assistant API answers a grounded product question
- Verified assistant refuses unsupported account-specific questions and escalates appropriately
- Verified assistant routes and sources resolve without creating broken public/help paths

## Intentionally Deferred
- broad app rollout
- account-specific assistance
- personalization or conversation memory
- embeddings pipeline
- vector store infrastructure
- advanced confidence scoring pipeline
- deep analytics dashboard for assistant usage
- seller/account-specific policy reasoning

## Recommendation for Phase 6
### Phase 6
Closed-loop optimization

### Recommended scope
- use the assistant query log and unresolved questions to improve the corpus
- refine retrieval quality and chunking
- add stronger unanswered-question review loops
- deepen citation UX and confidence handling
- connect seller/product guidance improvements back into the public content system and AI surfaces
