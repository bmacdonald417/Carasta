# Carasta — Marketing subsystem handoff index

**Purpose:** Single map of the **Marketing Management** subsystem for engineering, product, operations, and client delivery. For the historical implementation narrative and audit trail, start with **`MARKETING_IMPLEMENTATION_PLAN.md`**; for chronological delivery detail, use **`MARKETING_PHASE_*_NOTES.md`** (this index lists them all).

**Scope:** Seller tools, traffic ingest, analytics rollups, campaigns/presets, admin reporting/exports, digests, observability, and related runbooks. **Not** a substitute for reading Prisma **`schema.prisma`** or route handlers when changing behavior.

**Staging / production checklist:** **`MARKETING_DEPLOYMENT_CHECKLIST.md`** (Phase 34).

---

## 1. Subsystem overview

| Layer | Role |
|--------|------|
| **Seller UI** | Owner-only routes under **`/u/[handle]/marketing/*`** — Share & Promote, presets, campaigns, per-listing marketing, Carmunity promo helpers. |
| **Admin UI** | **`/admin/marketing`** (middleware: **`role === ADMIN`**). |
| **Public ingest** | **`POST /api/marketing/track`** — VIEW, SHARE_CLICK, BID_CLICK, EXTERNAL_REFERRAL (feature-flagged). |
| **Persistence** | **`TrafficEvent`**, **`AuctionAnalytics`** (VIEW/SHARE_CLICK rollups), **`Campaign`** / **`CampaignEvent`**, **`MarketingPreset`**. |
| **Ops** | CSV/JSON exports, snapshot API, prune/backfill scripts, weekly digest (cron + manual script). |

**Feature gate:** Server-side **`MARKETING_ENABLED=true`** (`lib/marketing/feature-flag.ts`). When disabled, seller surfaces and track ingest follow existing no-op/disable patterns documented in phase notes.

---

## 2. Seller surfaces (App Router)

| URL pattern | Typical file(s) |
|-------------|------------------|
| **`/u/[handle]/marketing`** | `app/(app)/u/[handle]/marketing/page.tsx` |
| **`/u/[handle]/marketing/auctions/[auctionId]`** | `.../marketing/auctions/[auctionId]/page.tsx` |
| **`/u/[handle]/marketing/campaigns`** | `.../marketing/campaigns/page.tsx` |
| **`/u/[handle]/marketing/campaigns/new`** | `.../marketing/campaigns/new/page.tsx` |
| **`/u/[handle]/marketing/campaigns/[campaignId]/edit`** | `.../marketing/campaigns/[campaignId]/edit/page.tsx` |
| **`/u/[handle]/marketing/presets`** | `.../marketing/presets/page.tsx` |
| **`/u/[handle]/marketing/presets/new`** | `.../marketing/presets/new/page.tsx` |
| **`/u/[handle]/marketing/presets/[presetId]/edit`** | `.../marketing/presets/[presetId]/edit/page.tsx` |

**Shared UI components:** `components/marketing/*` (e.g. `share-and-promote-panel`, `auction-view-tracker` on **public** auction detail, not under `/u/`).

**Public listing tracking:** `components/marketing/auction-view-tracker.tsx` on auction detail — VIEW + optional EXTERNAL_REFERRAL when URL has UTM or allowlisted click-id keys (`lib/marketing/track-external-referral-landing.ts`).

**Server actions:** `app/(app)/u/[handle]/marketing/campaigns/actions.ts`, `.../presets/actions.ts`, `.../auctions/carmunity-promo-actions.ts`.

---

## 3. Admin surfaces

| URL | File |
|-----|------|
| **`/admin/marketing`** | `app/(admin)/admin/marketing/page.tsx` |

Protected by app **`middleware.ts`** (ADMIN). Distinct from bearer-protected JSON observability routes (below).

---

## 4. API routes

