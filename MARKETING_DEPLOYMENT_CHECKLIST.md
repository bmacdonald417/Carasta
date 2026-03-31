# Marketing subsystem — deployment checklist

**Audience:** Engineering / ops standing up or maintaining **staging** and **production**.  
**Companion docs:** **`MARKETING_HANDOFF_INDEX.md`** (subsystem map), **`MARKETING_IMPLEMENTATION_PLAN.md`** §12–§13, runbooks linked below.

**Behavior:** This file is **documentation only**; it does not change runtime code.

---

## 1. Pre-deploy prerequisites

- [ ] **App deploy** can reach **PostgreSQL** with a schema that includes marketing models (`TrafficEvent`, `AuctionAnalytics`, `Campaign`, `CampaignEvent`, `MarketingPreset`, and related enums — see **`prisma/schema.prisma`**).
- [ ] **NextAuth** is configured for the environment (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, session provider/DB as per your existing Carasta setup). Required for **ADMIN** UI and **admin marketing** API session checks.
- [ ] Team agrees **`MARKETING_ENABLED`** policy per environment (often `false` until launch-ready).

---

## 2. Database / migrations

Marketing tables ship with the main Prisma schema — **no separate marketing-only migration package**.

- [ ] Apply schema changes using your **normal** Carasta process:
  - **Develop:** e.g. `npx prisma migrate dev` (or your documented workflow).
  - **CI/Production:** e.g. `prisma migrate deploy` in the release pipeline — **align with how this repo is actually shipped** (some setups use `db push` in build; prefer **migrate deploy** for production when using migration history).
- [ ] After deploy, confirm tables exist (e.g. `TrafficEvent`, `AuctionAnalytics`, `Campaign`, `MarketingPreset`).

**If** you add marketing tables to an **existing** database that already had traffic rows: optional **`npm run marketing:backfill-analytics`** so **`AuctionAnalytics`** matches historical **`TrafficEvent`** (see §5).

---

## 3. Required environment variables

### 3.1 Master gate

| Variable | Values | Notes |
|----------|--------|--------|
| **`MARKETING_ENABLED`** | `true` / omit / `false` | **`true`** enables seller surfaces + track ingest + digest batch logic (per `lib/marketing/feature-flag.ts`). |

### 3.2 Weekly digest (email)

| Variable | Required for | Notes |
|----------|----------------|-------|
| **`MARKETING_DIGEST_CRON_SECRET`** | Hosted job **`GET`/`POST /api/jobs/marketing-digest`** | Min **16** chars when set; route returns **503** if missing. |
| **`MARKETING_DIGEST_SEND_ENABLED`** | Real sends (cron + script) | Must be **`true`** for non–dry-run sends. |
| **`RESEND_API_KEY`** | Real email delivery | Required for actual sends (`lib/email/send-marketing-digest-email.ts`). |
| **`MARKETING_DIGEST_FROM`** | Real sends | Verified sender, e.g. `Carasta <digest@domain.com>`. |

Optional / operational:

| Variable | Purpose |
|----------|---------|
| **`MARKETING_DIGEST_FORCE`** | Manual **`npm run marketing:send-digest`** only — bypasses ~6.5d spacing (see script header). **Cron does not use this.** |

### 3.3 Observability JSON (optional)

| Variable | Purpose |
|----------|---------|
| **`MARKETING_TRACK_OBSERVABILITY_SECRET`** | Bearer token (≥ 16 chars) for **`/api/admin/marketing-track-observability`** and **`/api/admin/marketing-snapshot-observability`** when not using ADMIN cookie. |
| **`MARKETING_TRACK_OBSERVABILITY_VERBOSE`** | More track-route log lines. |
| **`ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE`** | Log all snapshot outcome lines including 200/304. |

### 3.4 TrafficEvent prune (manual / scheduled job)

| Variable | Purpose |
|----------|---------|
| **`TRAFFIC_EVENT_PRUNE_ENABLED`** | Must be **`true`** for **destructive** prune. |
| **`TRAFFIC_EVENT_RETENTION_DAYS`** | Age cutoff (script default if unset — see `scripts/prune-traffic-events.ts`). |
| **`TRAFFIC_EVENT_PRUNE_DRY_RUN`** | Gate for dry-run mode when applicable. |

### 3.5 Core app (already required for Carasta)

- **`NEXTAUTH_SECRET`**, **`NEXTAUTH_URL`**, database **`DATABASE_URL`** (or your project’s Prisma datasource env names).

Full marketing env table (shorter): **`MARKETING_HANDOFF_INDEX.md`** §6.

---

## 4. Digest cron / job setup

Hosted route: **`/api/jobs/marketing-digest`** (`app/api/jobs/marketing-digest/route.ts`).

