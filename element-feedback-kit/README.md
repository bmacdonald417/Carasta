# Element Feedback Kit — Carasta integration

The upstream kit directory (`components/`, `api/`, `migrations/`, etc.) was **not** present in this repository. The same **architecture and API surface** are implemented here, mapped to Carasta’s stack:

| Kit path (prompt) | Carasta location |
|-------------------|------------------|
| `src/components/feedback/` | `components/feedback/` (`@/components/feedback/*`) |
| `src/app/api/feedback/route.ts` | `app/api/feedback/route.ts` |
| `src/app/dashboard/feedback/` | `app/dashboard/feedback/page.tsx` + `app/dashboard/layout.tsx` |
| `api/ai/incorporate-feedback/` | `app/api/ai/incorporate-feedback/route.ts` |
| `api/agent/run/[runId]/` | `app/api/agent/run/[runId]/events/route.ts`, `status/route.ts`, `route.ts` |
| `lib/agent-shim-auth.ts` | `lib/agent-shim-auth.ts` |
| Drizzle schema | **Prisma** — `ElementFeedback` (`@@map("feedback")`), `AgentRun`, `AgentRunEvent` in `prisma/schema.prisma` |
| `auth()` / `requireOrg()` | `getSession()` from `lib/auth.ts`, `lib/feedback-auth.ts`, `lib/feedback-org.ts` |

## Auth / org decisions (confirm for your org)

- **Organizations:** Carasta has no `Organization` model yet. Every row uses `CARASTA_FEEDBACK_ORG_ID` or the default string `carasta`.
- **Roles:** Prisma `Role` is `USER` | `ADMIN`. Kit **Admin** and **Compliance** both map to **`ADMIN`** for gated routes until you add a distinct compliance role.

## Do not edit from the kit port

Leave unchanged unless you are deliberately updating the product contract:

- `ElementSelector.tsx` — DOM hover/click pin logic (keep framework-agnostic).
- `IncorporateFeedbackPanel.tsx` — polling / backoff behavior.
- `types.ts` — shared API contracts between UI and routes.

## Optional local agent script

See `scripts/run-feedback-agent.mjs` (stub that prints env requirements). Replace with your Claude Code / CI runner that calls the shim routes using `AGENT_SHIM_SECRET`.
