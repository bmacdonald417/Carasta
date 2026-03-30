# TrafficEvent — retention & privacy operator runbook

**Audience:** Engineering, DevOps, security, and maintainers operating Carasta in production.  
**Scope:** The **`TrafficEvent`** Prisma model and the **`POST /api/marketing/track`** ingestion path. **Not** a legal document—coordinate with counsel for jurisdiction-specific requirements.

---

## 1. Purpose and scope

### What `TrafficEvent` is for

- **Seller marketing analytics:** Views, share clicks, and bid-intent clicks on listing pages are recorded to power **per-auction** traffic metrics in the seller marketing UI.
- **Attribution hints:** **`source`** (enum) and optional **`metadata`** (sanitized strings) support coarse channel/referrer context.
- **Dedupe:** Recent-row checks in **`lib/marketing/track-marketing-event-server.ts`** reduce duplicate counts for the same viewer/action within time windows.

### Why retention and privacy matter

- Rows can accumulate quickly at scale (every qualifying beacon may insert).
- **`userId`** links events to an account when the viewer is logged in—**personal data** in many jurisdictions.
- **`metadata`** may contain **URLs and referrers** that can include query tokens or paths you should not retain indefinitely without review.
- **`visitorKey`** (anonymous dedupe) is a **persistent browser-derived token** stored inside **`metadata`** JSON—not a separate column.

---

## 2. What data is stored

| Field | Description |
|--------|-------------|
| **`id`** | CUID |
| **`auctionId`** | FK to listing (cascade delete with auction) |
| **`userId`** | Nullable; set from NextAuth JWT **`sub`** when the viewer is signed in |
| **`eventType`** | **`VIEW`**, **`SHARE_CLICK`**, **`BID_CLICK`** from the public track API (enum also includes **`EXTERNAL_REFERRAL`** for schema completeness; current HTTP ingest uses the three above) |
| **`source`** | **`MarketingTrafficSource`** (e.g. DIRECT, INSTAGRAM, …); inferred server-side with optional client override where validated |
| **`metadata`** | Optional JSON object: **only** allowlisted string keys after sanitization (see §3) |
| **`createdAt`** | Insert time (used for retention / pruning) |

### `visitorKey` handling

- Clients may send a top-level **`visitorKey`** on **`POST /api/marketing/track`**.
- **`lib/marketing/visitor-key.ts`** normalizes it (strip controls, trim, collapse whitespace, lowercase, max 128 chars, min 8 or treated as absent).
- The server **does not** trust a client key inside **`metadata`** for persistence; the normalized key is **merged into `metadata`** server-side for dedupe and queries.
- Anonymous **VIEW** without **`userId`** and without a usable **`visitorKey`** is **not** deduped in DB (cannot attribute safely)—see **`MARKETING_PHASE_10_NOTES.md`**.

### What is **not** stored (by design in current ingest)

- **No raw request body** in the row.
- **No IP address** column on **`TrafficEvent`** (IP is used only for **in-memory** rate limiting on the track route, not persisted here).
- **No user-agent** column on **`TrafficEvent`**.
- **No free-form metadata**—only allowlisted keys, string values, capped lengths and total budget (**`lib/marketing/sanitize-marketing-metadata.ts`**).

---

## 3. Data minimization / privacy posture

| Control | Behavior |
|---------|----------|
| **API validation** | **`lib/validations/marketing.ts`** — ≤12 metadata keys, safe key names, string values only, ≤4096 chars per value |
| **Sanitization** | Per-**`eventType`** allowlist: VIEW (`path`, `referrer`, `currentUrl`); SHARE_CLICK (+ `shareTarget`); BID_CLICK (+ `bidUiSurface`); per-field max lengths; **≤4096** total characters across stored metadata strings before server **`visitorKey`** merge |
| **Authenticated vs anonymous** | Logged-in users get **`userId`** set; anonymous rows use **`userId: null`** and may use **`metadata.visitorKey`** for dedupe |

**Expectations:** Do not treat **`TrafficEvent`** as a security audit log or as a place to add PII “for convenience.” New fields should go through the same allowlist/sanitization pattern.

---

## 4. Retention strategy

### Raw `TrafficEvent`

- **Default operational guidance:** align **`TRAFFIC_EVENT_RETENTION_DAYS`** (prune script) with product/legal needs; the script default is **365** days unless overridden.
- **Shorter retention** reduces DB size and long-lived URL/referrer/user linkage; **longer** improves historical drill-down (if you build it).
- **Nothing deletes `TrafficEvent` automatically** in the app runtime—only **manual/scripted** prune.

### `AuctionAnalytics` rollups

