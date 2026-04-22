# Carasta — Post–Phase 1 Reassessment

**Date:** 2026-04-21  
**Scope:** Planning only. Treats Phase 1 visual-consistency work as **completed progress** grounded in repo docs and targeted code inspection. Does **not** reopen locked design doctrine.

---

## 1. Executive summary

Phase 1 (substrate through public homepage/marketing, plus targeted cleanup and a final semantic drift pass) has **materially normalized** the web product’s light-first token vocabulary, shell, and the highest-traffic vertical slices. The system baseline is strong enough that **new work should extend tokens and shared primitives**, not fork hex values at route level.

Remaining gaps are **no longer “Phase 1 substrate” problems**. They cluster into: (a) **interaction and utility surfaces** not covered by the vertical-slice passes, (b) **content/IA depth** on nested public help routes, (c) **temporary review/demo mode** as a security and product-trust liability once the site is treated as real production, and (d) **Flutter/web family drift** at the shell level despite recent semantic token fixes in the app.

---

## 2. What Phase 1 successfully normalized (evidence-backed)

Sources: `CARMUNITY_PHASE_1A` … `CARMUNITY_PHASE_1I*`, `CARMUNITY_PHASE_1_HOMEPAGE_AND_PUBLIC_IA.md`, `CARMUNITY_TARGETED_LEGACY_DRIFT_CLEANUP.md`, `CARMUNITY_FINAL_SEMANTIC_DRIFT_SCAN.md`.

### 2.1 Substrate / tokens / primitives

- **Canonical semantic CSS** (`styles/carasta.semantic.tokens.css`): light-first core roles, secondary dark mapping, semantic state groups (`info`, `success`, `caution`, `danger`), elevation shadows, motion variables, performance/reserve auction signals, heritage copper isolated from functional primary.
- **Imports and ordering** (`carmunity-tokens.css`, `globals.css`): tokens before marketing chrome; `.glass` made selective.
- **Primitives:** Card (solid default, glass opt-in), Dialog/Dropdown/Select overlays, Button/Tabs/Toast transitions aligned to tokens; Tailwind extensions for semantic colors and `shadow-e*`.
- **Typography leakage:** global Oswald/uppercase heading injection removed from marketing CSS; display type opt-in.
- **Mechanical contrast repair:** widespread `text-neutral-100` → `text-foreground` where light surfaces would otherwise break.

### 2.2 Shell

- **Shared nav contract** (`lib/shell-nav-styles.ts`): header app rail, sidebar, mobile bottom nav use the same active/inactive/focus language.
- **CarastaLayout:** token-driven shell materials; removed ad-hoc dark dropdown slabs where touched in Phase 1B.
- **Notifications dropdown:** popover material parity with other overlays; caution semantic for review callouts; Badge for counts.

### 2.3 Homepage / public pages

- **Homepage IA** (Phase 1 homepage doc): Carmunity-first story, section order, removal of weak trust section, resource scaffolding.
- **Phase 1I:** homepage sections, stats strip, live activity, auction strip, showroom hero controls aligned to tokens; marketing routes (`how-it-works`, `why-carasta`, resources hub, FAQ, trust-and-safety, contact, legal drafts) moved to **card + border + muted band** rhythm consistent with product surfaces.

### 2.4 Messages

- List, thread, listing context card, composer, empty/error/review states: **card/elevation/border** vocabulary; primary Send (not performance red); caution for review hints.

### 2.5 Discussions (canonical term preserved)

- Landing through thread/replies/composer/report flows: tokenized panels, Badge for demo markers, primary (not performance) for serious actions like submit report; listing context card aligned with Messages.

### 2.6 Explore (Carmunity)

- Feed, strips, post detail, comments: opaque cards, hover elevation, muted Share chrome, Tabs and reaction pickers aligned with overlay tokens.

### 2.7 Profile / garage

- Profile header, garage/dream/listings, activity, trust, social links: removed heavy glass/black gradients where touched; Badge semantics for listing status; focus rings aligned with shell.

### 2.8 Auctions (public browse + detail)

- Index, filters, cards, detail panels: calmer bid/countdown typography; Badge semantics; reserve meter without amber bridge; map/listing semantic fixes in final drift scan.

### 2.9 Seller / admin cluster

- Sell wizard and seller marketing primitives: operational **background + card** language; admin layout/dashboard/marketing no longer on bespoke near-black neon substrate; Phase 1I-bis completed moderation/reputation admin sub-routes and removed decorative seller grid wallpaper.

### 2.10 Semantic consistency (late passes)

- **Targeted cleanup:** contact, how-it-works timeline/steps, seller campaigns surfaces, merch — removed misused hot-pink/performance CTAs and dark glass slabs called out in that pass.
- **Final semantic drift scan (2026-04-21):** auction map CTAs, leaderboard static column, marketing digest email accent, share dropdown popover surface, `.live-pulse` token wiring; Flutter `AppColors` accent vs heritage copper role correction (web family alignment for **roles**, not full app shell parity).

### 2.11 What Phase 1 explicitly did *not* claim to finish

- Exhaustive `/resources/**` article-by-article audit (Phase 1I deferred nested guides beyond FAQ/trust-and-safety).
- Some secondary marketing routes and `next/image` refactors (lint-only debt).
- Full Flutter light-first shell parity with web (drift scan notes dark-first app shell still out of scope).

