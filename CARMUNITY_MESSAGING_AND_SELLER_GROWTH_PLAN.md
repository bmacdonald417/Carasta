# Carmunity Messaging, Seller Marketing Expansion, and Seller Growth — Plan

This document is a **planning and sequencing pass only** (no implementation). It is grounded in the **current Carasta repo** as of the audit date and aligns three initiatives: **user messaging**, **seller marketing workspace maturity**, and an **AI seller marketing copilot**.

---

## 1. Executive summary

Carasta already has a **credible seller marketing foundation**: Prisma models for traffic, rollups, campaigns, and presets; owner-only routes under `app/(app)/u/[handle]/marketing/*`; ingestion and rate limiting at `POST /api/marketing/track`; deterministic copy helpers (`generateSellerShareCopy`, `generateCarmunityDraft`); marketing alerts written into the **same** `Notification` table used by Carmunity discussions; and admin/export/observability paths. **There is no first-party direct messaging domain** in schema or API today—only public discussions, Carmunity feed, and a generic marketing-site `contact` endpoint.

**Unified identity** remains the `User` row (`id`, `handle`, profile fields). **Safety primitives** already exist for social: `UserBlock`, `UserMute`, discussion reports and hides, and `lib/user-safety` + `lib/forums/forum-service` integration for blocked content in discussions. **Notifications** are a flexible `type` + `payloadJson` + optional `actorId` / `targetId` pattern with cursor-based listing APIs.

**Strategic direction:** Treat the AI product as a **structured “seller growth assistant”** (plans, checklists, channel playbooks, saved artifacts tied to listings)—not a one-shot prompt box. Treat messaging as **private, user-to-user, policy-bound** communication that reuses identity, blocks, mutes, and the notification bell—**without** pretending Carasta is a full inbox replacement in phase 1.

**Recommended implementation sequence (single-threaded, low rework):**

1. **Seller marketing workspace upgrade + “plan artifact” persistence layer** (extends existing surfaces; gives AI outputs a durable home).
2. **AI marketing copilot MVP** (listing-scoped, structured JSON playbooks + guardrails; reuses marketing link kit and presets conceptually).
3. **Messaging phase 1** (1:1 threads, blocks, notifications, read state; explicit non-goals).
4. **Advanced copilot + execution loop** (exports, calendar-style scheduling metadata, tighter coupling to `TrafficEvent` / `AuctionAnalytics` and campaigns).
5. **Optional contextual messaging** (listing- or transaction-scoped threads, richer moderation).

A credible **variant** is to pull **messaging phase 1 earlier** if buyer–seller trust is the immediate priority; the tradeoff is larger net-new surface area before the AI workspace has a place to land outputs. The body of this document explains both paths.

---

## 2. Current state audit (codebase-grounded)

### 2.1 Seller marketing platform — what exists

| Area | Location / behavior |
|------|----------------------|
| Feature gate | `MARKETING_ENABLED` env → session `marketingEnabled` in `lib/auth.ts`; `isMarketingEnabled()` in `lib/marketing/feature-flag`. |
| Seller UI | `app/(app)/u/[handle]/marketing/page.tsx` (overview), `.../marketing/auctions/[auctionId]/page.tsx` (per-listing analytics + Share & Promote + Carmunity promo), campaigns and presets CRUD under `.../marketing/campaigns/*`, `.../marketing/presets/*`. |
| Components | `components/marketing/*` (share/promote panels, copy helpers, alerts). |
| Schema | `TrafficEvent`, `AuctionAnalytics`, `Campaign`, `CampaignEvent`, `MarketingPreset`; enums `MarketingTrafficEventType`, `MarketingTrafficSource`, `MarketingCampaignStatus`. |
| Ingestion | `POST /api/marketing/track` → `recordTrafficEvent` with rate limits + observability (`lib/marketing/*`). Client beacon `lib/marketing/send-marketing-track.ts`. |
| Copy generation (non-LLM) | `lib/marketing/generate-share-copy.ts`, `lib/marketing/generate-carmunity-draft.ts` (deterministic templates aligned with UTM/link kits). |
| Marketing ↔ Carmunity listing | `Post.auctionId` for auction-linked promo posts; auction marketing page includes Carmunity promo and linked posts section. |
| Alerts | `lib/marketing/generate-marketing-notifications.ts` creates rows in `Notification` with `MarketingNotificationType` prefix (`lib/marketing/marketing-notification-types.ts`). |
| Digest | `app/api/jobs/marketing-digest/route.ts`, `lib/email/send-marketing-digest-email.ts`, user flags `weeklyMarketingDigestOptIn`. |
| Exports / admin | `app/api/u/[handle]/marketing/export/*`, `app/api/admin/marketing/*`, runbooks and phase notes (`MARKETING_*`). |

