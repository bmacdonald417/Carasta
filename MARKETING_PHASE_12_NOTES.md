# Marketing Phase 12 — Application-level rate limiting (track endpoint)

**Date:** 2026-04-01  
**Scope:** In-memory, **per-server-instance** burst limits on **`POST /api/marketing/track`** only. Complements **`track-marketing-event-server`** dedupe windows; does **not** replace them. **No** schema, **no** Redis, **no** seller UI or auction/bid/campaign/community changes.

---

## Where it lives

| Piece | Path |
|--------|------|
| Limiter | **`lib/marketing/marketing-track-rate-limit.ts`** |
| Wiring | **`app/api/marketing/track/route.ts`** (after body validation + JWT, **before** `auction.findUnique` and **`recordTrafficEvent`**) |

---

## Request key

- **IP:** First comma-separated entry of **`X-Forwarded-For`**, else **`X-Real-Ip`**, else treated as **`unknown`** (shared bucket — see limitations).
- **Identity:** NextAuth JWT **`sub`** when present, else **`anon`**.
- **Window:** Wall-clock bucket **`floor(now / 10_000) * 10_000`** ms.

Composite map key: `` `${ip}\0${userIdOrAnon}\0${windowStart}` ``.

---

## Limits (per window, per key)

10-second windows. **Event-aware** (separate counters in the same window object):

| Event | Max events / 10s |
|--------|------------------|
| **VIEW** | 45 |
| **SHARE_CLICK** | 18 |
| **BID_CLICK** | 18 |

VIEW is highest; share and bid are moderate and equal.

---

## Response when limited

- **HTTP 200** + **`{ "ok": true }`** — same success envelope as a normal accepted request.
- **No** DB write, **no** rollup increment (handler returns before **`recordTrafficEvent`**).
- Clients that use fire-and-forget beacons see no error; UX stays non-breaking.

---

## Limitations (explicit)

| Topic | Behavior |
|--------|----------|
| **Multi-instance** | Each Node/serverless instance keeps **its own** `Map`. Global abuse can exceed per-instance caps until edge limits exist. |
| **Spoofed headers** | Attacker-controlled `X-Forwarded-For` can evade or poison buckets unless the platform **strips/overwrites** headers at the edge (trusted proxy). |
| **`unknown` IP** | Local/dev or missing headers: all traffic shares **`unknown`** + **`anon`** buckets — can hit caps faster when testing many tabs. |
| **Role** | **Abuse / burst** relief and per-node protection, not a substitute for **WAF**, **CDN limits**, or DB dedupe. |

---

## Relation to Phase 10 dedupe

- **Route limiter:** caps **arrival rate** before Prisma.
- **`track-marketing-event-server`:** **60s/90s VIEW**, **8s SHARE**, **12s BID** duplicate suppression **after** accept.

Both can apply: a burst may be dropped at the route; accepted events still dedupe as before.

---

## PR 13 / Phase 13

**Implemented:** Seller **`MARKETING_*`** in-app notifications. See **`MARKETING_PHASE_13_NOTES.md`**.

## Edge / WAF (Phase 16)

Production runbook: **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** (complements this in-app limiter).

## Observability (Phase 17)

Outcome counters + logs: **`lib/marketing/marketing-track-observability.ts`**, **`MARKETING_PHASE_17_NOTES.md`**.

## Admin snapshot (Phase 18)

**`GET /api/admin/marketing-track-observability`** — **`MARKETING_PHASE_18_NOTES.md`**.
