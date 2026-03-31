# Marketing Phase 33 — Final marketing handoff index

**Scope:** **Documentation only.** Add a single master index that maps the Carasta marketing subsystem and cross-links existing phase notes, runbooks, routes, scripts, env vars, and data models.

## Deliverable

| Artifact | Purpose |
|----------|---------|
| **`MARKETING_HANDOFF_INDEX.md`** (repo root) | Authoritative handoff map for engineering, product, ops, and client/class delivery |

**Also updated:** **`MARKETING_IMPLEMENTATION_PLAN.md`** — executive summary link + §12zh; footer points to handoff doc.

## What the index covers

- Subsystem overview and **`MARKETING_ENABLED`** gate
- Seller and admin **App Router** URLs + key **`components/marketing`** references
- **API routes** (track, admin exports, snapshot, seller exports, digest job, observability JSON)
- **npm** / **`scripts/`** operational commands
- **Environment variables** used by marketing, digest, prune, observability
- **Prisma** models and enums (summary — schema remains source of truth)
- Exports and machine-readable **snapshot**
- Observability endpoints and per-process limits
- Runbooks and **§12** phase-note pointers
- Deployment/ops workflow summary, known limitations, light roadmap

## PR 34 (implemented)

**`MARKETING_DEPLOYMENT_CHECKLIST.md`** — see **`MARKETING_PHASE_34_NOTES.md`**.

## PR 35 (suggested next step)

Product-scoped epic for new marketing work **or** optional synthetic health check for **`/api/jobs/marketing-digest?dryRun=1`** — see **`MARKETING_IMPLEMENTATION_PLAN.md`** §12zi.

## Related

- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12zh–§12zi, §13 blockers
- **`MARKETING_DEPLOYMENT_CHECKLIST.md`**
- **`MARKETING_PHASE_32_NOTES.md`** — last code-touching marketing phase before handoff docs
