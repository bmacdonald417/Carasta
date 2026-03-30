# Marketing track — edge / WAF operator runbook

**Route:** `POST /api/marketing/track`  
**Code:** `app/api/marketing/track/route.ts`  
**Audience:** Engineering / DevOps / SRE deploying Carasta behind a reverse proxy, CDN, or WAF.

This document is **operational guidance**. Edge rules are **complementary** to in-app logic; they do not replace database dedupe or per-instance rate limits.

---

## 1. Purpose

### Why this endpoint matters

- **Write path:** Every accepted request can insert a **`TrafficEvent`** row and may bump **`AuctionAnalytics`** rollups (`recordTrafficEvent` in `lib/marketing/track-marketing-event-server.ts`). Abuse or accidental loops can **inflate seller metrics**, increase DB/IO cost, and complicate pruning.
- **Public surface:** The route is intended for **browser beacons** from listing/marketing pages. It is **not** authenticated for anonymous viewers; JWT only refines identity when present. That makes it a natural target for scripted traffic if URLs are guessed.
- **Soft failure design:** When the **in-app** rate limiter trips, the API returns **HTTP 200** with `{ "ok": true }` and **does not write**—clients stay quiet. Edge rules that return **4xx/429** are a different contract; prefer **generous ceilings** at the edge and let the app drop noise where possible (see §5).

### How edge/WAF fits with the app

| Layer | Role |
|--------|------|
| **Edge / WAF** | First line: IP reputation, coarse rate limits, body size, method allowlists, bot scores. Protects **all app routes** and the **origin** from volume spikes. |
| **Route limiter** (`marketing-track-rate-limit.ts`) | **Per-instance** burst cap (10s windows, event-type buckets). Not shared across horizontally scaled replicas. |
| **Dedupe** (`track-marketing-event-server.ts`) | **Per-event** time windows after a request is accepted (VIEW 60s/90s, SHARE 8s, BID 12s). Reduces duplicates **in DB**; does not cap request rate. |
| **Validation / sanitization** (`marketing.ts` Zod + `sanitize-marketing-metadata`) | Rejects malformed bodies (**400** `{ ok: false }`); clamps metadata shape and size. |

**Coordination:** WAF **block/challenge** decisions are **not** used for attribution or seller analytics. Only persisted **`TrafficEvent`** rows count toward metrics.

---

## 2. Current in-app protections (reference)

### Route-level limiter (Phase 12)

- **File:** `lib/marketing/marketing-track-rate-limit.ts`
- **When:** After body parse + Zod validation + JWT read; **before** `auction.findUnique` and **`recordTrafficEvent`**.
- **Key:** First hop of `X-Forwarded-For`, else `X-Real-Ip`, else `unknown`; plus JWT `sub` or `anon`.
- **Window:** 10s wall-clock buckets.
- **Limits (per key, per window):** VIEW **45**, SHARE_CLICK **18**, BID_CLICK **18**.
- **When limited:** **200** + `{ "ok": true }` — **no DB write**.

### Event-level dedupe (Phase 10)

- **File:** `lib/marketing/track-marketing-event-server.ts` (constants exported for docs/tests).
- **VIEW:** 60s (authenticated) / 90s (anonymous) by auction + identity keys.
- **SHARE_CLICK:** 8s (includes `shareTarget`).
- **BID_CLICK:** 12s (includes `bidUiSurface`).
- **Skipped duplicate:** Still **`{ ok: true }`** path after insert path is skipped; HTTP status remains success for accepted requests.

### Payload guardrails

- **Zod** (`lib/validations/marketing.ts`): `auctionId`, `eventType`, optional `source`, optional `visitorKey` (8–128), optional `metadata` (≤12 keys, string values ≤4096 chars each).
- **Sanitization** (`sanitize-marketing-event-server.ts` + `sanitize-marketing-metadata.ts`): Allowlisted keys per event type; server-injected normalized `visitorKey`; total stored string budget per event.

### Marketing off

