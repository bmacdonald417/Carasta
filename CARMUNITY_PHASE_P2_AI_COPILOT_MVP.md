# Phase P2 — AI Marketing Copilot MVP

This phase adds a **listing-aware AI marketing copilot** on top of Phase P1 (`ListingMarketingPlan`, `ListingMarketingTask`, `ListingMarketingArtifact`). Sellers complete a short intake, receive **structured** plan + checklist + channel drafts, **review** them, then **apply** them into the workspace. Nothing is auto-posted to Carmunity or third-party platforms.

---

## 1. Files created

| Path | Purpose |
|------|---------|
| `lib/validations/marketing-copilot.ts` | Zod schemas for intake, structured model output, and apply body; exported channel keys. |
| `lib/marketing/marketing-copilot-prompt.ts` | System prompt with product guardrails. |
| `lib/marketing/marketing-copilot-openai.ts` | OpenAI Chat Completions (`json_object` mode) via `fetch`; model + key helpers. |
| `lib/marketing/marketing-copilot-generate-service.ts` | Loads listing context, builds user prompt, validates model JSON. |
| `lib/marketing/marketing-copilot-apply-service.ts` | Transaction: upsert plan, append tasks + artifacts (versioned). |
| `app/api/marketing/copilot/generate/route.ts` | `POST` — generate structured draft (no DB writes). |
| `app/api/marketing/copilot/apply/route.ts` | `POST` — persist reviewed payload into workspace. |
| `components/marketing/seller-marketing-copilot.tsx` | Intake → generate → review → apply UI. |
| `CARMUNITY_PHASE_P2_AI_COPILOT_MVP.md` | This document. |

---

## 2. Files modified

| Path | Change |
|------|--------|
| `components/marketing/seller-marketing-workspace.tsx` | Embeds copilot; new props `listingCapsule`, `copilotConfigured`. |
| `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` | Loads `description` / `conditionSummary` for copilot context; passes capsule + `copilotConfigured` (from `OPENAI_API_KEY`). |
| `.env.example` | Documents `OPENAI_API_KEY` and optional `MARKETING_COPILOT_MODEL`. |

---

## 3. API routes

| Method | Path | Behavior |
|--------|------|------------|
| POST | `/api/marketing/copilot/generate` | Seller session + `MARKETING_ENABLED`; must own `auctionId`. Requires `OPENAI_API_KEY`. Returns `{ listing: summary, copilot }` — **does not save**. |
| POST | `/api/marketing/copilot/apply` | Same auth/ownership. Body `{ auctionId, copilot }` re-validated with Zod. Writes workspace. |

Both routes use `requireMarketingWorkspaceSession()` and `assertAuctionOwnedBySeller()` from `lib/marketing/marketing-workspace-auth.ts`.

---

## 4. Structured output model

Validated by `marketingCopilotStructuredResultSchema`:

- **`plan`**: `objective`, `audience`, `positioning`, `channels[]`, `summaryStrategy` (summary is merged into stored `positioning` on apply — see below).
- **`tasks[]`**: `title`, `description?`, `channel?`, `type?` (`ListingMarketingTaskType`).
- **`artifacts[]`**: `type` (`ListingMarketingArtifactType`), `channel`, `content`.

Intake body: `marketingCopilotGenerateBodySchema` (`auctionId`, `objectiveGoal`, optional tone/budget/urgency/highlights, `channels` from fixed keys: `carmunity`, `facebook`, `instagram`, `x`, `google`, `forums`, `email`).

---

## 5. How apply / save works

1. Client keeps the **exact** `copilot` object returned from `generate` (optionally edited in UI later — not implemented in P2; review is read-only display).
2. **`POST /api/marketing/copilot/apply`** merges `plan.summaryStrategy` into `plan.positioning` for persistence (separator `— Strategy overview —`) so the DB row does not need a new column.
3. **`applyCopilotToWorkspace`** (transaction):
   - **Upsert** `ListingMarketingPlan` for `auctionId` (create if missing; update if exists).
   - **Append** each task with title prefixed `[AI] ` unless already present (avoids double prefix).
   - **Append** each artifact with `version` = max existing `(planId, type, channel)` + 1 (same rule as manual artifact POST).

Existing tasks and artifacts are **not deleted**; AI checklist and drafts are additive. Manual workspace behavior is unchanged.

---

## 6. Environment / server configuration

| Variable | Required | Notes |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes, for generation | If unset, generate returns **503** and the UI shows a disabled-state notice. |
| `MARKETING_COPILOT_MODEL` | No | Defaults to `gpt-4o-mini`. |
| `MARKETING_ENABLED` | Yes | Copilot API uses the same marketing workspace session gate (`true`). |

No `NEXT_PUBLIC_*` keys for the model.

---

## 7. Guardrails (product + prompt)

System prompt enforces: no invented facts, no guaranteed performance, no legal/platform certainty, no deceptive tactics, JSON-only response. UI copy states outputs are suggestions and that nothing is auto-posted.

---

## 8. What was intentionally deferred

- **Streaming** / partial tokens, SSE.
- **Server-side rate limits** and per-seller quotas (add Redis or DB counters in a later phase).
- **Persisting “copilot runs”** as separate audit rows (only workspace rows are written today).
- **Editing** generated JSON in the browser before apply (review is display-only; re-generate to change).
- **Automatic injection** of UTM / marketing link kit into artifact text (copilot can mention links in prose; deterministic kit merge is a follow-up).
- **Image / creative generation**.
- **Auto-post** to Carmunity or ads APIs.

---

## 9. Validation run

- `npm run lint` — passes (existing repo warnings unrelated to P2 may still appear).
- `npx tsc --noEmit` — passes.

---

## 10. Recommended Phase P3

**Phase P3 — Copilot quality, trust, and closed loop**

1. **Persisted runs** — `MarketingCopilotRun` table (auctionId, input snapshot, raw model JSON hash, status) for support and iteration.
2. **Rate limiting** + **cost controls** (per seller / day).
3. **Editable review** — inline edit of plan/tasks/artifacts before apply; optional “regenerate section” API.
4. **Link kit merge** — server attaches `buildMarketingLinkKit` URLs into channel drafts where appropriate.
5. **Analytics tie-in** — surface last 7d `AuctionAnalytics` in the prompt context and suggest tasks based on deltas.
6. **Mobile** — Carmunity app contract for generate/apply if needed.

---

## 11. End-to-end flow (seller)

1. Open **Marketing → listing** workspace (`/u/{handle}/marketing/auctions/{id}`).
2. Expand **AI marketing copilot** → **Generate plan with AI**.
3. Confirm intake (goal, audience, positioning, channel checkboxes, optional tone/budget/urgency/highlights). Listing context is shown read-only.
4. **Generate draft** → model returns structured JSON → **Review** step shows plan summary, tasks, artifacts.
5. **Apply to workspace** → plan row updated/created; new `[AI]` tasks appended; new artifact versions appended → workspace refreshes.

This completes Phase P2 MVP criteria: structured, listing-aware, review-then-save, additive to P1, no auto-post.