- **Daily buckets** (UTC) for **views** and **share clicks** only—see Prisma model comment.
- **Incremented on ingest** when a new row is inserted; **not** decremented when raw events are pruned.
- After a **large prune** of old raw events, rollup totals may still reflect counts from **deleted** rows. If rollups must match **remaining** raw history only, run **`recomputeAllAuctionAnalyticsFromTrafficEvents()`** via **`scripts/backfill-auction-analytics.ts`** (see **`lib/marketing/prune-traffic-events.ts`** JSDoc and **`MARKETING_PHASE_6_NOTES.md`**).
- **Typical pattern:** keep rollups as the long-lived aggregate; prune raw events once rollups are trusted for reporting, or re-backfill after prune.

### `BID_CLICK`

- Rolled up differently (not in the same **`AuctionAnalytics`** view/share counters); pruning raw events still removes historical bid-click rows—confirm seller-facing metrics do not depend on unbounded raw history.

---

## 5. Pruning operations

| Piece | Location |
|--------|----------|
| Core delete/count | **`lib/marketing/prune-traffic-events.ts`** — **`pruneTrafficEventsOlderThan(cutoff, { dryRun })`** |
| CLI | **`scripts/prune-traffic-events.ts`** |

### Environment variables

| Variable | Role |
|----------|------|
| **`TRAFFIC_EVENT_PRUNE_ENABLED`** | Must be **`true`** for **destructive** delete |
| **`TRAFFIC_EVENT_RETENTION_DAYS`** | Default **365** if not passing **`--days N`** |
| **`TRAFFIC_EVENT_PRUNE_DRY_RUN`** | If **`true`**, count only (same effect as **`--dry-run`**) |

### Commands

- **Dry-run (no enable flag required):**  
  `npm run marketing:prune-traffic-events:dry-run`  
  or `npx ts-node -P tsconfig.scripts.json scripts/prune-traffic-events.ts --dry-run`  
  Optional: **`--days 180`**
- **Delete:**  
  `TRAFFIC_EVENT_PRUNE_ENABLED=true` +  
  `npm run marketing:prune-traffic-events`  
  (or the same script without dry-run)

### Operator sequence (routine)

1. Run **dry-run**; review **count** and **cutoff** timestamp.
2. Schedule low-traffic window if deleting large volumes.
3. Set **`TRAFFIC_EVENT_PRUNE_ENABLED=true`**, run prune.
4. If needed, run **auction analytics backfill** so rollups match remaining raw data.
5. Document retention decision (legal/product owner) in your internal change log.

---

## 6. Incident / abuse handling

| Step | Action |
|------|--------|
| 1 | **Edge / WAF** — see **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** for path **`/api/marketing/track`**. |
| 2 | **App logs** — grep **`[marketing-track]`** for anomaly outcomes (**`MARKETING_PHASE_17_NOTES.md`**). |
| 3 | **Per-instance counters** — **`GET /api/admin/marketing-track-observability`** (ADMIN or bearer secret) — **`MARKETING_PHASE_18_NOTES.md`**. |
| 4 | **DB** — sample recent **`TrafficEvent`** rows by **`auctionId`** / **`createdAt`** (no production PII export without policy). |
| 5 | **Rate limiter** — in-memory per replica; see **`MARKETING_PHASE_12_NOTES.md`**. |

Observability and WAF are **complementary**; none replace DB forensics for targeted abuse.

---

## 7. Compliance / handoff notes

- **Multi-node:** In-memory observability and rate limits are **per process**; pruning is **global** in the database once run against the primary DB.
- **Retention changes** should involve **product** and **legal/privacy** owners—especially if **`userId`** or URL retention periods change.
- **Data subject requests:** Deleting a **User** does not automatically delete **`TrafficEvent`** rows by default—check **`onDelete: SetNull`** on **`userId`**; events become anonymous rows with the same **`metadata`**. Your DSR process may require additional deletes or anonymization—implement outside this runbook if required.
- **Auction deletion:** Cascade removes **`TrafficEvent`** for that auction.

---

## 8. Recommended production checklist

- [ ] **`TRAFFIC_EVENT_RETENTION_DAYS`** and prune cadence documented internally.
- [ ] **`TRAFFIC_EVENT_PRUNE_ENABLED`** only enabled during intentional prune runs (not left on in app env).
- [ ] After large prunes, **backfill** decision recorded (run or accept rollup drift).
- [ ] **`/api/marketing/track`** protected at edge per **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`**.
- [ ] On-call knows **`[marketing-track]`** logs and admin observability route exist.
- [ ] No custom code paths writing **unsanitized** metadata into **`TrafficEvent`**.

---

## Related documentation

- **`MARKETING_PHASE_10_NOTES.md`** — dedupe, metadata, visitor key, prune overview  
- **`MARKETING_PHASE_12_NOTES.md`** — route rate limiting  
- **`MARKETING_PHASE_17_NOTES.md`** — observability  
- **`MARKETING_PHASE_18_NOTES.md`** — admin JSON snapshot  
- **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** — edge protections  
- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12t Phase 19  
