# Marketing Phase 34 — Deployment checklist

**Scope:** **Documentation only.** Provide a single **operator checklist** for deploying and operating the marketing subsystem in **staging** and **production**.

## Deliverable

| Artifact | Purpose |
|----------|---------|
| **`MARKETING_DEPLOYMENT_CHECKLIST.md`** | Prerequisites, DB/migrations guidance, env vars (including **`RESEND_API_KEY`**, digest cron secret, prune gates), digest job URL patterns (**Bearer** or query **`secret`**), backfill/prune, admin + seller smokes, rollback flags, runbook links |

## Behavior changed?

**No.** No application code, schema, or UI was modified.

## Cross-links added

- **`MARKETING_HANDOFF_INDEX.md`** — scope blurb, runbooks table, env table row for **`RESEND_API_KEY`**, deployment section defers to checklist, phases **1–34**, roadmap §14.
- **`MARKETING_IMPLEMENTATION_PLAN.md`** — executive summary, §**12zi**, footer.

## Handoff-complete?

Yes — together with **`MARKETING_HANDOFF_INDEX.md`** (Phase 33) and this checklist, marketing ops have an **authoritative map** plus a **deploy/validate** path. Further work is **product-driven** unless ops chooses optional monitoring (**PR 35** in plan).

## Related

- **`MARKETING_PHASE_33_NOTES.md`** — handoff index milestone
- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12zi