**Reuse:** Traffic + rollup stack, preset/UTM bundle builders, marketing notifications, owner-only authorization pattern (`getSession` + `user.id` match), and marketing UI shell are all strong foundations for a “workspace-grade” product.

**Gaps for a high-value workspace:** No first-class **cross-channel marketing plan** document (objectives, timeline, creative variants, owner tasks) beyond `Campaign` (mostly metadata + `CampaignEvent` stream). No **calendar / checklist** UX tied to listing lifecycle. No **LLM** layer for seller-facing generation (by design today). `MarketingTrafficSource` does not yet include **Google Ads / X** as first-class enum values (extensible via metadata today).

### 2.2 Notifications — what exists

- Model: `Notification` with `type`, `payloadJson`, optional `actorId`, `targetId`, `readAt`.
- APIs: `GET /api/notifications` (cursor pagination), unread count, per-id read, read-all; deprecated `GET /api/notifications/list`.
- UI: `components/notifications/NotificationDropdown.tsx` (bell in shell).
- Writers: e.g. `lib/marketing/generate-marketing-notifications.ts`; discussion-related writers under `lib/notifications/carmunity-discussion-notifications.ts` and `carmunity-retention-notifications.ts` (imported from `lib/forums/forum-service.ts`).

**Reuse:** New `MESSAGE_NEW` (name TBD) notification types with structured payloads and `actorId` for sender; respect `UserMute` when enqueueing (see §6).

### 2.3 Profiles, follows, activity — what exists

- Profiles: `/u/[handle]` hub pattern; garage, listings, marketing (owner).
- Follow model: `Follow` + Carmunity API `app/api/carmunity/users/[id]/follow/route.ts` (per mobile contract docs in repo).
- Activity: `app/api/activity-feed/*`, Pusher + SSE patterns for public activity (`lib/pusher.ts`, `lib/activity-emitter.ts`).

**Reuse:** “Start conversation” entry points from profile cards using **user id** (not handle in APIs). Activity feed is **not** the right transport for DMs; keep DMs out of public activity types.

### 2.4 Moderation, blocks, mutes — what exists

- Schema: `UserBlock`, `UserMute`, `DiscussionReport`, hidden thread/reply flags.
- APIs: `POST/DELETE /api/user/block`, `POST/DELETE /api/user/mute`.
- Discussions: `listBlockedUserIdsForBlocker` / `viewerBlocksUserId` from `lib/user-safety` used in `lib/forums/forum-service.ts`.

**Reuse:** Central **“can these two users exchange a DM?”** policy helper should compose block direction + (optional) account bans later. **Do not** assume mutes hide historical DMs unless product says so—today mute is documented as notification noise reduction for discussions.

**Gap / risk:** Discussion reporting pipeline does **not** automatically cover private messages; messaging needs its own **report category** (or generalization of “content report” with `targetKind`).

### 2.5 Chat / messenger — what exists

- **No** `Conversation`, `Message`, or inbox tables in `prisma/schema.prisma`.
- No `/api/.../messages` routes located in the API inventory.
- Public **Discussions** (`ForumThread`, `ForumReply`) are the only threaded user text outside the Carmunity feed comments.

**Risk if deferred:** Later “message bidder” features accrete as hacks (e.g. comments or external links). Better to introduce a **thin, explicit** messaging core early **or** consciously postpone and forbid UX that implies DMs until ready.

### 2.6 AI or generation-related surfaces — what exists

- **Deterministic** seller/share copy and Carmunity drafts (`lib/marketing/generate-*`).
- **Admin / internal agent** plumbing: `AgentRun`, `AgentRunEvent`, routes under `app/api/agent/*`, and `app/api/ai/incorporate-feedback/route.ts` tied to **Element Feedback** workflows (Claude Code routine), **not** seller marketing.

**Gap:** No seller-facing LLM route, no prompt logging policy in product code, no structured “marketing plan” JSON schema persisted for sellers.

### 2.7 Listing / seller / auction context — what exists

- Rich `Auction` model and seller ownership checks across sell/listing/marketing pages.
- `ForumThread.auctionId` and API `app/api/auctions/[id]/discussion-thread/route.ts` for listing-anchored discussion.
- Marketing per auction page already composes analytics, campaigns, presets, share bundles, and Carmunity promo.

**Reuse:** AI copilot should **default-anchor** to `auctionId` + seller id, reuse `buildMarketingLinkKit` / share bundle concepts, and optionally link generated plans to existing `Campaign` rows or supersede with a clearer domain name in a later migration.

---

## 3. Product model by initiative

### A. Chat / messenger

**Phase 1 should include**

