# Marketing Phase 9 — Saved marketing presets

**Date:** 2026-03-30  
**Scope:** Seller-owned **reusable Share & Promote configurations** (UTM campaign label, primary channel for caption URLs, caption variant highlight, hashtags/keywords toggles). **Manual only** — no scheduling, no social APIs, no changes to bid/buy-now/campaign/community core logic.

---

## Schema

**Model:** `MarketingPreset` on `User` (`marketingPresets`).

| Field | Purpose |
|--------|---------|
| `name` | Seller-facing label |
| `source` | Primary channel for caption base URL (`instagram`, `facebook`, `linkedin`, `email`, `carmunity`) |
| `medium` | Stored for consistency with UTM (`social`, `email`, `community`); auto-derived from `source` in UI |
| `campaignLabel` | Optional shared `utm_campaign` for all tracked variants (else default `listing_{auctionId}`) |
| `copyVariant` | Which caption block to highlight (`short`, `long`, `ending_soon`) |
| `includeHashtags` / `includeKeywords` | Strip blocks in generated copy when false |
| `isDefault` | At most one per seller; pre-selected in Share & Promote when presets exist |

**Migration:** `20260331120000_marketing_preset`

---

## Validation & server layer

- **`lib/validations/marketing-preset.ts`** — Zod form schema; `source`/`medium` pairs enforced via `superRefine`.
- **`lib/marketing/get-seller-marketing-presets.ts`** — list (default first, then name), single row for edit.
- **`app/(app)/u/[handle]/marketing/presets/actions.ts`** — `createMarketingPreset`, `updateMarketingPreset`, `deleteMarketingPreset`; `MARKETING_ENABLED` + session handle ownership; setting `isDefault` clears other defaults in a transaction.

---

## UI

| Route | Role |
|--------|------|
| `/u/[handle]/marketing/presets` | List, empty state, delete |
| `/u/[handle]/marketing/presets/new` | Create |
| `/u/[handle]/marketing/presets/[presetId]/edit` | Edit + delete |

**Components:** `marketing-preset-form.tsx`, `marketing-preset-delete-button.tsx`.

**Overview:** Marketing home links to **Manage presets**.

---

## Share & Promote integration

- **`lib/marketing/build-share-promote-bundle.ts`** — `buildSharePromoteBundle(auctionId, auction, origin, preset | null)` builds link rows + copy via existing **`buildMarketingLinkKit`** / **`generateSellerShareCopy`**; preset applies optional **`utm_campaign`**, caption URL from selected **`source`**, and hashtag/keyword stripping.
- **`components/marketing/share-and-promote-panel.tsx`** — **Standard** bundle (no preset) + dropdown of saved presets; **Manage presets** link; highlights preferred caption variant for the active preset.
- **Carmunity** draft still uses the **non-preset** `linkKit` from `buildMarketingLinkKit(auction.id, origin)` only (unchanged).

---

## Ownership & security

All preset routes and actions: **`isMarketingEnabled()`** → `notFound()`; session user must own `handle`; mutations require preset `userId` match.

---

## PR 10 / Phase 10

**Implemented:** Ingestion hardening (dedupe/metadata/prune). See **`MARKETING_PHASE_10_NOTES.md`**.

## PR 11 (next best step)

Optional **`Post.auctionId`**, edge/WAF limits on `/api/marketing/track`, or **BID_CLICK** rollups — one slice per PR (see **`MARKETING_PHASE_10_NOTES.md`**).
