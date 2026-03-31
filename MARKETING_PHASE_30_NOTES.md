# Marketing Phase 30 — Admin marketing snapshot observability

## Goal

Add **lightweight** operational observability around **`GET /api/admin/marketing/snapshot`** so engineering/ops can see **200** vs **304** vs auth failures vs server errors **without** changing JSON shape, **ETag** semantics, status codes on success paths, or seller/admin UI.

## What was implemented

| Area | Location |
|------|----------|
| Helper | **`lib/marketing/admin-marketing-snapshot-observability.ts`** |
| Instrumentation | **`app/api/admin/marketing/snapshot/route.ts`** |

## Outcomes tracked

| Outcome | Meaning |
|---------|---------|
| **`snapshot_200`** | Full JSON body returned (**200**) |
| **`snapshot_304`** | Conditional GET satisfied (**304**) |
| **`snapshot_401`** | **`requireAdminMarketingCsvAccess`** failed — same **`auth.response`** as before |
| **`snapshot_500`** | Uncaught error in the try block — **rethrown** after observe + **`console.error`** so Next.js error handling (body/format) stays as before this PR |

## Logging and counters

- **In-memory `Map`** counters **per Node.js process** (same limitation as **`lib/marketing/marketing-track-observability.ts`** — not aggregated across serverless instances unless logs or an external sink are used).
- **Structured log** prefix: **`[admin-marketing-snapshot]`** with **`JSON.stringify({ outcome })`** — **no** PII, session ids, or snapshot payload.
- **Default:** logs for **`snapshot_401`** and **`snapshot_500`** only (**200** / **304** are counter-only unless verbose).
- **Verbose:** set **`ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE`** to **`1`**, **`true`**, or **`yes`** to log **every** observed outcome (including **200** / **304**).

**Inspection:** **`getAdminMarketingSnapshotObservabilitySnapshot()`** returns a plain object of counter keys → counts for this process.

## Limitations

- Counters are **ephemeral** and **per-instance**; production ops should rely on **log lines** or a future **admin JSON** readout (see PR 31) for a convenient HTTP view.
- **500** path still depends on framework default error response after **rethrow** — only **count + log + error console** were added.

## PR 31 (implemented)

**`GET /api/admin/marketing-snapshot-observability`** — see **`MARKETING_PHASE_31_NOTES.md`**.

## PR 32 (implemented)

**`twclid`** — **`MARKETING_PHASE_32_NOTES.md`**.

## PR Phase 33–34 (implemented)

Handoff index + deployment checklist — **`MARKETING_HANDOFF_INDEX.md`**, **`MARKETING_DEPLOYMENT_CHECKLIST.md`**, **`MARKETING_PHASE_34_NOTES.md`**.

## PR 35 (suggested next step)

Plan §12zi.

## Related

- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12ze–§12zi
- **`MARKETING_HANDOFF_INDEX.md`** — observability URLs
- **`MARKETING_DEPLOYMENT_CHECKLIST.md`**
- Track observability pattern — **`lib/marketing/marketing-track-observability.ts`**, **`app/api/admin/marketing-track-observability/route.ts`**