| Method | Path | Role |
|--------|------|------|
| **POST** | **`/api/marketing/track`** | Public ingest; rate-limited; `lib/marketing/track-marketing-event-server.ts` |
| **GET** | **`/api/admin/marketing/snapshot`** | Admin marketing JSON snapshot; conditional **ETag** / **304** |
| **GET** | **`/api/admin/marketing/export/summary`** | Admin CSV (auth: admin export helper) |
| **GET** | **`/api/admin/marketing/export/tops-last-7`** | Admin CSV |
| **GET** | **`/api/admin/marketing-track-observability`** | In-memory track counters; ADMIN JWT **or** bearer secrets |
| **GET** | **`/api/admin/marketing-snapshot-observability`** | In-memory snapshot-route counters; same auth pattern |
| **GET** | **`/api/u/[handle]/marketing/export/campaigns`** | Seller CSV (ownership) |
| **GET** | **`/api/u/[handle]/marketing/export/auctions`** | Seller CSV |
| **GET** | **`/api/u/[handle]/marketing/export/auctions/[auctionId]`** | Seller CSV (single listing) |
| **GET** / **POST** | **`/api/jobs/marketing-digest`** | Cron/manual digest trigger; Bearer **`MARKETING_DIGEST_CRON_SECRET`** |

**Auth helpers:** `lib/marketing/admin-marketing-export-auth.ts`, `lib/marketing/marketing-export-auth.ts`.

---

## 5. Scripts & npm commands

| Script | Purpose |
|--------|---------|
| **`npm run marketing:backfill-analytics`** | `scripts/backfill-auction-analytics.ts` — rebuild **`AuctionAnalytics`** from **`TrafficEvent`** |
| **`npm run marketing:prune-traffic-events`** | `scripts/prune-traffic-events.ts` — delete old **`TrafficEvent`** (destructive; env gates) |
| **`npm run marketing:prune-traffic-events:dry-run`** | Count-only prune preview |
| **`npm run marketing:send-digest`** | `scripts/send-marketing-digest.ts` — manual digest (dry-run / force flags via env; see script) |

**Libraries used by jobs:** `lib/marketing/run-marketing-digest-send.ts`, `lib/marketing/generate-marketing-digest.ts`, `lib/email/send-marketing-digest-email.ts`.

---

## 6. Environment variables (marketing-related)

| Variable | Used for |
|----------|-----------|
| **`MARKETING_ENABLED`** | Master server flag (`true` enables subsystem per `feature-flag.ts`) |
| **`MARKETING_TRACK_OBSERVABILITY_SECRET`** | Bearer auth for admin track + **snapshot** observability JSON (min 16 chars when used) |
| **`MARKETING_TRACK_OBSERVABILITY_VERBOSE`** | Extra logging for track observability helper |
| **`ADMIN_MARKETING_SNAPSHOT_OBSERVABILITY_VERBOSE`** | Log every snapshot outcome line (200/304 included) |
| **`MARKETING_DIGEST_CRON_SECRET`** | Bearer auth for **`/api/jobs/marketing-digest`** |
| **`MARKETING_DIGEST_SEND_ENABLED`** | Allow real email sends from cron/script |
| **`MARKETING_DIGEST_FROM`** | From address for digest email |
| **`MARKETING_DIGEST_FORCE`** | Manual script override spacing (see `scripts/send-marketing-digest.ts`) |
| **`RESEND_API_KEY`** | Real digest email (Resend API — see `lib/email/send-marketing-digest-email.ts`) |
| **`TRAFFIC_EVENT_PRUNE_ENABLED`** | Required for destructive prune |
| **`TRAFFIC_EVENT_RETENTION_DAYS`** | Prune age (default per script) |
| **`TRAFFIC_EVENT_PRUNE_DRY_RUN`** | Prune script dry-run gate |

*`NEXTAUTH_SECRET` / session cookies apply to ADMIN UI and JWT checks on observability routes.*

---

## 7. Data models (Prisma)

| Model | Notes |
|-------|--------|
| **`TrafficEvent`** | `MarketingTrafficEventType`: VIEW, SHARE_CLICK, BID_CLICK, EXTERNAL_REFERRAL; `MarketingTrafficSource`; optional **`metadata` Json** |
| **`AuctionAnalytics`** | Daily rollups (**VIEW** / **SHARE_CLICK**); unique **`auctionId` + day** |
| **`Campaign`** | Seller campaigns; `MarketingCampaignStatus` |
| **`CampaignEvent`** | Campaign-scoped events / metadata |
| **`MarketingPreset`** | Saved UTM/copy presets for Share & Promote |
| **`User`** | `weeklyMarketingDigestOptIn`, `lastMarketingDigestSentAt` |

