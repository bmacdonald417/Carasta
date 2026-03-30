# Marketing Phase 8 — BID_CLICK intent tracking

**Date:** 2026-03-30  
**Scope:** UI-layer **bid intent** signals as **`TrafficEvent` `BID_CLICK`** only. Does **not** reflect successful bids, reserve, or anti-sniping. **No** changes to `placeBid`, `quickBid`, `buyNow`, or rollup daily aggregates.

---

## Schema

**No migration.** `MarketingTrafficEventType.BID_CLICK` was already in the enum from Phase 1.

---

## Where BID_CLICK is captured

| `bidUiSurface` | Trigger |
|----------------|---------|
| `quick_bid` | User clicks primary **Bid {min}** (logged-in). |
| `custom_bid` | User clicks **Bid** after entering a valid custom amount. |
| `auto_bid` | User clicks **Set** on auto-bid after validation passes. |
| `signup_cta` | Guest clicks **Sign up to bid**. |

**Not captured:** **Buy now** (per PR constraints). **Not** emitted from server bid mutations.

Instrumentation uses **`sendMarketingTrack`** (`sendBeacon` / `fetch keepalive`) — failures are silent and **never** block the click handler.

**Metadata (sanitized):** `bidUiSurface`, `path`, `currentUrl` (+ server-injected `visitorKey` when present).

---

## Dedupe (server)

- **Window:** **12 seconds** (`MARKETING_BID_CLICK_DEDUPE_MS` in `track-marketing-event-server.ts`; Phase 10 renamed export).
- **Key:** Same **`auctionId`** + **`eventType` BID_CLICK** + **`bidUiSurface`** (from JSON metadata) + (**`userId`** if logged in **else** anonymous **`visitorKey`** in metadata).
- Skipped duplicates return **`{ ok: true, skipped: true }`** (same as VIEW/SHARE pattern).

---

## Rollups

**Not extended.** `AuctionAnalytics` still aggregates **VIEW** and **SHARE_CLICK** only. **BID_CLICK** is read from **raw** `TrafficEvent` counts.

---

## Seller analytics

| Surface | Metric |
|---------|--------|
| Overview | **Bid Clicks** KPI (seller-scoped); listing cards show bid click count. |
| Auction drill-down | **Bid clicks**, **Bid clicks (24h)**, **Bid clicks (7d)**; **Event type** breakdown includes BID_CLICK; **Recent activity** **Detail** column shows bid surface label when applicable. |

---

## PR 9 / Phase 9

**Implemented:** Saved **marketing presets** (manual Share & Promote defaults). See **`MARKETING_PHASE_9_NOTES.md`**.

## PR 10 ideas

- **Ingest throttle** / sampling (edge or app).
- Optional **`Post.auctionId`** or structured promo linkage.
- Optional **BID_CLICK** rollup column if daily aggregates need parity with views/shares.
