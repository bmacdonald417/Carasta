# Carmunity Phase 7: Corpus Expansion And Unanswered-Question Improvement

## Summary
Phase 7 expands the assistant corpus in a targeted way and makes the unanswered-question loop more actionable without changing the assistant's bounded retrieval-grounded architecture.

This implementation focused on:

- recurring community/discussions coverage gaps
- recurring help-routing and support-routing questions
- stronger source metadata and registry usefulness
- better log categorization for future corpus work
- keeping the corpus disciplined and modular

It stayed within scope:

- no embeddings or vector infrastructure
- no account-specific support expansion
- no app rollout
- no broad documentation sprawl
- no safety-boundary loosening

## Files Created
- `CARMUNITY_PHASE_7_CORPUS_EXPANSION.md`
- `docs/assistant/using-discussions-and-messages.md`
- `docs/assistant/navigation-and-help-paths.md`
- `lib/assistant/assistant-log-analysis.ts`

## Files Modified
- `docs/assistant/community-and-conversation.md`
- `docs/assistant/help-routing.md`
- `docs/assistant/seller-workspace-and-ai.md`
- `lib/assistant/assistant-source-registry.ts`
- `lib/assistant/assistant-query-analysis.ts`
- `lib/assistant/assistant-retrieval.ts`
- `lib/assistant/assistant-answer-service.ts`
- `app/api/assistant/answer/route.ts`

## Biggest Corpus Additions And Refinements
### Added
- `using-discussions-and-messages.md`
  - covers:
    - how to use Discussions
    - what Discussions are good for
    - when to move from Discussions to Messages
    - how forum-style questions map to Carasta vocabulary

- `navigation-and-help-paths.md`
  - covers:
    - where to start for product understanding
    - where to go for trust/policy questions
    - where to go for direct help
    - where seller tools live
    - how key product surfaces relate

### Refined
- `community-and-conversation.md`
  - added stronger “what Discussions are good for” guidance
  - added explicit forum-to-Discussions mapping

- `help-routing.md`
  - added concrete routing examples

- `seller-workspace-and-ai.md`
  - added clearer seller-tool location guidance
  - added stronger “what seller AI is good for” explanation

## Unanswered-Question Loop Improvements
Added `lib/assistant/assistant-log-analysis.ts` to turn raw question logs into more actionable corpus-work signals.

The log analysis layer now derives:
- normalized question text
- detected intent
- whether corpus work is likely needed
- coverage-gap classification
- recommended source ids

The assistant answer API now logs richer improvement-loop fields including:
- `normalizedQuestion`
- `intent`
- `needsCorpusWork`
- `coverageGap`
- `recommendedSourceIds`

This makes future low-confidence and unresolved-question review much easier without building a full analytics dashboard.

## Retrieval / Source-Coverage Improvements
### Source registry
Expanded `assistant-source-registry.ts` with:
- new source documents
- improved summaries
- additional tags
- additional aliases

This improves coverage and ranking for:
- community/discussions phrasing
- seller-tool location questions
- help-routing and support-routing questions

### Query analysis
Expanded synonym handling and routing:
- `thread` / `threads` support
- `inbox` -> `messages`
- `marketing dashboard` -> `seller workspace`

Updated preferred source routing for:
- community intent
- navigation intent
- trust intent
- seller intent

### Retrieval behavior
Improved retrieval coverage by:
- adding summary chunks per source
- registering new high-value docs
- strengthening tag/alias matching

This keeps the retrieval architecture simple while improving answer quality materially.

## Safety / Boundary Notes
- The assistant remains retrieval-grounded
- The assistant still does not provide legal advice
- The assistant still does not provide account-specific support
- The assistant still does not make moderation decisions
- Trust/help routing is better, but still bounded
- Corpus expansion did not widen policy scope recklessly

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
- The new corpus structure remains conceptually compatible with a future app assistant surface

## Validation Notes
- `npm run lint` completed successfully
  - unrelated existing `img` warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Re-tested targeted assistant questions around:
  - forums / Discussions
  - seller tool location
  - trust/help routing
- Verified those question types now retrieve better sources and answer more cleanly

## Intentionally Deferred
- embeddings / vector infrastructure
- broad corpus expansion beyond the most valuable gaps
- app rollout
- account-specific support
- advanced corpus analytics UI
- broader assistant scope expansion

## Recommendation for Phase 8
### Phase 8
Corpus and support-flow refinement from real question volume

### Recommended scope
- continue reviewing assistant logs for repeated low-confidence patterns
- add only the next highest-value missing docs
- strengthen seller and support flow documentation where real questions justify it
- keep improving answer quality without broadening into risky scope
