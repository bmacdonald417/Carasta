# Carmunity Phase 2V — Bounded assistant retrieval wiring (read-only)

## 1) Files created

- `lib/help/help-retrieval.ts` — deterministic pathname scoring, related-topic expansion, route→context resolver, schema version constant.
- `CARMUNITY_PHASE_2V_BOUNDED_RETRIEVAL_WIRING.md` (this document)

## 2) Files modified

- `components/help/ContextualHelpCard.tsx` — default **`retrievalMode="ranked"`**; optional **`static`**; primary cap; related cap; **`Suggested next`** tier; retrieval metadata attributes.
- `lib/help/product-help.ts` — header comment cross-linking Phase 2V retrieval.
- `app/(marketing)/auctions/[id]/page.tsx` — listing detail sidebar: `market.auctions` help (pathname ranks buyer links up on `/auctions/[id]`).
- `app/(app)/messages/[conversationId]/conversation-client.tsx` — compact ranked help strip for `/messages/[id]`.
- `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` — per-listing seller workspace: `seller.marketing` help with marketing-path ranking boost.

## 3) Biggest retrieval / help improvements

- **Deterministic retrieval layer**: same inputs (context + pathname) → same ordered primary links + same related expansion (no ML, no chat).
- **Canonical topic index**: `getCanonicalHelpTopicById` dedupes every `topicId` across all contexts for safe related-link resolution.
- **Schema version hook**: `HELP_RETRIEVAL_SCHEMA_VERSION` + `data-help-retrieval-schema-version` for future assistant / logging bridges.

## 4) Contextual suggestion improvements

- **Path-aware ranking** boosts:
  - **Discussion threads** (`/discussions/.../.../...`) → trust + guidelines + Discussions basics.
  - **Auction detail** (`/auctions/[id]`) → buying + auction basics + trust.
  - **Message threads** (`/messages/[conversationId]`) → Messages basics + trust.
  - **Marketing routes** (`/marketing/...`) with `seller.marketing` → selling + auction mechanics.
  - Light boosts for `/sell`, `/settings`, `/welcome`.
- **`Suggested next` block**: small secondary list (`data-help-link-tier="related"`) from an explicit **related-topic graph** (still only canonical URLs from the index).

## 5) Canonical routing / handoff improvements

- Primary links carry `data-help-link-tier="primary"`; related links carry `tier="related"`.
- Cards expose `data-help-retrieval-mode` and optional `data-help-retrieval-schema-version` for observability.
- Auction detail and seller per-listing marketing surfaces now include **explicit** help handoff to the same public Resources pages users already trust from Phase 2T.

## 6) Shared patterns / components introduced or extended

- **`getRetrievedHelpBundle`**, **`rankHelpLinksForPathname`**, **`collectRelatedHelpLinks`**, **`resolveProductHelpContextFromPathname`** in `lib/help/help-retrieval.ts`.
- **`ContextualHelpCard` extended** — ranked vs static, capped primaries, related tier, retrieval metadata.

## 7) Intentionally deferred

- No assistant chat UI, no generative answers, no embeddings/RAG, no nav redesign, no review-mode retirement, no app parity.
- No global help palette in shell (keeps density low); route resolver is available for a later palette without adding UI now.
- Thread detail pages under other URL shapes, admin-only surfaces, and exhaustive per-component wiring were not all instrumented.

## 8) Recommendation for the next phase

**Phase 2W — Read-only help palette / command entry (still non-agent):** add a single keyboard-friendly entry (e.g. `?` or `Ctrl+/`) that lists **only** `getRetrievedHelpBundle(resolveProductHelpContextFromPathname(path) ?? fallback, pathname)` results — still deterministic, still canonical URLs, but faster power-user routing.

## Validation

Run `npm run lint` and `npx tsc --noEmit` before merge.
