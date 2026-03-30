# Marketing Phase 5 — Campaign management (CRUD)

**Date:** 2026-03-30  
**Scope:** Seller-only, manual **Campaign** create/read/update/delete. No automation, no messaging delivery, no attribution beyond what phases 1–4 already provide.

---

## What shipped

### Data model

- **No Prisma schema change.** Uses existing `Campaign` model and `MarketingCampaignStatus` enum (`DRAFT`, `ACTIVE`, `PAUSED`, `ENDED`).
- UI surfaces `ENDED` as **Completed** where user-facing.
- Campaign `type` is stored as `String` in DB; validated as one of: **`social`**, **`email`**, **`featured`**, **`community`**.

### Server / lib

| Area | Files |
|------|--------|
| Validation | `lib/validations/campaign.ts`, export in `lib/validations/index.ts` |
| Reads | `lib/marketing/get-seller-campaigns.ts` — recent list, full list, by auction, single for edit, seller auction options for selects |
| Mutations | `app/(app)/u/[handle]/marketing/campaigns/actions.ts` — create, update, delete; **MARKETING_ENABLED** + session + handle owner + auction/campaign ownership |

### UI

| Area | Files |
|------|--------|
| Components | `components/marketing/campaign-status-badge.tsx`, `campaign-type-label.tsx`, `campaign-form.tsx`, `campaign-delete-button.tsx` |
| Routes | `marketing/campaigns/page.tsx`, `new/page.tsx`, `[campaignId]/edit/page.tsx` |
| Surfaces | `marketing/page.tsx` — recent campaigns + Manage link; `marketing/auctions/[auctionId]/page.tsx` — campaigns for listing + New campaign |

---

## Ownership & security

All campaign pages and actions:

1. `MARKETING_ENABLED` must be true (else `notFound()` or safe rejection).
2. Session user must own `/u/[handle]` (same pattern as other seller marketing routes).
3. **Create/update:** `auctionId` must refer to a listing where **seller user id** matches campaign owner path.
4. **Update/delete:** `campaignId` must exist, `campaign.userId` must equal session seller, and campaign’s auction must still belong to that seller.

Failures use `notFound()` on pages; actions return `{ ok: false, error: string }`.

---

## Known limitations (by design)

- Campaigns are **organizational** only: no job runner, no email/social send, no rollups.
- No `notes` field (schema left unchanged).
- No **COMPLETED** enum — **`ENDED`** used and labeled **Completed** in UI.
- Delete is **hard delete** (Prisma `delete`), consistent with lightweight CRUD; no soft archive unless added later.

---

## Next best step (PR 7)

Phase 6 shipped rollups + retention groundwork; see `MARKETING_PHASE_6_NOTES.md`. PR 7 candidates: saved **UTM presets**, **BID_CLICK**, Carmunity draft promote, or stronger throttles/sampling — one slice per PR.
