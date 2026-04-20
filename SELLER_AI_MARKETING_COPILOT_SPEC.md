# Seller AI Marketing Copilot — Product Specification

This spec defines the **AI-powered seller marketing copilot** as a **professional growth assistant**: multi-step, listing-grounded, channel-specific, and execution-oriented. It is **not** a generic “write me an ad” toy. Implementation is **out of scope** for this document.

**Relationship to codebase:** The copilot should sit beside existing deterministic marketing copy (`lib/marketing/generate-share-copy.ts`, `generate-carmunity-draft.ts`), **UTM / link kits** (`lib/marketing/build-marketing-links.ts`, `build-share-promote-bundle.ts`), **traffic truth** (`TrafficEvent`, `AuctionAnalytics`), and **owner-only** marketing pages (`app/(app)/u/[handle]/marketing/*`).

---

## 1. Product principles

1. **Grounding:** Every run is anchored to `auctionId` (and seller `userId`) with a frozen **listing snapshot** (title, year/make/model, mileage, highlights, endAt, status, primary image URL, known links). The model must not invent material facts not present in the snapshot unless explicitly labeled as **hypothetical** (“If you can verify…”).
2. **Structure over prose:** Primary artifact is a **machine-readable plan** (JSON schema) rendered as UI sections—not a wall of text.
3. **Channel playbooks:** For each selected channel, output **strategy → tactics → copy pack → measurement → next steps**.
4. **User control:** Wizard-style flow with **explicit confirmations** between steps; user can skip channels, edit fields, and regenerate **per channel** without rerunning the whole listing analysis.
5. **Save / version / export:** Runs are persisted; users can open history, compare, duplicate, and export (Markdown/JSON) consistent with existing seller export philosophy.
6. **Safety:** Outputs are **suggestions**; prohibited content categories mirror community guidelines; **no auto-posting** to Carmunity or third parties. Rate limits mirror marketing ingestion seriousness (`POST /api/marketing/track` patterns).
7. **Honest positioning:** The assistant explains **what Carasta can measure** (views, share clicks, bid clicks) vs what requires off-platform tools (Meta Ads Manager metrics, Google conversion tags).

---

## 2. Primary personas and jobs-to-be-done

| Persona | Job |
|---------|-----|
| Individual seller | “I listed a car and need a **credible promotion plan** for the week—social + search + email—without hiring an agency.” |
| Power seller | “I want **repeatable playbooks** per channel, saved variants, and faster iteration between auctions.” |
| Carasta (platform) | Increase **quality usage** of Share & Promote, Carmunity promo, and external UTM links—without increasing spam or policy risk. |

---

## 3. Ideal workflow (product-grade)

### Step 0 — Entry and eligibility

- **Entry points:** `marketing/auctions/[auctionId]` tab “Copilot”; optional quick action from marketing overview.
- **Gate:** Same owner checks as existing marketing pages; `isMarketingEnabled()` and future `COPILOT_ENABLED` flag if needed.
- ** Preconditions:** Listing at least `DRAFT` with minimum viable facts; warn if missing photos or description (copilot may still run but flags quality risks).

### Step 1 — Seller intent intake (structured)

Collect:

- **Primary goal** (pick one): maximize views / drive Carmunity engagement / accelerate bids / reinforce trust (condition story) / re-activate stale interest.
- **Time horizon:** e.g. 7 days vs “until reserve met” (informational; ties to checklist scheduling metadata).
- **Geography / shipping constraints** (optional text; must not leak PII into prompts—use seller-entered marketing region only).
- **Risk tolerance for claims:** default “conservative” (no superlatives without evidence in listing text).

Output of this step is **IntentProfile** JSON stored on the run.

### Step 2 — Channel selection

Multi-select channels from a curated set, e.g.:

- **Carasta / Carmunity** (always available as “owned” channel).
- **Instagram, Facebook, X, LinkedIn, TikTok** (organic playbook + optional “paid boost” guidance without API integration).
- **Google** (Search / Performance Max **education-only** in early phases—no API).
- **Email** (newsletter / personal network template).
- **Forums / niche communities** (non-Carasta) as optional “community outreach” module.

**Important:** Early versions can treat “Google” and “X” as **playbook + copy** without adding new enums to `MarketingTrafficSource`; track selected channels in run JSON.

### Step 3 — Audience framing (assistant-led interview)

Assistant asks 3–6 targeted questions based on listing class (e.g. modern truck vs classic Italian):

- Who is the likely buyer?
- Comparable set the seller believes in?
- Must-mention trust signals (service records, originality, patina)?
- Deal-breakers to avoid highlighting?

Output: **AudienceHypothesis** JSON with confidence tags (“grounded in listing” vs “seller supplied”).

### Step 4 — Content strategy (per channel)

For each selected channel, produce:

- **Positioning angle** (1–2 sentences, tied to facts).
- **Content pillars** for the horizon (e.g. 3 IG posts + 2 stories + 1 Reel idea).
- **Creative guidance** (shots to capture if missing—without claiming photos exist).

### Step 5 — Platform-specific playbooks

For each channel, a **Playbook** object:

