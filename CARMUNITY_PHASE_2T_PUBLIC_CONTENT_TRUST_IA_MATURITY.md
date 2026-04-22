# Carmunity Phase 2T — Public Content / Trust / IA Maturity

## 1) Files created

- `components/resources/ResourceContentSection.tsx`
- `components/resources/ResourceHubOrientation.tsx`
- `CARMUNITY_PHASE_2T_PUBLIC_CONTENT_TRUST_IA_MATURITY.md` (this document)

## 2) Files modified

### Resources hub + nested guides

- `app/(marketing)/resources/page.tsx`
- `app/(marketing)/resources/auction-basics/page.tsx`
- `app/(marketing)/resources/buying-on-carasta/page.tsx`
- `app/(marketing)/resources/discussions-basics/page.tsx`
- `app/(marketing)/resources/faq/page.tsx`
- `app/(marketing)/resources/glossary/page.tsx`
- `app/(marketing)/resources/messages-basics/page.tsx`
- `app/(marketing)/resources/profiles-and-garage/page.tsx`
- `app/(marketing)/resources/selling-on-carasta/page.tsx`
- `app/(marketing)/resources/trust-and-safety/page.tsx`
- `app/(marketing)/resources/what-is-carasta/page.tsx`
- `app/(marketing)/resources/what-is-carmunity/page.tsx`

### Public informational + trust surfaces

- `app/(marketing)/how-it-works/page.tsx`
- `app/(marketing)/why-carasta/page.tsx`
- `app/(marketing)/contact/page.tsx`
- `app/(marketing)/terms/page.tsx`
- `app/(marketing)/privacy/page.tsx`
- `app/(marketing)/community-guidelines/page.tsx`

### Shared patterns / IA map data

- `components/resources/resource-links.ts`
- `components/resources/ResourcePageLayout.tsx`

## 3) Biggest public content / trust improvements

- **Nested `/resources/**` pages no longer read like a separate “white card” styling system** (neutral hard-coded surfaces). They now use the same tokenized surfaces as the rest of the public shell (`border-border`, `bg-card`, `text-muted-foreground`, `shadow-e1`, muted inset blocks where appropriate).
- **Trust/policy pages feel more “product-connected”**: lightweight breadcrumbs + a consistent “Related trust and help pages” grid at the end reduces dead ends and makes the draft legal layer feel intentionally embedded in the Resources ecosystem.
- **Contact is clearer about escalation vs self-serve**: a dedicated “self-serve first” block routes users to FAQ / glossary / trust / How It Works before defaulting to email expectations.

## 4) Biggest IA / help / resource improvements

- **Resources hub orientation**: a practical “Start here” triage (How It Works → Trust & Safety → FAQ + glossary shortcut) that explicitly encodes **Carmunity / Market / Resources** without inventing a docs portal.
- **Stronger cross-linking between “story” pages and “mechanics” pages**: `Why Carasta` is now part of the Resources directory map, and key guides (`What is Carasta`, `What is Carmunity`, How/Why pages) cross-link more deliberately.
- **FAQ expansion focused on orientation** (not policy rewriting): new questions map common user intents to the right layer (social vs marketplace vs trust vs account/help).

## 5) Shared patterns / components introduced or extended

- **`ResourceContentSection`**: a small, reusable content card primitive for nested resource/help pages (default / muted / inset surfaces + consistent heading scale).
- **`ResourceHubOrientation`**: a hub-level orientation block for `/resources` (start paths + IA snapshot).
- **`ResourcePageLayout` extended**: optional back navigation to the Resources index (defaults to `/resources`) to reduce “orphaned guide” feeling across nested pages.
- **`resource-links` extended**: adds **`Why Carasta?`** to the Resources directory map so it can be used consistently by `pickResourceLinks` across pages.

## 6) Intentionally deferred

- **No homepage redesign**, no nav restructuring, no assistant feature expansion, no review-mode retirement work, no app parity work (per phase guardrails).
- **No substantive legal rewrite**: Terms/Privacy/Guidelines content remains draft-structured; changes are primarily **orientation, linking, and presentation cohesion** within the trust/help ecosystem.
- **No large docs platform**: no search, versioning, sidebar docs chrome, or CMS-like framework—kept intentionally lightweight and product-native.

## 7) Validation result

- `npm run lint`: **pass** (existing repo warnings only: `@next/next/no-img-element` in unrelated files)
- `npx tsc --noEmit`: **pass** (exit code 0)

Sanity checks performed via code review pass criteria for this phase:

- Key public routes touched compile and use existing marketing layout primitives.
- Nested `/resources/**` pages touched now share the same surface system as other marketing pages.
- Related-link grids use only `href`s present in `resource-links` (via `pickResourceLinks`).

## 8) Recommendation for the next phase

**Phase 2U — In-product help surfacing + retrieval readiness (without assistant expansion):** wire the matured Resources layer into the signed-in shell in lightweight, high-signal ways (contextual “Help” entry points, consistent deep links to the right guide/trust page, and optional “public excerpt” previews), so the informational ecosystem is as navigable *inside* the product as it is on marketing routes—still without reopening nav doctrine or building a full assistant.
