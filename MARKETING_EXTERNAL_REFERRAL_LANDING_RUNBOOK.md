# EXTERNAL_REFERRAL landing instrumentation — operator / developer runbook

**Scope:** When and how to record **`TrafficEvent`** rows with **`eventType = EXTERNAL_REFERRAL`** on inbound marketing landings. Complements **`VIEW`**, **`SHARE_CLICK`**, **`BID_CLICK`**.

**Related:** `POST /api/marketing/track`, `lib/marketing/track-marketing-event-server.ts` (dedupe), `MARKETING_TRACK_EDGE_WAF_RUNBOOK.md` (limits, privacy).

---

## What EXTERNAL_REFERRAL means

A **distinct funnel signal**: “this session hit the listing in a context we treat as **external / campaign-driven**,” separate from a generic **page view** (**`VIEW`**).

- **`VIEW`**: Normal listing impression (every enabled auction detail load).
- **`EXTERNAL_REFERRAL`**: Optional **second** event when you want **attribution-friendly** counts (e.g. links tagged with **UTM**, or a future integration that validates referrer / click ids).

Both can occur on the same load; they are **not** interchangeable. Admin and seller analytics surface **`EXTERNAL_REFERRAL`** separately (e.g. admin totals, CSV, JSON snapshot).

---

## When to fire it

**Do fire** when there is a **clear, low-noise** signal, for example:

- Listing URL includes any **`utm_*`** query parameter (e.g. `utm_source`, `utm_campaign`).  
  **In-app default:** `AuctionViewTracker` calls **`sendMarketingTrackExternalReferralLanding`** once per page load when **`urlHasUtmAttributionParams()`** is true (same **`visitorKey`** as **`VIEW`** where possible).
- Custom flows: after your code confirms an external campaign redirect (validated referrer allowlist, ad network callback, etc.).

**Do not fire** on every organic visit with no campaign signal — that would duplicate noise and dilute the metric ( **`VIEW`** already captures broad traffic).

---

## When not to fire it

- **No attribution signal** — rely on **`VIEW`** only.
- **Same load, duplicate intent** — the server dedupes **per event type** (see below); still avoid calling the helper in a tight loop from client code.
- **Seller-only or authenticated admin tools** — not a substitute for product analytics on internal pages.

---

## Interaction with VIEW

| Aspect | VIEW | EXTERNAL_REFERRAL |
|--------|------|-------------------|
| Rollups | Increments **`AuctionAnalytics`** views | Does **not** change rollups |
| Dedupe | Own window (auth vs anon) | Own window (mirrors VIEW-style user / visitorKey) |
| Typical load with UTM | 1× VIEW + 1× EXTERNAL_REFERRAL (first hit in window) | Same |

**Double counting:** Two **different** event types on one landing is **intentional** when you want “all views” plus “campaign-tagged landings.” Do **not** remove **`VIEW`** when adding **`EXTERNAL_REFERRAL`**.

---

## Dedupe (server)

- **EXTERNAL_REFERRAL:** Same **`auctionId`** + **`userId`** (if logged in) within **60s** (authenticated) or **`visitorKey`** on anonymous within **90s** → second row skipped (deduped), same as **`VIEW`** pattern. See **`track-marketing-event-server.ts`**.
- Rate limit: **`marketing-track-rate-limit.ts`** (per IP + user bucket).

---

## Recommended client metadata

Allowed on **`EXTERNAL_REFERRAL`** (sanitized server-side): **`path`**, **`referrer`**, **`currentUrl`** (strings).  
**`sendMarketingTrackExternalReferralLanding`** fills these from **`window` / `document`** when called from the browser.

Do **not** send PII in metadata; values are clipped per **`sanitize-marketing-metadata.ts`**.

---

## Thin client helpers

| Export | File |
|--------|------|
| **`sendMarketingTrackExternalReferralLanding`** | `lib/marketing/track-external-referral-landing.ts` |
| **`urlHasUtmAttributionParams`** | same |
| **`sendMarketingTrack`** (generic) | `lib/marketing/send-marketing-track.ts` |

All use **non-blocking** **`sendBeacon`** / **`fetch(..., keepalive: true)`**; errors are swallowed.

---

## In-repo integration (Phase 27)

- **Public auction detail:** `components/marketing/auction-view-tracker.tsx` — after **`VIEW`**, if **`urlHasUtmAttributionParams()`**, one **`EXTERNAL_REFERRAL`** per mount (marketing enabled only).

---

## QA checklist

1. Open `/auctions/{id}` **without** query → only **`VIEW`** (and existing behaviors).
2. Open `/auctions/{id}?utm_source=test` → **`VIEW`** + **`EXTERNAL_REFERRAL`** (within dedupe windows, refresh may dedupe second **`EXTERNAL_REFERRAL`**).
3. **`MARKETING_ENABLED=0`** → tracker off; no client beacons.