**Enums:** `MarketingTrafficEventType`, `MarketingTrafficSource`, `MarketingCampaignStatus` — see **`prisma/schema.prisma`**.

---

## 8. Exports (download surfaces)

| Consumer | Mechanism |
|----------|-----------|
| **Seller** | API routes under **`/api/u/[handle]/marketing/export/*`**; helpers in **`lib/marketing/export-seller-*.ts`** |
| **Admin** | **`/api/admin/marketing/export/*`**, platform summary CSV helpers |
| **Machine-readable admin** | **`GET /api/admin/marketing/snapshot`** — JSON; **`lib/marketing/admin-marketing-snapshot-json.ts`**, **`get-admin-marketing-platform-summary.ts`** |

---

## 9. Observability (ops)

| Endpoint / artifact | Content |
|---------------------|---------|
| **`GET /api/admin/marketing-track-observability`** | Track ingest counters + breakdowns (`lib/marketing/marketing-track-observability.ts`) |
| **`GET /api/admin/marketing-snapshot-observability`** | Snapshot HTTP outcome counters (`lib/marketing/admin-marketing-snapshot-observability.ts`) |
| Structured logs | `[admin-marketing-snapshot]` and marketing-track log lines per phase notes |

All counter snapshots are **per Node process** unless aggregated externally.

---

## 10. Runbooks & cross-cutting docs

| Document | Topics |
|----------|--------|
| **`MARKETING_IMPLEMENTATION_PLAN.md`** | Architecture audit, phased delivery narrative, blockers |
| **`MARKETING_DEPLOYMENT_CHECKLIST.md`** | Deploy prerequisites, env, migrations, cron, smokes, rollback |
| **`MARKETING_EXTERNAL_REFERRAL_LANDING_RUNBOOK.md`** | EXTERNAL_REFERRAL semantics, UTM + click-ids, QA |
| **`MARKETING_TRACK_EDGE_WAF_RUNBOOK.md`** | Track route limits, edge/WAF |
| **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`** | Retention, prune, privacy baseline for **`TrafficEvent`** |

---

## 11. Phase notes (1–33)

Each root-level **`MARKETING_PHASE_<N>_NOTES.md`** (for **N** from **1** through **34**) captures scoped decisions and PR boundaries. Read with **`MARKETING_IMPLEMENTATION_PLAN.md`** §12 (*Marketing phases*). **Phase 33** introduces this handoff index; **Phase 34** adds **`MARKETING_DEPLOYMENT_CHECKLIST.md`**.

---

## 12. Deployment / ops workflow (summary)

Use **`MARKETING_DEPLOYMENT_CHECKLIST.md`** for step-by-step staging/production work. Short version:

1. Set **`MARKETING_ENABLED`** per environment policy.
2. Configure digest: **`MARKETING_DIGEST_*`** + secure cron calling **`/api/jobs/marketing-digest`** with Bearer secret; optional manual **`npm run marketing:send-digest`**.
3. Optional: **`MARKETING_TRACK_OBSERVABILITY_SECRET`** for automated polling of observability JSON.
4. Schedule or run **`marketing:prune-traffic-events`** per **`TRAFFICEVENT_RETENTION_PRIVACY_RUNBOOK.md`**.
5. After major backfills or pruning policy changes, consider **`marketing:backfill-analytics`** so rollups match policy.

---

## 13. Known limitations (high level)

From **`MARKETING_IMPLEMENTATION_PLAN.md`** §13 and runbooks: no separate “manager” role (seller = owner checks); watchlist not modeled; scale depends on app-layer limits + prune; legal/privacy review is jurisdiction-specific; EXTERNAL_REFERRAL click-id list is intentionally conservative; observability counters are not multi-instance aggregated by default.

---

## 14. Suggested roadmap (post-handoff)

- **Product-led:** New attribution keys only with legal sign-off + runbook updates (same pattern as **`twclid`**).
- **Ops:** **`MARKETING_DEPLOYMENT_CHECKLIST.md`** (Phase 34) — use for new environments; optional synthetic cron health checks (**PR 35** suggestion in plan).
- **Analytics:** Deeper dashboards or external BI are out of scope for this index; **`/api/admin/marketing/snapshot`** is the stable machine-readable aggregate.

---

*Last aligned to Marketing Phase 34. For changes to routes or models, update this file in the same PR as the code.*
