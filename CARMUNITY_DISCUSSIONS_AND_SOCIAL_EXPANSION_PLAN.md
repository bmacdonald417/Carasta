# Carmunity Discussions & Social Expansion Plan

This document describes how Carmunity’s **Discussions** surface (formerly “Forums” in product copy and URLs) fits the broader social layer, what already exists in the stack, and how we grow it in phases. It is **product and engineering guidance**, not legal advice.

---

## 1. Goals

- **Unify language**: “Discussions” in marketing and web nav; canonical URL `/discussions` with redirects from `/forums`.
- **Clarify the data model**: Align product language **Gear** and **Lower Gear** with persisted entities without breaking existing Prisma models.
- **Legal UX scaffolding**: Sign-up acknowledgments, timestamps on `User`, and structured legal/community pages with clear “pending counsel” framing.
- **Scale taxonomy**: A documented 20×(5–10) Gear / Lower Gear matrix for seeding and moderation (see `CARMUNITY_DISCUSSIONS_TAXONOMY.md`).

---

## 2. Current state (audit)

### 2.1 Web

- **Nav**: Header (`CarastaLayout`), sidebar (`AppSidebar`), mobile bottom nav, and legacy `Nav` reference `/forums` and “Forums” labels.
- **Route**: `app/(marketing)/forums/page.tsx` lists `ForumSpace` rows via `listForumSpaces()`.
- **Feed**: Explore page links to forums for threaded content.

### 2.2 Data (Prisma)

- **`ForumSpace`**: Top-level area (slug, title, sort order, active flag).
- **`ForumCategory`**: Bucket within a space (unique slug per space).
- **`ForumThread` / `ForumReply`**: Threaded UGC; tied to `User`.
- **Feed**: `Post`, `Like`, `Comment` remain the primary **feed** surface; discussions are a **separate** tree.

### 2.3 Auth & legal

- **Sign-up**: Email/password via `/api/auth/sign-up`; optional Google OAuth.
- **Privacy / Terms**: Placeholder marketing pages; no consent timestamps on `User` prior to this expansion’s Phase 2.

---

## 3. Target model (conceptual)

| Product term   | Persisted model   | Notes |
|----------------|-------------------|--------|
| **Gear**       | `ForumSpace`      | Keep table name; use “Gear” in UI/docs. |
| **Lower Gear** | `ForumCategory`   | Keep table name; use “Lower Gear” in UI/docs. |
| **Thread**     | `ForumThread`     | Unchanged. |
| **Reply**      | `ForumReply`      | Unchanged. |

**Feed vs Discussions**: Feed posts (`Post`) stay ephemeral/social; Discussions remain structured, moderatable, and category-scoped.

---

## 4. Phased roadmap

### Phase 0 — Decisions (ADRs)

Locked decisions are in **§5** below.

### Phase 1 — Information architecture & rename

- Canonical path **`/discussions`**; **301/308** redirect from **`/forums`** (Next config).
- Nav copy: **Discussions**; active state uses `/discussions` prefix.
- Marketing discussions page mirrors prior forums behavior (list spaces).
- Cross-links (explore, root metadata, footer) updated.
- **Contact**: Align layout and form with `carasta-theme` tokens (background, card, shadcn inputs).

### Phase 2 — Legal & consent scaffolding

- **`User`**: `acceptedTermsAt`, `acceptedPrivacyAt`, `acceptedCommunityGuidelinesAt` (nullable `DateTime`).
- **Sign-up**: Required checkboxes + links to Terms, Privacy, Community Guidelines; API persists timestamps when all three are true.
- **Privacy / Terms**: Sectioned draft outline + prominent “pending legal review” disclaimer.
- **`/community-guidelines`**: Stub page with draft outline + same disclaimer.
- **OAuth**: Google sign-in does not automatically set the same timestamps; follow-up: account settings or first-login gate (out of scope for minimal Phase 2).

### Phase 3+ (later; not implemented in this pass)

- Reactions on discussion posts (scope: posts-first per ADR).
- Badges / reputation tied to discussions (per ADR).
- Moderation tooling, reports, auto-seeding from taxonomy doc.
- Deep links from app ↔ web for same slugs.

---

## 5. Phase 0 — Architecture Decision Records (ADRs)

### ADR-001 — Gear maps to `ForumSpace`

**Decision**: Product “Gear” = `ForumSpace`. No table rename in Phase 1–2.

**Rationale**: Avoid migration churn and broken queries; rename is documentation and UI.

**Consequences**: Code comments and admin copy should say “Gear (ForumSpace)” during transition.

---

### ADR-002 — Lower Gear maps to `ForumCategory`

**Decision**: Product “Lower Gear” = `ForumCategory`.

**Rationale**: Same as ADR-001.

**Consequences**: Seeding scripts key off `(spaceSlug, categorySlug)` uniqueness per ADR-005.

---

### ADR-003 — Reactions scope (v1)

**Decision**: When reactions ship, **scope v1 to discussion posts** (`ForumThread` or a dedicated “original post” entity), not every reply.

**Rationale**: Reduces notification spam and moderation surface; matches common forum UX.

**Consequences**: Reply reactions deferred to v2 with separate moderation policy.

---

### ADR-004 — Badges (v1)

**Decision**: **Display badges** derived from existing `reputationScore` / `collectorTier` on profile and thread chrome; **no new gamification engine** until Phase 3.

**Rationale**: Ships value without new tables.

**Consequences**: Later ADR may introduce `DiscussionBadge` if product needs fine-grained forum karma.

---

### ADR-005 — UGC category model

**Decision**: All public UGC in Discussions must live under **Gear → Lower Gear → Thread**; no orphan threads.

**Rationale**: Moderation, SEO, and seeding depend on stable hierarchy.

**Consequences**: API and app must validate `spaceId` + `categoryId` on create.

---

## 6. Risks

| Risk | Mitigation |
|------|------------|
| Broken bookmarks to `/forums` | Permanent redirect to `/discussions`. |
| Google users lack consent timestamps | Document follow-up; settings or gate. |
| Taxonomy too broad to moderate | Start with subset of Gears live; feature-flag seeding. |
| Legal copy before counsel | Disclaimers on all legal pages; no “final” language. |

---

## 7. Non-goals (this expansion)

- Replacing Flutter app forum UX with web-only flows.
- Real-time chat or DMs.
- Full moderation queue UI.
- Renaming Prisma models `ForumSpace` / `ForumCategory` (optional far-future refactor).

---

## 8. References

- `CARMUNITY_DISCUSSIONS_TAXONOMY.md` — 20 Gears × 5–10 Lower Gears.
- `CARMUNITY_LEGAL_UX_IMPLEMENTATION_NOTES.md` — consent UX and counsel-review process.
