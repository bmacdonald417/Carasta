# Carasta feedback agent — runbook (adapted from Trust Codex template)

This repo is **not** the Drizzle/Next-16 layout from the generic agent prompt. Use this document when draining production feedback on **Carasta**.

## Stack reality (Carasta)

| Template assumption | Carasta |
|---------------------|---------|
| Drizzle + `src/db/schema.ts` | **Prisma** + `prisma/schema.prisma` |
| Next.js 16 / React 19 | **Next.js 14** (see `package.json`) |
| `feedback` / `agent_runs` tables | **Not in schema today** — add via migration (SQL below) if you want the same workflow |

## Database

- **Postgres** via `DATABASE_URL` (e.g. Railway).
- Inspect: `psql "$DATABASE_URL"` (or Railway shell).

### 1) List pending / reviewed (once `feedback` exists)

```sql
SELECT id, content, category, page_url, element_selector, element_text, element_type, created_at
FROM feedback
WHERE status IN ('pending', 'reviewed')
ORDER BY created_at;
```

### 2) Optional: create tables (PostgreSQL)

Run **once** on the target DB if tables are missing (adjust types/indexes to taste):

```sql
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL DEFAULT 'default',
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  page_url TEXT,
  element_selector TEXT,
  element_text TEXT,
  element_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution_commit_sha TEXT,
  resolution_commit_url TEXT,
  resolution_summary TEXT,
  resolution_files JSONB
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS feedback_status_created_at_idx ON feedback (status, created_at);
```

Then add matching **Prisma models** in `prisma/schema.prisma` and `prisma migrate` / `db push` so app code can use them safely.

## HARD LIMITS (Carasta — do not modify for feedback fixes)

Never change in automated feedback passes:

- `.env*` (any environment files)
- `lib/auth.ts` (NextAuth options)
- `app/api/auth/**` (auth routes)
- `middleware.ts` (root middleware)
- `prisma/schema.prisma` **only** if you are explicitly doing a reviewed migration (otherwise note for manual migration)

If schema changes are required, stop and open a normal PR with a Prisma migration.

## Fix workflow (human or CI agent)

1. Connect with `psql $DATABASE_URL` or Prisma Studio / script.
2. `SELECT …` as above.
3. `INSERT INTO agent_runs (organization_id, type, status) VALUES ($org, 'feedback_drain', 'running') RETURNING id;` — use first row’s `organization_id` if multi-tenant.
4. For each item: open referenced routes/components; minimal Tailwind edits; match existing **Carasta** design (dark premium, copper social, red auction accents where applicable).
5. Commit:

```text
Agent: incorporate N feedback item(s)

Addresses:
- [category] first 90 chars…
(one line per item)

Co-authored-by: Trust Codex Agent <agent@trustcodex.ai>
```

6. `git push origin main`
7. Resolve in DB:

```sql
UPDATE feedback
SET status = 'resolved',
    resolved_at = NOW(),
    updated_at = NOW(),
    resolution_commit_sha = $SHA,
    resolution_commit_url = $URL,
    resolution_summary = $SUMMARY,
    resolution_files = $FILES_JSON::jsonb
WHERE id IN (...);

UPDATE agent_runs SET status = 'done', completed_at = NOW() WHERE id = $RUN_ID;
```

## Local check (no production write)

```bash
npx ts-node -P tsconfig.scripts.json scripts/feedback-agent-status.ts
```

Exits `0`. Prints row count or `NO_TABLE: feedback` if the table is missing.

## If zero pending items

Do **not** create an empty “fixes” commit. Close the `agent_runs` row if one was opened.

---

**RESOLUTIONS (this document drop):**

- Mapped the generic agent to **Prisma + Carasta paths** and documented **Railway / `DATABASE_URL`** usage.
- Clarified **forbidden files** and that **`feedback` / `agent_runs` are not in the repo schema yet** — optional SQL + Prisma follow-up provided.
