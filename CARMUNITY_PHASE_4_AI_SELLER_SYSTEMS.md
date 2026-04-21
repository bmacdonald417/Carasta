# Carmunity Phase 4: AI Seller Systems

## Summary
Phase 4 upgrades the existing seller AI systems without replacing their guarded architecture.

This implementation focused on:

- stronger Listing AI structure and readiness guidance
- stronger Marketing Copilot strategy structure
- more grounded prompt context
- preserved review/apply and audit patterns
- seller-facing usefulness inside the existing workflow

It stayed within scope:

- no assistant implementation
- no autonomous posting
- no auto-campaign execution
- no broad seller backend redesign

## Files Created
- `lib/listing-ai/listing-ai-readiness.ts`
- `CARMUNITY_PHASE_4_AI_SELLER_SYSTEMS.md`

## Files Modified
- `lib/validations/listing-ai.ts`
- `lib/listing-ai/listing-ai-generate-service.ts`
- `lib/listing-ai/listing-ai-rewrite-field-service.ts`
- `lib/listing-ai/format-listing-ai-run-for-client.ts`
- `components/sell/listing-ai-assistant.tsx`
- `components/sell/listing-ai-field-improve.tsx`
- `lib/validations/marketing-copilot.ts`
- `lib/marketing/marketing-copilot-generate-service.ts`
- `lib/marketing/marketing-copilot-apply-service.ts`
- `lib/marketing/marketing-copilot-prompt.ts`
- `lib/marketing/marketing-copilot-sanitize.ts`
- `lib/marketing/format-marketing-copilot-run-for-client.ts`
- `components/marketing/seller-marketing-copilot.tsx`
- `app/api/marketing/copilot/apply/route.ts`

## Listing AI Upgrades
### Intake upgrades
Expanded Listing AI intake support with optional structured seller context:
- `audiencePreset`
- `ownershipDuration`
- `serviceHistoryConfidence`
- `modifications`
- `originality`
- `documentationAvailable`
- `sellingReason`

This gives the model more useful seller-supplied structure without forcing unsupported certainty.

### Output upgrades
Expanded Listing AI output beyond basic title/description/condition summary:
- `titleOptions[]`
- `shortSummary`
- `missingInfo[]`
- `riskFlags[]`
- `readinessScore`
- `readinessReasons[]`
- `disclosureSuggestions[]`

The original editable fields remain intact:
- `title`
- `description`
- `conditionSummary`

### Readiness / grounding improvements
Added `lib/listing-ai/listing-ai-readiness.ts` to derive grounded readiness context from seller input and listing completeness.

This is used to:
- surface likely missing information
- surface overclaim / ambiguity risks
- provide bounded readiness reasoning
- keep unknowns explicit instead of letting the model fill gaps magically

### Rewrite improvements
The field-level rewrite service now uses stronger seller/listing context and default rewrite instructions so quick-improve flows are more disclosure-aware and scan-friendly.

### Audit / history improvements
Updated listing AI run formatting so previews and intake summaries better reflect:
- wizard scope
- audience preset
- service-history confidence
- richer output previews

## Marketing Copilot Upgrades
### Input upgrades
Expanded generate-body support with:
- `workflowMode`
- `previousStrategySummary`

This lets the copilot behave more like a workflow-aware strategist instead of only a copy generator.

### Output upgrades
Expanded the copilot schema beyond only:
- `plan`
- `tasks`
- `artifacts`

New structured layers:
- `priorityActions[]`
- `channelPlaybooks[]`
- `watchouts[]`
- `measurementPlan[]`

Also expanded `plan` with:
- `whyNow`
- `workflowMode`

### Stronger prompt context
The generation prompt now includes:
- listing readiness context derived from listing fields
- existing workspace-plan context when present
- inferred workflow mode
- stronger schema instructions for:
  - channel reasoning
  - watchouts
  - measurement guidance
  - action priority

