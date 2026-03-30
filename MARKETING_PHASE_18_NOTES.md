# Marketing Phase 18 — Protected admin JSON snapshot (track observability)

**Date:** 2026-03-30  
**Scope:** **`GET /api/admin/marketing-track-observability`** returns in-memory marketing track counters for **this Node process** only. **No** seller UI, **no** schema, **no** change to **`POST /api/marketing/track`** behavior.

---

## Route

| | |
|---|--|
| **Path** | **`/api/admin/marketing-track-observability`** |
| **Method** | **`GET`** |
| **Success** | **200** JSON |
| **Unauthorized** | **401** `{ "ok": false }` (generic) |

**Note:** **`middleware.ts`** does **not** match `/api/*`; protection is **entirely** in this route handler (JWT + optional secret).

---

## Authentication

1. **ADMIN session** — caller must present a valid NextAuth session cookie with **`role === ADMIN`** (same role as `/admin/*` pages).
2. **Optional ops bearer** — if **`MARKETING_TRACK_OBSERVABILITY_SECRET`** is set in the environment (**≥ 16** characters), **`Authorization: Bearer <secret>`** is also accepted (for scripts / cron without browser login).

If neither applies → **401**. The response does not distinguish “wrong secret” vs “not admin”.

---

## Response shape (success)

```json
{
  "ok": true,
  "generatedAt": "2026-03-30T12:00:00.000Z",
  "totalRequests": 1234,
  "counters": { "event_inserted|VIEW|anonymous": 100, "..." : 0 },
  "totalsByOutcome": { "event_inserted": 900, "route_rate_limited": 50 },
  "totalsByEventType": { "VIEW": 800, "SHARE_CLICK": 100, "unknown": 20 },
  "totalsByAuthMode": { "anonymous": 700, "authenticated": 400, "unknown": 10 },
  "scope": { "note": "In-memory counters for this Node.js process only; ..." }
}
```

- **`counters`** — keys are **`outcome|eventType|authMode`** (`eventType` **`_`** in storage becomes **`unknown`** in **`totalsByEventType`**).
- **`totalRequests`** — sum of all counter values (total requests observed since process start).

No IPs, user ids, auction ids, or payloads.

---

## Limitations

- **Per-instance:** Each replica has its own `Map`; **sum across hosts manually** or use log/WAF metrics for fleet-wide view.
- **Ephemeral:** Resets on **deploy / restart / cold start**.
- **Not authoritative** for business KPIs — use **`TrafficEvent`** / analytics for truth; this is a **cheap health** signal.

---

## PR 19 (implemented)

**Retention / privacy runbook:** **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`**, **`MARKETING_PHASE_19_NOTES.md`**.

## PR 20 (implemented)

**Seller CSV exports:** **`MARKETING_PHASE_20_NOTES.md`**.

## PR 21 (implemented)

**UX polish:** **`MARKETING_PHASE_21_NOTES.md`**.

## PR 22 (suggested next step)

Next roadmap slice — one PR.
