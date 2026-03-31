# EXTERNAL_REFERRAL landing instrumentation — operator / developer runbook

**Scope:** When and how to record **`TrafficEvent`** rows with **`eventType = EXTERNAL_REFERRAL`** on inbound marketing landings. Complements **`VIEW`**, **`SHARE_CLICK`**, **`BID_CLICK`**.

**Related:** `POST /api/marketing/track`, `lib/marketing/track-marketing-event-server.ts` (dedupe), `MARKETING_TRACK_EDGE_WAF_RUNBOOK.md` (limits, privacy).

---

## What EXTERNAL_REFERRAL means

A **distinct funnel signal**: “this session hit the listing in a context we treat as **external / campaign-driven**,” separate from a generic **page view** (**`VIEW`**).

- **`VIEW`**: Normal listing impression (every enabled auction detail load).
- **`EXTERNAL_REFERRAL`**: Optional **second** event when you want **attribution-friendly** counts (e.g. **UTM**-tagged links or **known click-id** query parameters from major ad platforms).

Both can occur on the same load; they are **not** interchangeable. Admin and seller analytics surface **`EXTERNAL_REFERRAL`** separately (e.g. admin totals, CSV, JSON snapshot).

---

## Attribution signals (default auction landing)

**In-app default** (`AuctionViewTracker`): one **`EXTERNAL_REFERRAL`** per mount when **`urlHasExternalMarketingAttributionParams()`** is true — **either**:

1. **UTM:** any query key starting with **`utm_`** (case-insensitive), e.g. `utm_source`, `utm_campaign`.
2. **Click IDs:** query key is one of (case-insensitive): **`gclid`** (Google), **`fbclid`** (Meta), **`msclkid`** (Microsoft Ads).

### UTM vs click IDs

| Signal | Typical use | Notes |
|--------|-------------|--------|
| **UTM** | Human-chosen campaign labels on links | Explicit tagging; not auto-injected like platform click ids. |
| **Click IDs** | Platform-injected on ad clicks | Strong hint of paid / platform-mediated arrival; not proof of a real ad click (URLs can be shared). Industry-standard conservative hook. |

We **do not** persist click-id **values** in dedicated metadata fields — only **`path`**, **`referrer`**, **`currentUrl`** (existing rules). **`currentUrl`** may contain query strings until clipped; see **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`**.

### Limitations

- Organic shares that copy a URL **with** UTM or click ids will also match.
- Other params (**`twclid`**, etc.) are **not** enabled unless added in a future PR with docs.

---

## When to fire it

**Do fire** when there is a **clear, low-noise** signal:

- **Default:** **`urlHasExternalMarketingAttributionParams()`** on public auction detail (UTM **or** supported click id).
- **Custom flows:** **`sendMarketingTrackExternalReferralLanding`** after your own validation (referrer allowlist, etc.).

**Do not fire** on every organic visit with no signal — rely on **`VIEW`** only.

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
| Typical tagged load (UTM or click id) | 1× VIEW + 1× EXTERNAL_REFERRAL (first hit in window) | Same |

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
| **`urlHasExternalMarketingAttributionParams`** | UTM **or** click id (default landing gate) |
| **`urlHasUtmAttributionParams`** | UTM only |
| **`urlHasClickIdAttributionParams`** | click id only |
| **`EXTERNAL_MARKETING_CLICK_ID_PARAMS`** | documented key list |
| **`sendMarketingTrack`** (generic) | `lib/marketing/send-marketing-track.ts` |

All use **non-blocking** **`sendBeacon`** / **`fetch(..., keepalive: true)`**; errors are swallowed.

---

## In-repo integration

- **Public auction detail:** `components/marketing/auction-view-tracker.tsx` — after **`VIEW`**, if **`urlHasExternalMarketingAttributionParams()`**, one **`EXTERNAL_REFERRAL`** per mount (marketing enabled only).

---

## QA checklist

1. `/auctions/{id}` **no query** → only **`VIEW`**.
2. `/auctions/{id}?utm_source=test` → **`VIEW`** + **`EXTERNAL_REFERRAL`**.
3. `/auctions/{id}?gclid=dummy` (or **`fbclid`**, **`msclkid`**; key case-insensitive) → **`VIEW`** + **`EXTERNAL_REFERRAL`**.
4. **`MARKETING_ENABLED=0`** → tracker off; no client beacons.
