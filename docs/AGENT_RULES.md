# Agent Rules (ChatGPT / Cursor / Gemini)

This repository uses AI tools to modernize a demo UI quickly. These rules exist to keep changes safe, reviewable, and merge-ready.

## Operating model
- **GitHub is the source of truth**: issues define scope; PRs define changes.
- **Human owner** approves visual direction, PRs, and merges.
- **ChatGPT**: architect + prompt engineer + reviewer partner.
- **Cursor**: primary implementation agent (makes code changes).
- **Gemini**: independent reviewer + QA critic (finds regressions and gaps).

## Allowed actions
- Create UI-focused issues and PRs
- Modify UI components, styles, layout, and copy **only within issue scope**
- Refactor small UI code paths if it reduces duplication or improves consistency (must stay scoped)
- Add small UI dependencies **only** when necessary and justified in the PR (and scoped)
- Add documentation, templates, and workflow files

## Prohibited actions (unless explicitly authorized in the issue)
- **Never push directly to `main`**
- No changes to:
  - auth/session/NextAuth
  - database schema / Prisma migrations
  - environment variables, secrets, `.env` files
  - deployment configuration (Railway, CI/CD)
  - payment/checkout logic
  - routing behavior / URL schemes
- No large refactors unrelated to the issue
- No “drive-by” formatting across the repo

## Branch + PR behavior
- Always branch from `main`:
  - `ui/<screen>-<short-desc>` or `modernize/<screen>-<short-desc>`
- One issue → one PR (preferably one screen/flow)
- PR must include:
  - summary + linked issue
  - before/after screenshots where possible
  - validation commands run
  - guardrail checklist

## File safety rules
- Prefer touching the smallest set of files possible.
- Avoid editing “protected area” files even for “small” changes.
- If you believe a protected change is required, **stop** and request explicit authorization in the issue before proceeding.

## Security guardrails
- Never add secrets to the repo.
- Never log sensitive values.
- Be careful when adding dependencies; prefer well-known libraries and minimal surface area.

## How to report completion
In PR description or final summary:
- What changed (and why)
- Where to review visually (routes/screens)
- Commands run and results
- Known risks / follow-ups
- Screenshot evidence

## Handling uncertainty
- If requirements are ambiguous, produce options with trade-offs and ask for selection (in the issue/PR discussion).
- If the UI target screenshot conflicts with existing tokens/components, prefer:
  1) composition using existing primitives
  2) small extension to primitives
  3) new bespoke styling (last resort)

