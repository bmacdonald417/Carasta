# Marketing Phase 16 — Edge / WAF runbook for `/api/marketing/track`

**Date:** 2026-03-30  
**Scope:** **Documentation-only** delivery of a production **operator runbook** for protecting **`POST /api/marketing/track`** at the edge, aligned with Phase 10 dedupe + Phase 12 in-app rate limiting. **No schema**, **no** seller UI changes, **no** auction/bid/buy-now/campaign/community logic changes.

---

## What was added

| Deliverable | Path |
|-------------|------|
| Operator runbook | **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** |
| Plan bump | **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12q Phase 16 |
| This note | **`MARKETING_PHASE_16_NOTES.md`** |

## Code changes

**Minimal:** Comments / JSDoc only — **`app/api/marketing/track/route.ts`** (runbook pointer + `POST`-only note), **`lib/marketing/marketing-track-rate-limit.ts`** (link to runbook for operators). **No** behavioral or schema changes.

## Where operators start

1. Read **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** §3–§5 (rules + Railway / Cloudflare examples).
2. Ensure **`X-Forwarded-For`** / trusted proxy behavior matches §9 (IP bucket correctness).
3. Roll out **observe → challenge → enforce** per §7; validate seller metrics after changes.

## PR 17 (implemented)

**Observability:** **`lib/marketing/marketing-track-observability.ts`** + **`app/api/marketing/track/route.ts`**. See **`MARKETING_PHASE_17_NOTES.md`**.

## PR 18 (implemented)

**Admin JSON snapshot:** **`MARKETING_PHASE_18_NOTES.md`**.

## PR 19 (suggested next step)

**TrafficEvent retention / privacy doc** or seller marketing polish — **one PR**.
