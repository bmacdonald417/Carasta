# Marketing Phase 29 — Conservative click-id support for EXTERNAL_REFERRAL

**Date:** 2026-03-30  
**Scope:** Extend default auction-landing detection beyond **UTM** to **gclid**, **fbclid**, **msclkid**. **No** schema change, **no** new metadata fields, **no** seller page redesign.

---

## Supported click-id query keys

| Key | Platform (typical) |
|-----|---------------------|
| **`gclid`** | Google Ads / Google |
| **`fbclid`** | Meta (Facebook / Instagram) |
| **`msclkid`** | Microsoft Advertising (Bing) |

Matching is **case-insensitive** on the query **key** only. Constants: **`EXTERNAL_MARKETING_CLICK_ID_PARAMS`** in **`lib/marketing/track-external-referral-landing.ts`**.

---

## Code

| Export | Role |
|--------|------|
| **`urlHasClickIdAttributionParams()`** | True if any supported click-id key is present. |
| **`urlHasExternalMarketingAttributionParams()`** | **`urlHasUtmAttributionParams()`** OR **`urlHasClickIdAttributionParams()`**. |
| **`urlHasUtmAttributionParams()`** | Unchanged (UTM-only checks). |

**`AuctionViewTracker`** gates **`sendMarketingTrackExternalReferralLanding`** on **`urlHasExternalMarketingAttributionParams()`**.

**`sendMarketingTrackExternalReferralLanding`** unchanged — same dedupe, rate limits, and **`path` / `referrer` / `currentUrl`** metadata.

---

## Docs

- **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** — UTM vs click ids, limitations, QA.

---

## PR Phase 30 (implemented)

Admin snapshot route observability — **`MARKETING_PHASE_30_NOTES.md`**.

## PR 31

Implemented — **`GET /api/admin/marketing-snapshot-observability`** — **`MARKETING_PHASE_31_NOTES.md`**.

## PR 32 (exact next best step)

**`twclid`** (or similar) **EXTERNAL_REFERRAL** allowlist expansion with runbook + privacy notes — **one** narrow PR.