- If `MARKETING_ENABLED` is false: **204** empty response (no JSON body).

---

## 3. Recommended edge / WAF protections

### Path-specific rule

- **Match:** Exact path **`/api/marketing/track`** (or your deployment’s URL prefix if the app is mounted under a subpath—adjust accordingly).
- **Method:** **Allow `POST` only.** The route **does not** define `GET`, `PUT`, etc.; undefined methods yield Next.js defaults (typically **405**), but explicit edge denial reduces noise.

### IP reputation / bot management

- Enable **managed rules** or **bot protection** from your provider where available.
- Prefer **log / challenge** before **hard block** for new rulesets so seller traffic is not cut off during tuning.
- **Logged-in users** still originate from normal residential/mobile IPs; avoid rules that broadly block “datacenter only” without monitoring false positives.

### Request rate at the edge

- Apply a **separate** rate limit **scoped to this path** (not only global site limits).
- Use a **coarse ceiling** higher than what a single app instance would accept in the same window, accounting for **multiple replicas** (each runs its own in-memory limiter map).

### Body size limits

- Valid requests are **small JSON**: bounded `auctionId`, enum `eventType`, small `metadata`. A typical payload is well under **16–32 KB**.
- **Recommendation:** cap request body for this path at **64 KB** (or **128 KB** if you want margin for logging-heavy metadata). Requests above the cap should be **rejected** at the edge or by the platform without hitting the app—this blocks oversized junk without changing app code.
- The app parses with `req.json()`; extremely large bodies waste origin CPU before Zod runs—edge limits help first.

### Geo / provider notes

- **Avoid** strict geo-blocking unless product/legal requires it; auctions attract international interest.
- **Railway:** Often terminates TLS at Railway’s edge; ensure **trusted proxy** behavior so `X-Forwarded-For` reflects the **client**, not an internal hop. If you add **Cloudflare** (or similar) in front, configure **“restore visitor IP”** so the origin sees a correct forwarded chain; otherwise in-app IP bucketing and any future IP-based logic skew.

### Do not break normal seller traffic

- Sellers testing listings may refresh frequently; anonymous **`visitorKey`** paths can generate multiple VIEWs across devices.
- Favor **high thresholds + observe**, then tighten. Pair with **dashboards** on 4xx/429 for this path.

---

## 4. Suggested threshold strategy

| Layer | Intent | Example mindset |
|--------|--------|------------------|
| **Edge** | Stop **absurd** volume (bots, accidental tight loops, huge bodies) | Per-IP **requests/minute** to `/api/marketing/track` well above legitimate peaks—e.g. **hundreds per minute** as a starting ceiling before tuning (adjust for your traffic). |
| **App limiter** | Per-replica **burst** alignment with UI reality (45 VIEW / 10s) | Finer event-type split; **200** success on cap. |
| **Dedupe** | **Metric correctness** within accepted traffic | Seconds–minutes windows; does not protect origin from floods. |

**Why thresholds differ:** Edge sees **all replicas** and raw HTTP; the app limiter sees **one process** and uses **200** soft drops. Edge **429/403** changes client-visible behavior for misbehaving clients only if those errors are returned—keep edge caps **loose** if you rely on app soft drops.

---

## 5. Provider-oriented examples (concise)

### Railway (current repo default)

- **Ingress:** Railway terminates HTTPS; confirm docs for **client IP** and forwarded headers.
- **No built-in WAF:** Add **Cloudflare**, **Fastly**, or another proxy in front, **or** rely on app limit + dedupe until traffic warrants more.
- **Cron / digests:** Unrelated; do not point digest cron jobs at `/api/marketing/track`.

**Example (conceptual) — Cloudflare in front of Railway**

1. Proxy hostnames to Railway origin.
2. Enable **Bot Fight Mode** or **Super Bot Fight Mode** per your plan; start in **log** if available.
3. **WAF custom rule:** URI path equals `/api/marketing/track` AND method not `POST` → block or managed challenge.
4. **Rate limiting rule:** If > **N** requests per minute per IP to that path → **managed challenge** first, then **block** after validation.

