# Marketing Phase 15 — Hosted weekly digest trigger

**Date:** 2026-03-30  
**Scope:** One **HTTPS-triggered** path that runs the **same** digest batch as **`npm run marketing:send-digest`**. No new queues, cron daemon in-repo, or schema.

---

## Route

| | |
|---|--|
| **Path** | **`/api/jobs/marketing-digest`** |
| **Methods** | **`GET`**, **`POST`** |
| **Auth** | Shared secret (**see below**) |
| **Dry-run** | **`?dryRun=1`** or **`?dry_run=1`** — no Resend, no **`lastMarketingDigestSentAt`** updates |

### Secret: `MARKETING_DIGEST_CRON_SECRET`

- **Required** in production for the route to run (**min length 16** in code).
- If unset or too short → **503** with body **`{ "ok": false }`** (scheduler should alert).
- **Preferred:** header **`Authorization: Bearer <secret>`** (avoids query-string logging).
- **Supported:** query **`?secret=<value>`** — easier for some cron UIs; avoid if logs capture full URLs.

Invalid or missing token → **401** with **`{ "ok": false }`** only (no hint whether the secret was “close”).

### Behavior summary

1. Secret valid → calls **`runMarketingDigestSend`** from **`lib/marketing/run-marketing-digest-send.ts`** (same as CLI).
2. **`MARKETING_ENABLED`** false → **200**, **`noop: "marketing_disabled"`** (no user query).
3. Real send (**not** `dryRun`) and **`MARKETING_DIGEST_SEND_ENABLED`** not **`true`** → **200**, **`noop: "send_disabled"`**.
4. Otherwise → JSON with **`optedInCount`**, **`sent`**, **`skippedInterval`**, **`skippedNoSnapshot`**, **`errors`**, **`dryRun`**. On dry-run, **`sent`** counts digests that **would** be sent (spacing + snapshot rules applied). **`207`** if every send failed and **`sent === 0`** (optional observability).

Hosted runs **do not** honor **`MARKETING_DIGEST_FORCE`**: spacing is always enforced from the API. Override spacing only via **manual** CLI with **`MARKETING_DIGEST_FORCE=1`**.

---

## Env vars (digest)

| Variable | Role |
|----------|------|
| **`MARKETING_DIGEST_CRON_SECRET`** | Protects **`/api/jobs/marketing-digest`** |
| **`MARKETING_ENABLED`** | Feature gate; off → noop |
| **`MARKETING_DIGEST_SEND_ENABLED`** | Must be **`true`** for real sends (hosted or CLI) |
| **`RESEND_API_KEY`**, **`MARKETING_DIGEST_FROM`** | Resend (see Phase 14 notes) |
| **`MARKETING_DIGEST_FORCE`** | **CLI only** — bypass ~6.5 day spacing |

---

## Deployment (Railway)

This repo’s **`railway.toml`** uses **`npm run start`** (Next.js). Railway does not ship a first-party weekly cron that calls your app; use an **external HTTPS scheduler** or **GitHub Actions** on a schedule.

**Recommended pattern**

1. Set **`MARKETING_DIGEST_CRON_SECRET`** (and digest + Resend + **`MARKETING_DIGEST_SEND_ENABLED=true`**) in the Railway service environment.
2. Schedule **one** weekly request, for example:
   - **POST** `https://<your-production-host>/api/jobs/marketing-digest`
   - Header: **`Authorization: Bearer <MARKETING_DIGEST_CRON_SECRET>`**
3. Keep **one** weekly window (e.g. Monday 09:00 UTC) to align with product expectations; do not add second triggers for the same job.

**Optional dry-run in staging**

- Same URL with **`?dryRun=1`** and the bearer secret — validates code paths without email.

---

## Vercel (if you deploy there later)

**`vercel.json`** (example only — not committed for current Railway focus):

```json
{
  "crons": [
    {
      "path": "/api/jobs/marketing-digest",
      "schedule": "0 9 * * 1"
    }
  ]
}
```

Configure **`CRON_SECRET`** in Vercel to match **`MARKETING_DIGEST_CRON_SECRET`**, or pass **`Authorization: Bearer ...`** via Vercel’s cron headers if your plan supports it. See [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) for current header behavior.

---

## Manual fallback

```bash
npm run marketing:send-digest -- --dry-run
MARKETING_DIGEST_SEND_ENABLED=true … npm run marketing:send-digest
```

Same logic as production; **`MARKETING_DIGEST_FORCE=1`** only affects the script.

---

## PR 16 (next best step)

**Edge / WAF runbook** for **`POST /api/marketing/track`**: document provider-level limits, optional WAF rules, and alignment with in-app **`marketing-track-rate-limit`** — **no** changes to digest sending, campaigns, auctions, or community behavior.