| Section | Contents |
|---------|----------|
| Overview | What this channel is good for **for this listing**. |
| Algorithm / behavior notes | Plain-language (non-magic) guidance—frequency, hook patterns, comment strategy. |
| Posting cadence | Suggested schedule as relative offsets (Day 0, +2d, +5d) not calendar integration at MVP. |
| Creative specs | Character limits, hashtag policy, link placement, image aspect ratios. |
| Compliance | Auction-specific cautions (reserve talk, “as-is” language reminders). |
| Measurement | What seller can observe on-platform vs off-platform. |

### Step 6 — Copy / asset recommendations

Per channel deliver **copy packs**:

- **Primary post** variants (A/B in tone, not in facts).
- **Short hook** + **long caption** where relevant.
- **Carmunity post** variant that aligns with `generateCarmunityDraft` tone (optional: copilot calls deterministic generator for one variant and **explains** edits).
- **UTM-aware links:** Insert `MarketingLinkKit`-style URLs by **reusing** server builders (copilot server composes links; model fills text around them to avoid hallucinated URLs).

### Step 7 — Execution checklist

A ordered checklist with:

- **Task title**, **channel**, **due offset**, **definition of done**, **deep link** (Carasta marketing page section anchors, Carmunity compose if exists, or external).
- **Owner checkbox state** stored in DB (integrates with workspace upgrade tables from the master plan).

### Step 8 — Regeneration, editing, save, export

- **Regenerate:** per channel, per section (strategy vs copy vs checklist), with version pointer (`parentRunId` or `RunRevision`).
- **Edit:** user edits JSON-backed fields in UI; changes are saved as **user overrides** layered atop model output (diff-friendly).
- **Export:** Markdown + JSON; optional “copy all captions” button with per-block copy.
- **Telemetry (privacy-respecting):** count runs, completion, exports—not message content.

---

## 4. Data model sketch (implementation-agnostic)

**`SellerCopilotRun`**

- `id`, `userId`, `auctionId`
- `status`: `draft | running | completed | failed`
- `intentProfile` (Json)
- `channels` (Json array)
- `audienceHypothesis` (Json)
- `plan` (Json) — contains `playbooks[]`, `copyPacks[]`, `checklist[]`
- `listingSnapshot` (Json) — frozen at run start
- `modelMeta` (Json) — model id, temperature caps, token usage if allowed
- `createdAt`, `updatedAt`, `completedAt`
- optional `parentRunId` for branching

**Why not reuse `AgentRun`:** Current `AgentRun` is mapped to organization-scoped feedback workflows (`prisma/schema.prisma` + `/api/agent/*`). Seller copilot should remain **tenant-isolated per seller + listing** with different retention and security review.

---

## 5. API sketch (names indicative)

- `POST /api/u/[handle]/marketing/copilot/runs` — start run (auctionId, intent, channels).
- `GET /api/u/[handle]/marketing/copilot/runs/[runId]` — poll status + partial sections if streamed.
- `POST .../runs/[runId]/regenerate` — scoped regen body (channel + section).
- `PATCH .../runs/[runId]` — user edits / checklist completion (or separate tasks API if split).

All routes must enforce **session user matches handle** and **auction.sellerId**.

---

## 6. UI sketch

- **Wizard rail** on the left (steps), **content** on the right.
- **Channel tabs** after plan generation; each tab shows Playbook + Copy + Tasks for that channel.
- **Compare versions** (defer if needed) — at MVP show “Previous run” dropdown.
- **Trust panel:** “Facts used” bullet list extracted from listing snapshot vs “Assumptions.”

---

## 7. Guardrails and policy

- **Claims discipline:** If listing lacks service history, copilot must not imply it exists.
- **Off-platform payments:** Include explicit anti-scam guidance in playbooks (education).
- **Spam:** Carmunity module should reinforce **authentic participation**—not repetitive posting schedules that violate Carmunity norms.
- **PII:** Do not send buyer emails/phone numbers into model prompts; messaging phase is separate.
- **Admin:** Abuse monitoring hooks (flag runs with toxic prompts—log metadata only).

---

## 8. Phasing within the copilot initiative

| Sub-phase | Scope |
|-----------|-------|
| **C0** | Schema + empty UI shell + “manual plan” without model (dogfood checklist UI). |
| **C1** | Single-model, non-streaming generation of full JSON plan for 2 channels (Carmunity + Instagram). |
| **C2** | Add Google + X playbooks (education-heavy), per-channel regen, exports. |
| **C3** | “Hybrid facts”: merge deterministic `generateSellerShareCopy` output into copy packs with AI commentary. |
| **C4** | Closed-loop hints: read last 7d `AuctionAnalytics` deltas to tune next tasks (still suggestions). |

---

## 9. Non-goals

- Direct API posting to Meta/Google ads.
- Automated bidding on auctions or messaging bidders without explicit user action.
- Legal or tax advice; copilot should **stay in marketing lane**.

---

## 10. Success metrics (product)

- **Activation:** % of live listings with ≥1 completed copilot run.
- **Quality:** high export/copy usage; low “report bad suggestion” rate.
- **Business:** uplift in tracked `SHARE_CLICK` / Carmunity UTM sessions for copilot users vs control (experiment design TBD).
