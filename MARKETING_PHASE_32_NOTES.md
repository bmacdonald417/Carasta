# Marketing Phase 32 — Conservative **twclid** for EXTERNAL_REFERRAL

**Scope:** Add **`twclid`** (X / Twitter Ads click identifier) to the same **query-key-only**, case-insensitive allowlist used for **`gclid`**, **`fbclid`**, and **`msclkid`**. **No** new **`TrafficEvent`** type, **no** schema, **no** new metadata fields — values are **not** stored in dedicated columns; only existing **`path` / `referrer` / `currentUrl`** rules apply.

## Why **twclid**

X (Twitter) Ads appends **`twclid`** on outbound clicks in common campaign flows. Recognizing the **key** presence aligns Carasta with the existing “known platform click id” pattern: a conservative signal that the landing URL was likely campaign-tagged, not proof of a genuine ad click.

## Implementation

| File | Change |
|------|--------|
| **`lib/marketing/track-external-referral-landing.ts`** | **`twclid`** appended to **`EXTERNAL_MARKETING_CLICK_ID_PARAMS`**. **`urlHasClickIdAttributionParams`** already lowercases keys against the set; **`AuctionViewTracker`** unchanged. |
| **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** | Attribution table, limitations, QA |

**Privacy posture:** Unchanged from Phase 29 — we still do **not** persist click-id **values** as separate metadata fields; **`currentUrl`** may contain the query string subject to existing sanitization/clipping.

## PR Phase 33 (implemented)

**`MARKETING_HANDOFF_INDEX.md`** — master subsystem map. See **`MARKETING_PHASE_33_NOTES.md`**.

## PR 34 (implemented)

**`MARKETING_DEPLOYMENT_CHECKLIST.md`** — **`MARKETING_PHASE_34_NOTES.md`**.

## PR 35 (suggested next step)

See **`MARKETING_IMPLEMENTATION_PLAN.md`** §12zi.

## Related

- **`MARKETING_PHASE_29_NOTES.md`** — original click-id batch
- **`MARKETING_IMPLEMENTATION_PLAN.md`** — §12zg–§12zi
- **`MARKETING_HANDOFF_INDEX.md`**
- **`MARKETING_DEPLOYMENT_CHECKLIST.md`**
