# Marketing Phase 27 — EXTERNAL_REFERRAL landing runbook + client helper

**Date:** 2026-03-30  
**Scope:** Make **EXTERNAL_REFERRAL** usable from the browser with clear semantics. **No** Prisma migration.

---

## Artifacts

| Item | Path |
|------|------|
| Runbook | **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** |
| Helpers | **`lib/marketing/track-external-referral-landing.ts`** |
| Payload type | **`lib/marketing/track-payload-types.ts`** — **`eventType`** includes **`EXTERNAL_REFERRAL`** |
| Landing integration | **`components/marketing/auction-view-tracker.tsx`** — **`VIEW`** then **`EXTERNAL_REFERRAL`** if any **`utm_*`** in query |
| Cross-link | **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** — related docs |

---

## Operator / developer usage

1. Read **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** for **VIEW vs EXTERNAL_REFERRAL**, dedupe, and metadata.
2. For **custom** landings (not the default auction page), call **`sendMarketingTrackExternalReferralLanding({ auctionId, visitorKey? })`** only when your product rule says there is an external-attribution signal; reuse **`getOrCreateMarketingVisitorKey()`** when anonymous.
3. **Attribution auto-path:** Any listing URL with **UTM** or supported **click ids** (Phase 29) triggers the extra beacon once per mount (marketing flag on).

---

## PR 28

Implemented as **Phase 28** — **`MARKETING_PHASE_28_NOTES.md`**.

## PR 29

Implemented as **Phase 29** — **`MARKETING_PHASE_29_NOTES.md`**.

## PR 30

Implemented — **`MARKETING_PHASE_30_NOTES.md`**.

## PR 31

Implemented — **`MARKETING_PHASE_31_NOTES.md`**.

## PR 32 (suggested next step)

Click-id allowlist expansion with sign-off — narrow scope.