- [ ] Set **`MARKETING_DIGEST_CRON_SECRET`** in the hosting provider (min 16 characters).
- [ ] Schedule **GET** or **POST** to your app origin, e.g.  
  `https://<your-host>/api/jobs/marketing-digest`  
  with **either**:
  - Header: **`Authorization: Bearer <MARKETING_DIGEST_CRON_SECRET>`**, **or**
  - Query (supported by handler): **`?secret=<MARKETING_DIGEST_CRON_SECRET>`** (use only if your scheduler cannot send headers; prefer Bearer).
- [ ] For **dry validation** without email or DB timestamp updates: **`?dryRun=1`** (or **`dry_run=1`**).
- [ ] For real weekly sends: set **`MARKETING_DIGEST_SEND_ENABLED=true`**, **`RESEND_API_KEY`**, **`MARKETING_DIGEST_FROM`**, and ensure **`MARKETING_ENABLED=true`**.

**Behavior notes:**

- Returns **503** if cron secret is not configured.
- Returns **401** if secret mismatch.
- When marketing is off or send is disabled, real runs may **no-op** with **200** — see handler JSON **`noop`** (verify in staging with **`dryRun=1`** first).

**Manual alternative:** `npm run marketing:send-digest -- --dry-run` then real send with env flags — see **`scripts/send-marketing-digest.ts`** header.

**Deeper context:** **`MARKETING_PHASE_14_NOTES.md`**, **`MARKETING_PHASE_15_NOTES.md`**.

---

## 5. Backfill

- [ ] **`npm run marketing:backfill-analytics`** — rebuilds **`AuctionAnalytics`** from **`TrafficEvent`** (`scripts/backfill-auction-analytics.ts`).  
  Run after initial deploy with historical events, or after large imports/restores. See also phase notes on rollups (**`MARKETING_PHASE_6_NOTES.md`**, **`MARKETING_PHASE_10_NOTES.md`**).

---

## 6. Prune (TrafficEvent retention)

- [ ] Read **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** for policy and privacy baseline.
- [ ] Always start with **`npm run marketing:prune-traffic-events:dry-run`** (count-only).
- [ ] Destructive prune: set **`TRAFFIC_EVENT_PRUNE_ENABLED=true`** and run **`npm run marketing:prune-traffic-events`** per script docs.
- [ ] After aggressive prune, consider **backfill** (§5) if rollups must reflect remaining raw events only.

---

## 7. Admin endpoint checks (smoke)

As an **ADMIN** session (browser) or with **`MARKETING_TRACK_OBSERVABILITY_SECRET`** where applicable:

- [ ] **`GET /api/admin/marketing/snapshot`** — **200** JSON (or **304** with **`If-None-Match`**); **401** when not admin.
- [ ] **`GET /api/admin/marketing/export/summary`** and **`.../tops-last-7`** — CSV downloads (session auth).
- [ ] **`GET /api/admin/marketing-track-observability`** — JSON counters (ADMIN **or** Bearer secret).
- [ ] **`GET /api/admin/marketing-snapshot-observability`** — JSON snapshot-route counters (same auth).

**Edge / abuse:** **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** for **`POST /api/marketing/track`**.

---

## 8. Seller smoke tests

With **`MARKETING_ENABLED=true`** and a seller account that owns a listing:

- [ ] **`/u/<handle>/marketing`** loads (owner-only).
- [ ] Per-listing marketing / Share & Promote flows load without server errors.
- [ ] **`GET /api/u/<handle>/marketing/export/auctions`** (or campaigns) returns **401/403** for non-owner, **200** CSV for owner.
- [ ] Public **`/auctions/<id>?utm_source=smoke`** — expect **VIEW** + **EXTERNAL_REFERRAL** when tracker is enabled (verify via admin analytics or DB — see **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** QA).

---

## 9. Rollback / disable flags

| Goal | Action |
|------|--------|
| **Disable marketing UI + ingest quickly** | Set **`MARKETING_ENABLED`** unset or not `true`; redeploy/restart as needed. |
| **Stop digest email only** | Set **`MARKETING_DIGEST_SEND_ENABLED`** not `true`; optionally pause cron job. |
| **Block hosted digest endpoint** | Remove or rotate **`MARKETING_DIGEST_CRON_SECRET`** (expect **503** if unset). |

No separate “marketing rollback migration” — disabling flags is the primary lever.

---

## 10. Runbooks (deeper reading)

| Document | Use when |
|----------|----------|
| **`MARKETING_HANDOFF_INDEX.md`** | Routes, scripts, models, full env list |
| **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** | UTM / click-id / EXTERNAL_REFERRAL |
| **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** | Rate limits, WAF, **`/api/marketing/track`** |
| **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** | Retention, prune, what is stored |

---

## 11. Handoff status

With **`MARKETING_HANDOFF_INDEX.md`** + this checklist + phase notes **1–34**, treat **marketing as handoff-ready** for ops; new product work should go through normal intake (**`MARKETING_IMPLEMENTATION_PLAN.md`** §13 remains the limitation list).

---

*Phase 34. Update this checklist when routes, env vars, or jobs change.*
