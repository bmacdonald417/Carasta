# Carmunity Phase 2U — In-product help surfacing + retrieval readiness

## 1) Files created

- `lib/help/product-help.ts` — canonical in-product help contexts, stable `topicId` keys, intro copy, and deep-link sets to public Resources / trust / marketing pages.
- `components/help/ContextualHelpCard.tsx` — lightweight contextual help UI (`data-product-help-context`, per-link `data-canonical-help-topic` / `data-canonical-help-href`).
- `CARMUNITY_PHASE_2U_IN_PRODUCT_HELP_SURFACING.md` (this document)

## 2) Files modified

- `components/carasta/CarastaLayout.tsx` — signed-in avatar menu: **Help center** → `/resources`.
- `components/guest-gate/GuestGateModal.tsx` — guest gate: contextual help block (`guest.gate` context).
- `app/(app)/settings/page.tsx` — settings hub: `settings.account` help card.
- `app/(app)/settings/carmunity-settings-section.tsx` — Carmunity interests card: `carmunity.settings_interests` help card.
- `app/(app)/sell/page.tsx` — sell flow: `market.sell` help card.
- `app/(app)/welcome/page.tsx` — post-signup welcome: `product.welcome` help card.
- `app/(app)/messages/page.tsx` — messages index: `product.messages` help card.
- `app/(marketing)/explore/page.tsx` — signed-in Explore: `carmunity.explore` help card.
- `app/(marketing)/discussions/page.tsx` — Discussions index: `carmunity.discussions` help card (all visitors).
- `app/(marketing)/auctions/page.tsx` — Market auctions browse: `market.auctions` help card.
- `app/(app)/u/[handle]/marketing/page.tsx` — seller marketing workspace: `seller.marketing` help card.

## 3) Biggest in-product help surfacing improvements

- **High-value journeys now carry explicit, native-feeling “Help & resources” blocks** that deep-link into the **canonical public** layer (Resources, How it works, trust, contact) instead of inventing parallel in-app help walls.
- **Signed-in users get a persistent Help center entry** in the avatar menu (`/resources`), improving discoverability without changing top nav structure.
- **Guest gate** now surfaces the same trust/orientation story as the rest of the product (FAQ, How it works, Trust & safety) for people deciding whether to join.

## 4) Product-to-resource mapping improvements

| Product surface | Help context id | Primary canonical destinations |
| --- | --- | --- |
| Explore (signed-in) | `carmunity.explore` | What is Carmunity?, Discussions basics, FAQ |
| Discussions | `carmunity.discussions` | Discussions basics, Messages basics, Trust & safety, Community Guidelines |
| Carmunity settings (interests) | `carmunity.settings_interests` | What is Carmunity?, Discussions basics, FAQ |
| Auctions browse | `market.auctions` | Auction basics, Buying on Carasta, Trust & safety |
| Sell / listing wizard entry | `market.sell` | Selling on Carasta, Auction basics, Trust & safety |
| Settings (account) | `settings.account` | Profiles & Garage, Messages basics, FAQ, Contact |
| Messages | `product.messages` | Messages basics, Discussions basics, Trust & safety |
| Seller marketing workspace | `seller.marketing` | Selling on Carasta, Auction basics, Trust & safety |
| Welcome | `product.welcome` | How it works, FAQ, Trust & safety |
| Guest gate modal | `guest.gate` | How it works, FAQ, Trust & safety |

## 5) Retrieval-readiness improvements

- **Stable `topicId` strings** on every surfaced link (e.g. `resource.discussions_basics`, `policy.community_guidelines`) for future assistant routing, analytics, or retrieval indexing — without building RAG/vector infrastructure in this phase.
- **`data-product-help-context`** on each help card instance so future tooling can correlate **surface → intent → canonical href**.
- **Consistent labeling**: “Help center” in the shell menu, card titles aligned to **Carmunity / Market / Resources** language from Phase 2T.

## 6) Shared patterns / components introduced or extended

- **`getProductHelpIntro` / `getProductHelpLinks`** in `lib/help/product-help.ts` — single source of truth for which URLs belong to which in-product context.
- **`ContextualHelpCard`** — reusable, minimal UI for contextual help; optional `showExcerpts` (default off) reserved for future use.

## 7) Intentionally deferred

- No assistant UI/logic expansion, no nav redesign, no review-mode retirement, no app parity, no event/show work, no major backend or search/RAG pipeline.
- No inline duplication of long Resource page bodies — only short intros + deep links.
- Per-listing auction detail pages, thread detail composers, and other secondary surfaces were not exhaustively instrumented to avoid clutter; the **highest-traffic hubs** above were prioritized.

## 8) Recommendation for the next phase

**Phase 2V — Assistant retrieval wiring (bounded):** use the stable `topicId` + `data-product-help-context` hooks to drive a **read-only** in-app “Suggested help” strip or command-palette entries that resolve only to canonical URLs (still no full agent), optionally backed later by embeddings while keeping the product-facing taxonomy owned by `lib/help/product-help.ts`.

## Validation

- Run: `npm run lint` and `npx tsc --noEmit` before merge (see commit / CI).
