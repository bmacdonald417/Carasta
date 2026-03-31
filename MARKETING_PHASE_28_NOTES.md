# Marketing Phase 28 — ETag / If-None-Match for admin marketing snapshot

**Date:** 2026-03-30  
**Scope:** **`GET /api/admin/marketing/snapshot`** efficiency for pollers. **No** schema change, **no** seller UI.

---

## Behavior

| Step | Result |
|------|--------|
| Not **ADMIN** | **401** `{ "ok": false }` — unchanged (auth before any work). |
| **ADMIN**, no **`If-None-Match`**, or no match | **200** + full JSON + **`ETag`** + **`Cache-Control: private, max-age=15`**. |
| **ADMIN**, **`If-None-Match`** matches current **`ETag`** | **304** empty body + **`ETag`** + same **`Cache-Control`**. |

---

## ETag algorithm

1. Build snapshot with **`buildAdminMarketingSnapshotJson`** (includes **`generatedAt`**).
2. **`JSON.stringify`** of all fields **except `generatedAt`** — stable metric fingerprint.
3. **SHA-256** of UTF-8 bytes, **base64url**, wrapped in quotes → strong **`ETag`**.

Omitting **`generatedAt`** from the hash allows **304** when underlying aggregates are unchanged across requests; each **200** still returns a fresh **`generatedAt`**.

---

## Files

| Role | Path |
|------|------|
| ETag helpers | **`lib/marketing/admin-marketing-snapshot-etag.ts`** |
| Route | **`app/api/admin/marketing/snapshot/route.ts`** |

---

## PR 29

Implemented as **Phase 29** — **`MARKETING_PHASE_29_NOTES.md`**.

## PR 30

Implemented — **`MARKETING_PHASE_30_NOTES.md`**.

## PR 31

Implemented — **`MARKETING_PHASE_31_NOTES.md`**.

## PR 32

Implemented — **`MARKETING_PHASE_32_NOTES.md`**.

## PR Phase 33 (implemented)

**`MARKETING_HANDOFF_INDEX.md`** — **`MARKETING_PHASE_33_NOTES.md`**.

## PR 34 (suggested next step)

Deployment checklist or defer; see plan §12zh.
