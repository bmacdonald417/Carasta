# Marketing Phase 19 — TrafficEvent retention & privacy operator runbook

**Date:** 2026-03-30  
**Scope:** **Documentation-only** operator runbook for **`TrafficEvent`** storage, minimization, pruning, rollups, and incident pointers. **No** schema change, **no** seller UI, **no** auction/bid/buy-now/campaign/community behavior change.

---

## Deliverable

| Artifact | Path |
|----------|------|
| Retention / privacy runbook | **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** |

## Code changes

**Tiny JSDoc only** (cross-links to the runbook): **`lib/marketing/prune-traffic-events.ts`**, **`lib/marketing/sanitize-marketing-metadata.ts`**, **`lib/marketing/visitor-key.ts`**.

## Where to start

Read **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** §2 (what is stored) and §5 (prune commands), then §8 (production checklist).

## PR 20 (implemented)

**Seller CSV exports:** **`MARKETING_PHASE_20_NOTES.md`**.

## PR 21 (suggested next step)

**Seller marketing UX polish** or another roadmap slice — **one PR**.
