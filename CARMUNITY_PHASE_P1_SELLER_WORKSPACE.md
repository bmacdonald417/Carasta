# Phase P1 — Seller Marketing Workspace (Foundation)

This phase adds a **structured, persistent marketing workspace per listing** that is **additive** to existing `Campaign` records, traffic analytics (`TrafficEvent`, `AuctionAnalytics`), and Share & Promote tooling. It is the data + API foundation for a future **AI marketing copilot** and richer execution tracking.

---

## 1. Schema changes (Prisma)

New enums:

| Enum | Values |
|------|--------|
| `ListingMarketingTaskStatus` | `PENDING`, `COMPLETED` |
| `ListingMarketingTaskType` | `CHECKLIST`, `REMINDER`, `MILESTONE`, `CUSTOM` |
| `ListingMarketingArtifactType` | `CAPTION`, `HEADLINE`, `BODY`, `HASHTAGS`, `OTHER` |

New models:

### `ListingMarketingPlan`

- One row **per auction** (`auctionId` **@unique**).
- `createdById` → `User` (must be the listing seller in API logic).
- Text fields: `objective`, `audience`, `positioning` (`@db.Text`, default `""`).
- `channels` — `Json` default `[]` (array of string channel keys, e.g. `carmunity`, `instagram`).
- Relations: `tasks`, `artifacts`; parent `Auction` (cascade delete).

### `ListingMarketingTask`

- `planId` → plan (cascade).
- `type`, `title`, `description`, optional `channel`, `status`, `sortOrder`, `completedAt`.

### `ListingMarketingArtifact`

- Immutable **versioned** rows: each `POST` increments `version` per `(planId, type, channel)` group.
- `content` `@db.Text`.

### `User` / `Auction` relations

- `User.listingMarketingPlansCreated`
- `Auction.listingMarketingPlan` (optional 0..1)

**Migration file:** `prisma/migrations/20260421140000_listing_marketing_workspace/migration.sql`

Apply with your usual deploy process, e.g. `npx prisma migrate deploy` (or `migrate dev` in local dev).

---

## 2. API routes

All routes require **`MARKETING_ENABLED`** and a **signed-in session** (`getSession`). Listing ownership is enforced via `auction.sellerId` and `ListingMarketingPlan.createdById`.

### Path note (Next.js App Router)

`GET …/plan/[auctionId]` and `PATCH …/plan/[id]` cannot share the same single dynamic segment without ambiguity. Implemented as:

| Intended | Implemented |
|-----------|----------------|
| `GET /api/marketing/plan/[auctionId]` | `GET /api/marketing/plan/auction/[auctionId]` |
| `POST /api/marketing/plan` | `POST /api/marketing/plan` |
| `PATCH /api/marketing/plan/[id]` | `PATCH /api/marketing/plan/[planId]` |

Similarly for tasks and artifacts listing by plan:

| Intended | Implemented |
|-----------|----------------|
| `GET /api/marketing/tasks/[planId]` | `GET /api/marketing/tasks/for-plan/[planId]` |
| `GET /api/marketing/artifacts/[planId]` | `GET /api/marketing/artifacts/for-plan/[planId]` |

### Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/marketing/plan/auction/[auctionId]` | Load plan + embedded tasks + artifacts (or `null`). |
| POST | `/api/marketing/plan` | Create plan; **409** if plan already exists for auction. |
| PATCH | `/api/marketing/plan/[planId]` | Update plan fields (partial). |
| GET | `/api/marketing/tasks/for-plan/[planId]` | List tasks. |
| POST | `/api/marketing/tasks` | Create task (`planId` in body). |
| PATCH | `/api/marketing/tasks/[taskId]` | Update task; `status` → `COMPLETED` sets `completedAt`, `PENDING` clears it. |
| GET | `/api/marketing/artifacts/for-plan/[planId]` | List artifacts (up to 100). |
| POST | `/api/marketing/artifacts` | Append artifact; **version** = max existing + 1 for same `type` + `channel`. |

Shared helpers: `lib/marketing/marketing-workspace-auth.ts`, serializers `lib/marketing/listing-marketing-workspace-serialize.ts`, Zod `lib/validations/listing-marketing-workspace.ts`.

---

## 3. UI changes

**File:** `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx`

- Server-loads `ListingMarketingPlan` (with tasks + artifacts), serializes, and passes to **`SellerMarketingWorkspace`** (`components/marketing/seller-marketing-workspace.tsx`).
- Renders **after** marketing alerts, **before** Share & Promote (additive layer, does not remove existing sections).

**Client (`SellerMarketingWorkspace`):**

1. **Marketing plan** — objective, audience, positioning, comma-separated channels; **Create plan** or **Save plan**.
2. **Execution checklist** — checkbox toggles task status; add task (title + optional description).
3. **Content drafts** — type + optional channel label + body; **Save new version** appends a versioned artifact; list shows newest first.

---

## 4. How this enables the AI copilot later

- **Stable anchor:** `ListingMarketingPlan` + `auctionId` gives the copilot a single row to attach **run metadata**, prompts, and structured JSON outputs (future tables or `plan` extensions) without overloading `Campaign`.
- **Execution loop:** `ListingMarketingTask` maps naturally to AI-generated checklists; PATCH completion supports closed-loop UX and digest/analytics tie-ins later.
- **Versioned creative:** `ListingMarketingArtifact` matches “model proposes caption v3” without mutating prior rows—audit-friendly.
- **Channels:** JSON array is intentionally flexible until channel enums or copilot channel registry harden.

---

## 5. Intentionally NOT built yet

- No LLM calls, no streaming, no prompt storage beyond normal DB rows.
- No direct messaging or notifications for workspace events.
- No change to `Campaign`, `CampaignEvent`, or marketing track ingestion.
- No `PATCH` on artifacts (edits are new versions via `POST` only).
- No mobile-specific contracts beyond existing session/JWT patterns used elsewhere.
- No admin moderation queue for workspace content (reuse general abuse reporting later if needed).

---

## 6. Quick verification checklist

1. Run migration on your database.
2. Open `/u/{handle}/marketing/auctions/{auctionId}` as the listing owner.
3. Create plan → refresh → data persists.
4. Add tasks, toggle complete → `completedAt` updates.
5. Save drafts with same type + channel → `version` increments.
