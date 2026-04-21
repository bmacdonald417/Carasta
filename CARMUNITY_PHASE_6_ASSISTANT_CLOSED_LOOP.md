# Carmunity Phase 6: Assistant Closed-Loop Optimization

## Summary
Phase 6 improves the existing Carasta Assistant MVP without changing its bounded retrieval-grounded architecture.

This implementation focused on:

- retrieval quality
- chunking quality
- intent-aware source ranking
- clearer citation and fallback behavior
- more useful logging for later corpus improvements
- small but targeted corpus expansion

It stayed within scope:

- no vector or embedding infrastructure
- no personalization
- no account-specific support expansion
- no broad app rollout
- no chatbot-style architecture loosening

## Files Created
- `CARMUNITY_PHASE_6_ASSISTANT_CLOSED_LOOP.md`
- `lib/assistant/assistant-query-analysis.ts`
- `docs/assistant/help-routing.md`

## Files Modified
- `lib/assistant/assistant-types.ts`
- `lib/assistant/assistant-source-registry.ts`
- `lib/assistant/assistant-retrieval.ts`
- `lib/assistant/assistant-answer-service.ts`
- `app/api/assistant/answer/route.ts`
- `components/assistant/carasta-assistant-launcher.tsx`

## Retrieval / Chunking Improvements
### Retrieval quality
- Added question normalization and synonym handling in `lib/assistant/assistant-query-analysis.ts`
  - `forum` / `forums` -> `discussions`
  - `dm` / `direct message` -> `messages`
  - related support/product language normalization
- Added question-intent classification:
  - `definition`
  - `community`
  - `workflow`
  - `navigation`
  - `trust`
  - `seller`
  - `account_specific`
  - `general`
- Added intent-specific preferred source routing instead of treating every question as equally broad

### Source scoring improvements
- Retrieval now weights:
  - source title
  - section heading
  - source summary
  - source tags
  - source aliases
- Preferred source ids for a detected intent now get additional score weight
- Glossary/FAQ, trust, and seller areas now get more appropriate boosting based on question type

### Chunking improvements
- Chunking is still heading-aware and simple, but less fragile than the MVP:
  - heading boundaries still split
  - blank lines only flush once a chunk has enough material
- This reduces the tendency to over-fragment useful sections into tiny pieces

## Citation / Fallback Improvements
### Fallback behavior
- Fallbacks are now more specific by intent instead of one generic message
- Account-specific questions now short-circuit to a stronger bounded fallback rather than pretending to answer
- Weak-retrieval and no-source paths are logged with explicit fallback reasons

### Confidence improvements
- Added retrieval-quality assessment before answer generation
- The assistant can now:
  - refuse account-specific scope more explicitly
  - treat strong single-source trust/community matches as valid high-confidence answers
  - stay cautious when retrieval coverage is still genuinely narrow

### Citation UX improvements
- Assistant answers now expose source category labels in the UI
- The UI makes low-confidence caution more explicit
- The UI now adds a clearer help/escalation band when the assistant thinks support may be better
- Citations remain lightweight and linked back to real Carasta pages

## Logging / Feedback-Loop Improvements
### Better log structure
Expanded assistant logging to include:
- `fallbackReason`
- retrieval scores
- matched terms
- source ids
- chunk ids

This makes the log substantially more useful for later corpus and retrieval tuning.

### Improvement-loop usefulness
The log now supports:
- identifying low-confidence questions
- spotting weak or over-narrow retrieval
- seeing which source areas repeatedly answer a question
- reviewing where account-specific questions hit boundaries

This remains lightweight and file-based, not a heavy analytics system.

## Corpus Improvements
Added:
- `docs/assistant/help-routing.md`

Purpose:
- strengthen “where should I go for help?” routing
- reduce ambiguity around when to use:
  - Resources
  - Trust & Safety
  - Contact
- give the assistant a cleaner source for support escalation answers

Also improved corpus usefulness indirectly through the source registry by adding:
- categories
- tags
- aliases

## Safety / Privacy Notes
- The assistant remains retrieval-grounded
- The assistant still does not give legal advice
- It still does not make moderation decisions
- It still does not claim unsupported account-specific certainty
- Logging remains lightweight and local-file based for now
- No new sensitive persistence behavior was introduced beyond improving the structure of the existing development-oriented query log

## App / Site Parity Notes
- No app rollout was introduced
- Vocabulary remains compatible with a future app assistant surface
- The intent and routing model should transfer conceptually later without requiring identical UI

## Validation Notes
- `npm run lint` completed successfully
  - unrelated existing `img` warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Verified assistant still answers grounded questions
- Verified synonym/improved retrieval behavior for a `forums` question
- Verified trust/help routing answers are cleaner
- Verified account-specific questions still trigger bounded fallback behavior

## Intentionally Deferred
- embeddings / vector infrastructure
- personalization
- account-specific support
- app rollout
- advanced analytics dashboarding for assistant logs
- deeper corpus authoring beyond targeted improvements

## Recommendation for Phase 7
### Phase 7
Corpus and unanswered-question expansion

### Recommended scope
- review the improved assistant logs for recurring low-confidence question types
- add or refine the highest-value missing corpus pages
- strengthen citation UX further only where it materially helps trust
- keep the assistant bounded while improving coverage in the most common product/help areas
