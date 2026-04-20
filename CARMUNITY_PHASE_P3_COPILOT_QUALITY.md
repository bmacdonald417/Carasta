# Carmunity / Carasta — Phase P3: Copilot quality, trust, and execution loop

This document describes **Phase P3** for the seller **AI marketing copilot**: auditable runs, quotas, editable review with partial regeneration, link-kit injection on apply, light listing analytics in the model context, output guardrails, and export/copy UX.

**Explicitly out of scope for P3:** image generation, auto-posting to external platforms, and messaging features.

---

## Schema changes

### `MarketingCopilotRun` (Prisma)

Persisted row for **every OpenAI-backed copilot call** (full generate or partial regenerate):

| Field | Purpose |
| --- | --- |
| `auctionId` | Listing the run belongs to |
| `createdById` | Seller who invoked the call |
| `intakeJson` | Request payload (intake + `_runKind`: `GENERATE`, `REGEN_TASK`, `REGEN_ARTIFACT`) |
| `outputJson` | Structured model output snapshot (full result or `{ task }` / `{ artifact }`) |
| `inputHash` / `outputHash` | Stable SHA-256 over canonical JSON for integrity / diff tooling |
| `model` | Chat Completions model id used |
| `createdAt` | When the run was stored |
| `appliedAt` | Set when apply completes with a valid matching `runId` (nullable) |

Indexes support rate limiting (`createdById`, `createdAt`) and listing history (`auctionId`, `createdAt`).

**Apply linkage:** `POST /api/marketing/copilot/apply` accepts optional `runId`. If present and owned by the seller for that auction, `appliedAt` is set after a successful workspace write. The client **updates `runId` to the latest run** after each partial regeneration so the ID shown in the UI matches the most recent OpenAI call; earlier runs remain in the database for a full audit trail.

---

## Rate limiting approach

Implemented in `lib/marketing/marketing-copilot-rate-limit.ts` as `assertCopilotOpenAiAllowed(userId)`:

1. **Daily cap:** Count of `MarketingCopilotRun` rows for the user with `createdAt >=` start of **UTC** calendar day. Compare to `MARKETING_COPILOT_DAILY_LIMIT` (default **25**).
2. **Cooldown:** Minimum seconds since the user’s **most recent** run (`MARKETING_COPILOT_COOLDOWN_SEC`, default **45**).

Enforced on:

- `POST /api/marketing/copilot/generate`
- `POST /api/marketing/copilot/regenerate-task`
- `POST /api/marketing/copilot/regenerate-artifact`

Failures return **HTTP 429** with a **plain `message`** string for the UI.

Environment variables (documented in `.env.example`):

- `MARKETING_COPILOT_DAILY_LIMIT`
- `MARKETING_COPILOT_COOLDOWN_SEC`

---

## Run lifecycle

1. **Generate:** Validate session → rate limit → load light metrics → call OpenAI → **sanitize** structured output → **`createMarketingCopilotRun`** → return `{ runId, copilot, listing }`. No workspace mutation.
2. **Review / edit:** Client holds editable draft; optional **Regenerate** per task or artifact (each creates **another** run).
3. **Apply:** Validate `copilot` with strict Zod schema → optional `runId` ownership check → merge plan positioning with strategy summary → **`injectLinkKitIntoArtifacts`** → persist plan / tasks / artifacts → **`markCopilotRunApplied`** when `runId` is valid.

---

## Editing and partial regeneration

### UI (`components/marketing/seller-marketing-copilot.tsx`)

- After generate, the seller can edit **plan**, **tasks**, and **artifacts** before apply.
- **Regenerate item** calls the partial endpoints with the **stored intake** from the last successful generate (`lastIntake`).
- Per-row **Copy** copies task text or artifact body to the clipboard.
- **Export JSON** / **Export Markdown** download a client-built pack (draft + optional `runId` / `intake` in JSON).

### Backend

- `POST /api/marketing/copilot/regenerate-task` — body: `auctionId`, `intake` (same shape as generate), `task` (current row).
- `POST /api/marketing/copilot/regenerate-artifact` — same pattern with `artifact`.

Responses are re-sanitized server-side; strict JSON schema is preserved via Zod.

---

## Link-kit injection

On apply only (not on generate), `injectLinkKitIntoArtifacts` maps artifact **channel** slugs to variants from `buildMarketingLinkKit`, appends **missing** tracked URLs, and deduplicates lines so sellers do not get repeated UTM blocks.

---

## Light analytics context

`loadCopilotLightMetrics` supplies **views**, **bid-related signals**, and **time remaining** (when the listing is live). These are injected into the generation prompt as structured JSON to nudge **urgency**, **CTA tone**, and **cadence** — not to change schema or hard business rules.

---

## Validation and guardrails

- **Strict Zod** on generate intake, apply body, and regenerate bodies.
- **`sanitizeCopilotStructuredResult`** (and block-level helpers for partial regen): length clamps, control-character removal, and soft replacement of **prohibited / absolute** marketing phrases before persistence or return.

---

## Export

- Copy buttons per task and artifact.
- Export pack as **JSON** or **Markdown** (local download only; no external posting).

---

## What was deferred

- **Execution automation:** scheduled posts, workflow engines, and platform OAuth posting.
- **Cross-run “session” grouping** in the UI (all runs are auditable in DB; the UI highlights the latest `runId`).
- **Admin dashboards** for run inspection (queries can use `MarketingCopilotRun` directly).
- **Stronger claim detection** (e.g. ML classifiers or jurisdiction-specific legal lists) — current guardrails are regex/heuristic.

---

## Success criteria (P3)

| Criterion | How it is met |
| --- | --- |
| Each AI generation is auditable | Every OpenAI path creates `MarketingCopilotRun` with intake/output hashes |
| Sellers can edit before saving | Review step uses controlled editors; apply sends edited `copilot` |
| Partial regeneration works | Task/artifact endpoints + UI regen buttons |
| Outputs include usable links | Link kit merged into artifacts on apply |
| Safe and predictable | Daily limit, cooldown, sanitization, strict schema |