Adjust **N** using §7.

### Cloudflare (generic)

- **WAF → Custom rules:** `/api/marketing/track` + method POST allow; optional skip for known good ASNs only if you have false positives.
- **Rate limiting:** Separate rule for path + IP; use **threat score** only with monitoring.
- **Request size:** Use Transform Rules or upload limits if your tier supports per-route size (otherwise rely on global limit ≥ 64 KB for POST bodies).

### Vercel (documentation-only)

- If deployed on Vercel: use **Vercel Firewall**, **bot protection**, and **Edge Config**-driven rules as documented by Vercel for your plan. Still keep **POST-only** and **path-scoped** limits; behavior mirrors §3–§4.

---

## 6. Monitoring / incident response

### What to watch

| Signal | Meaning |
|--------|--------|
| **HTTP 4xx/429** on `/api/marketing/track` (edge) | Possible overtight rule or attack |
| **Origin 5xx** on same path | App/database issues (distinct from WAF) |
| **`TrafficEvent` insert rate** (DB/metrics) | Spikes after marketing pushes or abuse |
| **AuctionAnalytics drift** | If inserts lag rollups (operational; see Phase 6 notes) |
| **App logs** prefix **`[marketing-track]`** | Phase 17 structured outcomes (anomalies by default); see **`MARKETING_PHASE_17_NOTES.md`** |
| **Admin JSON** **`GET /api/admin/marketing-track-observability`** | Phase 18 per-instance counter snapshot (ADMIN or bearer secret); see **`MARKETING_PHASE_18_NOTES.md`** |

### Abuse / noise indicators

- Single IP dominating request volume to **this path only**.
- Surge in **400** from origin (malformed JSON)—may indicate scanning or bad integration.
- **200** with flat metrics but high ingress = mostly **limiter/dedupe** drops (expected under stress).

### What to tighten first

1. **Bot / managed rules** in log/challenge.
2. **Per-path rate** at edge.
3. **Body size** cap.

### What not to change recklessly

- Do not lower app **dedupe** windows to “fix” abuse—use edge + limiter.
- Do not block **`POST /api/marketing/track`** globally without a break-glass path (§8).

---

## 7. Rollout plan

1. **Observe:** Enable WAF/proxy logging for the path only; no block.
2. **Challenge:** Add managed challenge for suspicious IPs or burst tier.
3. **Enforce block** only for clear bad patterns (non-POST, oversized body, extreme RPM).
4. **Validate:** Compare seller marketing **views / share / bid-click** trends week-over-week; spot-check a live listing in staging with DevTools network tab.

---

## 8. Fallback / rollback

- **Disable or loosen** the newest WAF custom rule first (method/body/rate).
- **Bypass** if available: rule exception for your office IPs **only temporarily** for debugging.
- **App unchanged:** In-app limiter and dedupe remain; rolling back edge rules restores prior client-visible error rates.

---

## 9. Required coordination notes

- **Edge is not authoritative** for marketing attribution; only stored events are.
- **Per-instance limiter:** Under horizontal scale, global abuse can exceed **per-node** caps until edge catches it—this is expected.
- **Header trust:** **`X-Forwarded-For`** must reflect the **real client** at your trust boundary; misconfiguration merges many users into one bucket (`unknown` or one IP) and can trigger limiter side effects.
- **204 when marketing disabled:** Edge rules should not assume JSON on every response.

---

## Related docs

- `MARKETING_PHASE_10_NOTES.md` — dedupe + metadata
- `MARKETING_PHASE_12_NOTES.md` — in-app rate limiter
- `MARKETING_IMPLEMENTATION_PLAN.md` — §12q Phase 16, §12r Phase 17
- `MARKETING_PHASE_17_NOTES.md` — in-app observability
- `MARKETING_PHASE_18_NOTES.md` — protected admin JSON snapshot