### Stronger strategy shape
Each channel playbook can now carry:
- `audienceFit`
- `whyThisChannel`
- `cadence`
- `messagingAngle`
- `ctaGuidance`
- `assetSuggestions[]`
- `doNotes[]`
- `avoidNotes[]`

Priority actions now explicitly explain:
- what to do now
- why it matters
- optional channel alignment
- semantic tone

### Workspace mapping improvements
The richer copilot output still fits the existing workspace model:
- standard `tasks` still apply normally
- `priorityActions` can become additional tasks if they are not duplicates
- `channelPlaybooks`, `watchouts`, and `measurementPlan` are preserved as additional strategy artifacts on apply

This keeps the new structure workflow-usable without rewriting the workspace storage model.

### UI review improvements
The seller-facing copilot review UI now supports:
- workflow mode selection on intake
- review of priority actions
- review of channel playbooks
- review of watchouts
- review of measurement plan

The existing review/edit/apply pattern remains intact.

## Schema / Contract Changes
### Listing AI
#### Input contract additions
- `audiencePreset`
- `ownershipDuration`
- `serviceHistoryConfidence`
- `modifications`
- `originality`
- `documentationAvailable`
- `sellingReason`

#### Output contract additions
- `titleOptions`
- `shortSummary`
- `missingInfo`
- `riskFlags`
- `readinessScore`
- `readinessReasons`
- `disclosureSuggestions`

### Marketing Copilot
#### Input contract additions
- `workflowMode`
- `previousStrategySummary`

#### Output contract additions
- `plan.whyNow`
- `plan.workflowMode`
- `priorityActions`
- `channelPlaybooks`
- `watchouts`
- `measurementPlan`

## Shared AI Infrastructure Improvements
- Added a reusable readiness/grounding helper for Listing AI
- Improved prompt structure for both listing and marketing AI
- Expanded sanitization to cover the richer Copilot contract
- Preserved Zod validation and server-side structured parsing
- Preserved seller ownership validation, feature flags, and rate limits
- Preserved run persistence and audit history

## Auditability / Safety Notes
- Listing AI still does not invent VIN decode, history, or guarantees
- Missing context is now more explicitly surfaced as `missingInfo[]` and `riskFlags[]`
- Marketing Copilot still stays human-in-the-loop
- Copilot outputs remain reviewable before apply
- Copilot apply still persists through the existing audited plan/task/artifact workflow
- No autonomous posting or campaign execution was introduced
- No unsupported performance promises were introduced

## App / Site Parity Notes
- No broad app implementation was started
- Vocabulary remains conceptually portable to future app help surfaces:
  - Listing AI
  - readiness
  - priority actions
  - channel playbooks
  - watchouts
  - measurement plan
- Seller AI remains web-first for now

## Validation Notes
- `npm run lint` completed successfully
  - unrelated existing warnings remain elsewhere in the repo
- `npx tsc --noEmit` completed successfully
- Verified seller workspace routes still render:
  - `/u/bmacd/marketing` -> `200`
  - `/u/bmacd/marketing/auctions/cm9rj6wh7000dy8uj39577tvf` -> `200`

### AI env/config note
The upgraded AI flows still require the existing server-side OpenAI configuration:
- `OPENAI_API_KEY`
- optional model envs already supported by the repo

I did not force live model execution as part of validation, so the phase is validated at the type/lint/runtime integration level rather than through live OpenAI output sampling.

## Intentionally Deferred
- Assistant implementation
- autonomous posting
- autonomous campaign execution
- image generation systems
- charting or analytics backend expansion for AI
- database schema changes for deeper Listing AI run hashing / parity
- large seller-AI wizard rewrite

## Recommendation for Phase 5
### Phase 5
Carasta Assistant MVP

### Recommended scope
- build the curated-knowledge assistant on top of the stronger public content system
- keep it retrieval-grounded and citation-friendly
- use the improved product vocabulary and structured public docs from earlier phases
- keep seller/account-specific guidance separate until scope and policy are explicitly defined
