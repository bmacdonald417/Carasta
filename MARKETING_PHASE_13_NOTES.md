# Marketing Phase 13 — Seller marketing notifications (in-app)

**Date:** 2026-04-01  
**Scope:** Reuse **`Notification`** for deterministic seller **marketing** alerts. **In-app only** (bell dropdown + marketing pages). **No** email, push, SMS, or cron. **No** schema change. Generation runs on **server render** of seller marketing overview and per-listing marketing drill-down — **idempotent** via time-bounded dedupe.

---

## Types (`Notification.type`)

All use prefix **`MARKETING_`**:

| Type | When it fires (summary) |
|------|-------------------------|
| **`MARKETING_ENDING_SOON_HIGH_INTEREST`** | LIVE listing ends within **48h** and (**views in 7d ≥ 25** or **bid clicks in 7d ≥ 5**) |
| **`MARKETING_ENDING_SOON_LOW_INTEREST`** | LIVE listing ends within **48h** and **views 7d < 8** and **bid clicks 7d < 2** |
| **`MARKETING_BID_CLICK_SURGE`** | **Bid clicks in last 24h ≥ 10** |
| **`MARKETING_NO_RECENT_ACTIVITY`** | LIVE, **not** in the 48h ending window, **no** VIEW/SHARE_CLICK/BID_CLICK in **7d** |
| **`MARKETING_CAMPAIGN_START`** | **`Campaign`** **ACTIVE**, **`startAt`** between **now−72h** and **now** |

Thresholds are intentionally simple — tune in code (`generate-marketing-notifications.ts`) if product feedback warrants it.

---

## Payload (`payloadJson`)

JSON string with at least **`title`**, usually:

- **`marketingHref`** — e.g. `/u/{handle}/marketing/auctions/{auctionId}` (preferred for sellers)
- **`auctionId`**, **`campaignId`** as needed  
  Global bell **`NotificationRow`** uses **`marketingHref`** first, then public `/auctions/...`.

---

## Generation & dedupe

- **Trigger:** **`ensureSellerMarketingNotifications(sellerId, handle)`** called from:
  - **`/u/[handle]/marketing`**
  - **`/u/[handle]/marketing/auctions/[auctionId]`**  
  (after `MARKETING_ENABLED` + owner checks on those pages.)

- **Work bound:** Up to **80** LIVE auctions for the seller per run; **30** recent-start campaigns.

- **Dedupe:** No second notification of the same **`type`** for the same **`auctionId`** (or **`campaignId`** for starts) within **72h** (auctions) or **120h** (campaign), checked with **`payloadJson` `{ contains: "\"auctionId\":\"...\"` }`** (PostgreSQL string column).

- **Not a scheduler:** Alerts appear after the seller **loads** a marketing page; no background worker.

---

## Where sellers see them

| Surface | Behavior |
|---------|-----------|
| **Marketing overview** | **`MarketingAlertsPanel`** — up to **10** recent **`MARKETING_*`** rows |
| **Auction marketing drill-down** | Same panel (**compact**), filtered to alerts for **that `auctionId`** |
| **Header bell** | Existing **`/api/notifications/list`** — marketing rows interleave with others; links prefer **`marketingHref`** |

---

## Limitations

- **Per-page invocation:** Heavy sellers trigger a full rule pass on each marketing navigation (bounded, no unbounded N+1).
- **`payloadJson` substring dedupe** depends on stable JSON key order (`JSON.stringify` from a single code path).
- **Campaign start:** Only campaigns with **`startAt`** set; **ACTIVE** and started within the last **72h** window.
- **No read/unread** sync from marketing panel to DB on link click (reuse global **Mark all read** if desired).

---

## PR 14 (next best step)

**Edge / WAF** runbook for **`POST /api/marketing/track`**, **or** optional **email digest** (opt-in) summarizing marketing KPIs — **one slice per PR**.
