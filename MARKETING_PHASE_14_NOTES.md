# Marketing Phase 14 — Weekly seller email digest (opt-in)

**Date:** 2026-04-02  
**Scope:** **Manual** weekly email summarizing seller marketing performance. **Opt-in** on **`User.weeklyMarketingDigestOptIn`**; delivery via **Resend** when env is configured. **No** new scheduling service; **no** transactional blast per event.

---

## Schema

| Field | Purpose |
|--------|---------|
| **`weeklyMarketingDigestOptIn`** | `Boolean` default **false** |
| **`lastMarketingDigestSentAt`** | Last successful send timestamp (duplicate guard) |

**Migration:** `20260402120000_user_weekly_marketing_digest`

---

## Opt-in

- **Settings** (`/settings`) — “Email” block with checkbox; stored on **Save** with the rest of the profile.

---

## Digest contents (deterministic)

Built by **`buildMarketingDigestSnapshot`** from existing helpers/metrics:

- KPI line: live count, total views, share clicks, bid clicks (intent), active campaigns  
- **Recent marketing alerts** (same `MARKETING_*` notifications as in-app)  
- **Top LIVE by views** / **top LIVE by bid clicks** (up to 5 each)  
- **Ending within ~7 days** (LIVE)  
- **Low tracked signals** (LIVE, lifetime views+shares+bid clicks &lt; **8**)  
- **Active campaigns** with links to listing marketing  

Links use **`getPublicSiteOrigin()`** + **`/u/[handle]/marketing/...`**.

---

## Delivery

| Step | Detail |
|------|--------|
| **Dry-run** | `npm run marketing:send-digest -- --dry-run` — prints subject + text snippet; **no** email; **no** DB update |
| **Send** | `MARKETING_ENABLED=true` **and** `MARKETING_DIGEST_SEND_ENABLED=true` **and** `RESEND_API_KEY` **and** `MARKETING_DIGEST_FROM` (verified sender, e.g. `Carasta <digest@yourdomain.com>`) |
| **Spacing** | Skip if **`lastMarketingDigestSentAt`** &lt; **~6.5 days** ago unless **`MARKETING_DIGEST_FORCE=1`** |

No send runs on app boot.

---

## Email infrastructure

**Resend REST only** (`lib/email/send-marketing-digest-email.ts`). No Nodemailer dependency added. If env is missing, the script explains what to set.

---

## PR 15 (next best step)

Document **edge/WAF** rules for **`/api/marketing/track`**, **or** wire **Vercel Cron** (or similar) to **`marketing:send-digest`** weekly — **one slice per PR**.
