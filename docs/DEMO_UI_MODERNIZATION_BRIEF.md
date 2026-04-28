# Demo UI Modernization Brief

## Objective
Modernize the **demo web app UI** quickly and safely using screenshot-driven iteration, while keeping the product’s functional behavior intact.

This repository uses AI tools to accelerate implementation, but **GitHub remains the source of truth** and the human owner is the final visual approver.

## Visual direction (high level)
- Premium, calm, modern product UI
- Strong hierarchy and readable typography
- Consistent spacing and component rhythm
- Refined surfaces (cards/panels), subtle borders, intentional shadows
- Accessible contrast and clear focus states

> Do **not** invent new tokens/colors in issues. Always inspect existing token files and theme utilities before changing design primitives.

## Modernization priorities
1. **Headers + navigation clarity**
2. **Cards / panels consistency** (borders, shadows, padding)
3. **Buttons and actions** (primary vs secondary, icon button polish)
4. **Forms** (inputs, labels, error states)
5. **Empty states** (clear hierarchy + next action)
6. **Responsive behavior** (mobile-first, no overflow, tap targets)
7. **Micro-interactions** (hover/focus/active, motion restraint)

## Demo-first principles
- Prefer improvements that read clearly in screenshots and recordings.
- Keep changes small and reviewable (1 screen per PR where possible).
- Avoid architecture expansion unless a blocker requires it.
- Favor composable UI primitives over one-off styling.

## Non-goals
- Rebuilding the app architecture
- New feature expansion unrelated to the issue
- Rewriting auth, data, or business logic
- Full design-token redesign unless explicitly approved

## Protected areas (do not touch without explicit authorization)
- Auth / session / NextAuth
- Database schema / Prisma / migrations
- Environment variables and secrets
- Deployment settings and Railway configuration
- Payment/checkout logic and any “money” flows
- Routing behavior and URL schemes

## Workflow overview
1. **Create a GitHub issue** using the UI modernization issue form.
2. Attach **before screenshots** and **target inspiration**.
3. ChatGPT produces:
   - UI analysis, constraints, acceptance criteria alignment
   - Implementation plan + “do not touch” reinforcement
4. Cursor implements on a **feature branch**, scoped to the issue.
5. Gemini reviews as an independent critic:
   - regression detection
   - responsive/a11y gaps
   - “does it match the screenshot?”
6. Human owner approves visual direction, requests tweaks, and merges.

## Definition of Done (DoD)
- Issue acceptance criteria met
- Before/after screenshots included in the PR (when possible)
- Guardrails confirmed (no protected-area changes)
- Validation passes:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run build`
- Mobile + desktop sanity checks performed