---

## 3. What still visibly or systemically drifts

Findings combine **documented deferrals** with **spot checks** in the current repo.

### 3.1 Authenticated utility / account surfaces

- **`app/(app)/settings/page.tsx`** (inspected): still uses **`font-display` + uppercase** for the page title, **`text-neutral-400`** for subtitle copy, and a **glass-style panel** (`border-white/10`, `bg-white/5`, `backdrop-blur-sm`). This is **pre-Phase-1A marketing chrome** on a signed-in trust surface (email, digest opt-in, onboarding reset). It is the clearest **family mismatch** versus Messages/Profile slices.

### 3.2 Review mode presentation vs product semantics

- **`components/review-mode/review-mode-banner.tsx`** uses **raw Tailwind amber** (`amber-50`, `amber-200`, etc.). Elsewhere, review/demo hints were moved toward **semantic `caution*`** tokens (Phase 1B/1D precedent). The banner is readable but **not token-aligned** and sits above every layout.

### 3.3 Interaction layer (cross-cutting)

- Vertical-slice docs repeatedly scoped **loading/error** to “good enough” token colors, not a **unified skeleton system** or motion choreography audit across routes.
- **`no-img-element`** warnings remain noted in Phase 1I / drift scan validation — quality/perf debt, not visual doctrine debt.

### 3.4 Public content depth and IA

- Phase 1I: nested resource articles inherit layout improvements but were **not individually polished** for tone, trust density, or stray legacy utilities.
- Legal/trust copy maturity is still called out as **non-final** in review documentation.

### 3.5 App / site family

- Flutter: **accent role** corrected toward blue-violet; **shell and density** still not audited for parity with web light-first experience (`CARMUNITY_FINAL_SEMANTIC_DRIFT_SCAN.md` deferrals). Companion plan (`CARASTA_APP_SITE_PARITY_COMPANION_PLAN.md`) still labels several app areas placeholders vs web.

### 3.6 Systemic risk: review mode behavior (not visual)

- **`lib/auth.ts` `getSession()`**: when `REVIEW_MODE_ENABLED`, unauthenticated server code can receive a **synthetic session** for the demo seller user — by design for review, **unsafe for real production**.
- **`middleware.ts`**: `/admin` and `/settings` authorize **without** a token when review mode is on.
- **`lib/auth/api-user.ts` `getJwtSubjectUserId`**: if `NEXTAUTH_SECRET` is missing **or** review mode is enabled, API identity can fall back to the **demo seller id** — catastrophic if misconfigured on any environment that touches real data.

These are **Phase 2 production-hardening** issues, not cosmetic drift.

---

## 4. Major priorities that remain (grouped)

| Priority | Category | Rationale |
|----------|-----------|------------|
| P0 | **Review mode retirement + auth hardening** | Synthetic sessions and relaxed middleware are incompatible with real users, SEO trust, and compliance narratives. |
| P1 | **Settings / account shell normalization** | Last obvious legacy glass + display heading on a core account route. |
| P1 | **Interaction polish** | Skeletons, consistent pending states, motion audit — affects perceived quality on all normalized surfaces. |
| P2 | **Public trust/content maturity** | Nested `/resources/**`, glossary-style pages, tone and proof density. |
| P2 | **Assistant UX refinement** | Launcher exists; polish trust, escalation, citations presentation — aligns with future help strategy. |
| P3 | **Formal app/site parity program** | Web tokens and vocabulary now stable enough to **document inheritance rules** and schedule app updates without naive layout parity. |

---

## 5. Biggest future drift risks (Part 6 preview)

1. **Route-level hex and legacy panels** reintroduced during feature work — mitigated by **lint/grep gates** and requiring new UI to use **Card + border + shadow-e*** patterns.
2. **`bg-signal` / `performance` variant misuse** for non-urgent CTAs — mitigated by scheduled grep (recommended in drift scan) and code review checklist.
3. **Email/PDF/off-web templates** forking colors — mitigated by **single exported accent** from `lib/design-tokens.ts` (digest already aligned).
4. **Review mode lingering** into real traffic — mitigated by explicit **retirement milestone** and removing synthetic-session code paths.
5. **Flutter inheriting wrong accent or dark shell** while web evolves — mitigated by **token doc sync** and parity companion updates after each web token change.

---

## 6. Critical unknowns requiring human input

- **Launch definition:** “Public launch” vs continued private beta — determines the **hard deadline** for review mode off.
- **Whether `/review` hub** stays as an internal tool behind separate auth after public launch, or is deleted entirely with review mode.
- **Railway / staging:** whether a **non-production** environment should keep review mode for QA (recommended: if yes, **never** point at production DB).
- **Legal finality:** when terms/privacy/community guidelines exit draft state — affects public trust phase sequencing.
- **Resourcing:** whether Phase 2A motion/skeleton work is owned by same agent as content/trust or split.

---

## 7. Relation to other repo roadmaps

Older Carmunity phase documents (`CARMUNITY_PHASE_2_PUBLIC_CONTENT_AND_TRUST.md`, `CARMUNITY_PHASE_L_SETTINGS_AND_POLISH.md`, etc.) remain useful **source ideas**; this reassessment **re-buckets** them after Phase 1 completion. The authoritative **next sequencing** is in `CARASTA_PHASE2_ROADMAP.md`.
