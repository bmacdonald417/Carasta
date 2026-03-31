# Marketing Phase 31 — Protected admin snapshot observability endpoint

## Goal

Let engineering/ops inspect **in-memory** counters for **`GET /api/admin/marketing/snapshot`** over HTTP, using the **same** protection model as track observability — **no** seller UI, **no** schema, **no** persistent metrics.

## Route

| Method / path | `GET /api/admin/marketing-snapshot-observability` |
|---------------|--------------------------------------------------|

## Protection model

Matches **`GET /api/admin/marketing-track-observability`**:

1. **ADMIN** session: NextAuth JWT on the request with **`role === "ADMIN"`**, or
2. **Bearer secret:** **`Authorization: Bearer <MARKETING_TRACK_OBSERVABILITY_SECRET>`** when that env var is set and **length ≥ 16** (timing-safe compare).

Unauthorized responses: **`401`** with **`{ "ok": false }`** only (no extra detail).

## Response shape (200)

Compact JSON only; **no** request payloads, IPs, or snapshot bodies.

```json
{
  "ok": true,
  "generatedAt": "<ISO-8601>",
  "counters": {
    "snapshot_200": 0,
    "snapshot_304": 0,
    "snapshot_401": 0,
    "snapshot_500": 0
  },
  "totals": {
    "observedRequests": 0
  },
  "note": "In-memory per Node.js process only; not aggregated across serverless instances."
}
```

Keys in **`counters`** are only those outcomes that have been **observed at least once** in this process (the in-memory `Map` has no entry until the first increment). Omitted keys were never hit. If nothing was observed yet, **`counters`** is **`{}`** and **`totals.observedRequests`** is **`0`**.

**Source:** **`getAdminMarketingSnapshotObservabilitySnapshot()`** in **`lib/marketing/admin-marketing-snapshot-observability.ts`**.

## Limitations

- **Per-process only** — each Node/serverless instance has its own counters; compare or aggregate in your log/metrics layer if needed.
- **Ephemeral** — process restart clears counts.
- **Same bearer env as track observability** — intentional to keep ops configuration minimal; rotate **`MARKETING_TRACK_OBSERVABILITY_SECRET`** with care if both routes are exposed to the same operators.

## PR 32 (implemented)

**`twclid`** for **EXTERNAL_REFERRAL** — **`MARKETING_PHASE_32_NOTES.md`**.

## PR Phase 33 (implemented)

**`MARKETING_HANDOFF_INDEX.md`** — **`MARKETING_PHASE_33_NOTES.md`**.

## PR 34 (exact next best step)

**`MARKETING_DEPLOYMENT_CHECKLIST.md`** or defer — see **`MARKETING_HANDOFF_INDEX.md`** §14.

## Related

- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12zf–§12zh
- **`MARKETING_HANDOFF_INDEX.md`**
- **`MARKETING_PHASE_30_NOTES.md`** — counter semantics
- **`app/api/admin/marketing-track-observability/route.ts`** — parallel auth pattern