- **1:1 conversations** between two authenticated users, keyed by stable `User.id` pair (normalized ordering in DB).
- **Text messages** with server timestamps, pagination, read receipts **or** simple “last read at” per participant (pick one model in implementation spec).
- **Hard enforcement** of `UserBlock` (both directions as product requires—typically **either** block prevents initiation; policy choice must be explicit).
- **Notifications** for new messages using existing `Notification` infrastructure + dropdown.
- **Mute** respected for **message notifications** (align mute semantics for messaging explicitly—recommended: mute suppresses DM notifications but does not delete threads).
- **Reporting** entry point for message content (minimal: “report conversation” with reasons, creates admin-visible record).
- **Rate limits** and basic anti-spam (mirror marketing track philosophy: IP + user limits).
- **Identity**: participants are always real `User` rows; surface handle + avatar from profile.

**Phase 1 should explicitly exclude**

- Group chats, media/voice, E2E encryption claims, “message anyone” without a gating signal (follow mutual, prior bid, or explicit accept—product choice), full-text search, typing indicators, message edits (or allow edits with audit—defer), seller CRM pipelines, email bridging, SMS, and **unsolicited marketing broadcasts**.

**Listing / auction context**

- **Defer to phase 2+** as **optional metadata** on a thread: `auctionId`, `contextKind` (`GENERAL`, `LISTING`, `POST_TRANSACTION`). Phase 1 can still **deep-link** “message from profile” without binding to a listing.

**Safety / moderation**

- Reuse community guidelines as **DM acceptable-use policy**; store acknowledgment timestamp if legally desirable (reuse patterns from sign-up consents on `User`).
- Admin tools: ability to **disable messaging** per user, inspect reported threads, and delete messages (soft-delete pattern consistent with discussions hide).

### B. Seller marketing platform (workspace-grade)

**Target experience**

- A **single workspace** per seller that answers: “What should I do this week for each live listing, on which channels, with what assets, and how do I know it worked?”
- **Campaign planning** beyond the current `Campaign` name/type/status: objectives (awareness vs bid intent), primary channels, weekly focus, and linkage to presets and UTM strategy.
- **Execution workflows**: step lists per channel (e.g. “boost post,” “create Google search campaign,” “email your list”), each with **owner checkboxes**, due hints, and links out to external tools.
- **Calendar-style planning**: lightweight **scheduled intents** (JSON + date) rather than a full calendar product in v1 unless scope allows.
- **Exports / handoff**: build on existing CSV/JSON export endpoints; add “copy pack” export (all channel snippets in one document).

**Ties to analytics and saved content**

- Continue to treat `TrafficEvent` + `AuctionAnalytics` as **source of truth** for performance; workspace surfaces “plan vs outcomes” deltas.
- Saved threads (`ForumThreadSubscription`) and Carmunity promo posts are **inputs** to planning (“what already ran”) not replacements for workspace tasks.

### C. AI marketing copilot (positioning)

See dedicated spec: **`SELLER_AI_MARKETING_COPILOT_SPEC.md`**. In one line: a **multi-step assistant** that produces **structured, channel-specific playbooks and copy packs** tied to a listing, with explicit **next actions**, **save/version**, and **guardrails**—not generic fluff generation.

---

## 4. Phased roadmap (realistic)

| Phase | Name | Outcome |
|-------|------|---------|
| **P0** | Foundations (parallel prep) | Product copy for DM policy; finalize block/mute semantics for DMs; design notification types; decide listing-thread deferral. |
| **P1** | **Seller workspace upgrade** | Unified hub UX, per-listing “plan” placeholder UI, checklist model (DB), exports improved, optional calendar intents (JSON). |
| **P2** | **AI copilot MVP** | Listing picker → channel selection → structured plan JSON persisted → rendered playbook UI + editable copy blocks + save. |
| **P3** | **Messaging phase 1** | Schema + APIs + minimal UI (inbox + thread) + blocks + notifications + reports + rate limits. |
| **P4** | **AI copilot advanced** | Regeneration with version history, tone controls grounded in listing facts, “apply UTM preset” integration, channel additions (Google, X) with **metadata-first** if enums lag. |
| **P5** | **Execution + analytics loop** | Mark tasks done → optionally log marketing events or notes; correlate with `TrafficEvent` spikes; digest improvements. |
| **P6** | **Contextual messaging** | Listing-attached threads; optional gated “message seller” from auction detail with anti-spam gates. |

**Why P1 before P3 in the default ordering:** The repo already has rich marketing routes and analytics; adding **plan/checklist persistence** avoids rework when AI arrives. Messaging is greenfield and benefits from a clear notification + policy spec that can ship after the AI artifact model exists—unless buyer trust dictates otherwise (**variant: P3 before P2**).

---

## 5. Data / API / UI implications (by initiative)

### 5.1 Messaging

| Layer | Likely additions |
|-------|------------------|
| Schema | `Conversation` (participant pair, normalized key, timestamps), `Message` (body text, senderId, conversationId, sequence, soft delete flags), optional `MessageReport`. |
| APIs | `GET/POST` conversations, `GET/POST` messages, `POST` report, read-state endpoint. JWT/session patterns should mirror `getJwtSubjectUserId` for mobile parity. |
| UI | `/messages` inbox, thread view, integration entry points on `u/[handle]` profile (owner/other). **Not** in bottom nav until stable—bell drives discovery initially. |
| Moderation | New admin queue or extension of existing discussions admin if patterns align. |
| Deferred | Groups, attachments, E2E, listing binding, real-time beyond polling/Pusher (if chosen). |

### 5.2 Seller workspace upgrade

| Layer | Likely additions |
|-------|------------------|
| Schema | `MarketingPlan` / `MarketingTask` (or reuse `Campaign` with typed `CampaignEvent`—risk: semantic overload; prefer explicit plan/tasks tables linked to `auctionId`). |
| APIs | CRUD for plans/tasks under `/api/u/[handle]/...` with ownership checks mirroring marketing export routes. |
| UI | Tabs on `marketing/auctions/[auctionId]` for **Analytics | Share & Promote | Plan | Checklist | Copilot** (Copilot tab gated later). |
| Deferred | Full editorial calendar, multi-user seller teams, permissions. |

### 5.3 AI copilot

| Layer | Likely additions |
|-------|------------------|
| Schema | `SellerCopilotRun` (auctionId, userId, status, model metadata, input snapshot JSON, output JSON, parentRunId for versions). **Avoid** overloading `AgentRun` (currently organization-scoped for feedback). |
| APIs | `POST` start run, `GET` run status, server-side streaming optional; **strong** auth + listing ownership checks. |
| UI | Workspace panel with step wizard + per-channel accordions + save/export. |
| Guardrails | Rate limits, prompt injection defenses, **disallow PII exfiltration** instructions, log retention policy, human edit before “copy to clipboard” for compliance-sensitive claims (mileage, provenance). |

---

## 6. Moderation and safety cross-cutting rules

- **Blocks:** If A blocked B, **neither** should receive unsolicited new threads from the other (exact policy: recommend **symmetric send denial** once block exists).
- **Mutes:** Define whether muted users’ DMs are hidden entirely vs only silenced—document and implement consistently in `Notification` writers.
- **AI outputs:** Mark as **suggestions**, never auto-post to Carmunity or external networks without explicit user action.
- **Abuse vectors:** DM spam, scam links, off-platform payment coercion—pair messaging with **report + rate limit + link warning** heuristics in later phase if needed.

---

## 7. Risks and non-goals

| Risk | Mitigation |
|------|------------|
| Messaging becomes moderation liability | Phase 1 includes report + rate limits + clear policies; start with gated entry (e.g. mutual follow or prior thread participation). |
| `Campaign` model overload | Introduce `MarketingPlan` / tasks rather than forcing LLM outputs into `Campaign.type` string. |
| AI generates non-compliant vehicle claims | Ground outputs in listing fields + require user attestation checkbox before export. |
| Enum churn for channels | Use `Json` channel descriptors + optional enum extension later. |

**Non-goals (near term):** Full ad network integrations, automated posting agents, encrypted messaging promises, cross-app OAuth for Meta/Google inside Carasta.

---

## 8. Recommended build order (decision)

**Default (minimizes rework for AI + workspace synergy):** **P1 workspace/plan persistence → P2 AI copilot MVP → P3 messaging phase 1 → P4–P6.**

**Alternate (buyer–seller trust first):** **P3 messaging phase 1 → P1 workspace → P2 AI** — choose if marketplace liquidity is blocked without DMs.

---

## 9. Exact recommended first execution phase

**Phase P1 — Seller marketing workspace upgrade + plan/checklist persistence**

**Deliverables**

- Data model for **per-listing marketing plan + tasks** (normalized tables, not ad-hoc JSON only).
- Workspace UI that surfaces **plan + checklist** beside existing Share & Promote and analytics on `marketing/auctions/[auctionId]`.
- Minimal **export** enhancement (single “handoff doc” combining links + tasks + deterministic copy).

**Why start here:** The codebase already invests in `lib/marketing/*` and owner-only pages; extending them avoids parallel “floating AI UI” with nowhere to persist results and aligns with `TrafficEvent` / `AuctionAnalytics` for later closed-loop reporting.

---

## 10. References (in-repo)

- `prisma/schema.prisma` — domain models cited above.
- `app/(app)/u/[handle]/marketing/*` — seller marketing UX.
- `app/api/marketing/track/route.ts` — ingestion pattern to mirror for rate limiting discipline.
- `lib/forums/forum-service.ts` + `lib/user-safety` — block-aware social patterns.
- `lib/notifications/*` — notification writers for discussions and retention.
- `MARKETING_IMPLEMENTATION_PLAN.md` + `MARKETING_HANDOFF_INDEX.md` — historical marketing architecture context.
