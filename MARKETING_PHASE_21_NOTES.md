# Marketing Phase 21 — Seller marketing UX polish

**Date:** 2026-03-30  
**Scope:** Visual and copy refinement for **seller-only** marketing surfaces. **No** API, export, tracking, digest, permission, or schema changes.

---

## Pages touched

| Area | Changes |
|------|---------|
| **Marketing overview** | KPIs split into **Inventory** (3) and **Tracked engagement** (4); alerts/presets spacing; **Share &amp; Promote** presets strip title; **Manage Presets** / **Manage Campaigns** / **Export CSV** labeling; campaign & listing empty states with icons; **Open marketing** on cards/table; **Profile** back link; section borders (`border-t`) between major blocks. |
| **Auction marketing drill-down** | Title block + grouped actions (**Export CSV**, **View public listing**); KPI sections **Totals** / **Recent windows** / **Activity**; **Traffic sources** / **Event types**; campaigns + recent-activity copy; **Manage Campaigns** footer link; table header tint on recent activity. |
| **Campaigns index** | **← Back to Marketing**, shorter intro. |
| **Presets index** | **← Back to Marketing**, title **Presets**, Share &amp; Promote callout in subtitle. |

## Components touched

- **`MarketingAlertsPanel`** — title **Marketing Alerts**, shorter descriptions, auction suffix **· this listing**.
- **`ShareAndPromotePanel`** — preset CTA always **Manage Presets**.
- **`AuctionLinkedPromoPostsSection`** — title **Carmunity posts (linked)**, dashed empty state.
- **`CarmunityPromoPanel`** — tighter hero copy.

## UX decisions

- **Title Case** for primary actions: **Manage Presets**, **Manage Campaigns**, **Export CSV** (with `title=` tooltips where the file shape isn’t obvious).
- **Sentence case** for many KPI labels (e.g. **Total listings**) for calmer scanning.
- **Open marketing** replaces **View marketing** / plain **Marketing** where it navigates to the listing drill-down.

## PR 22

Implemented as **Phase 22** — admin-only marketing summary at **`/admin/marketing`**. See **`MARKETING_PHASE_22_NOTES.md`**.

## PR 23 (suggested next step)

Optional **time-windowed** platform aggregates, admin **CSV** snapshot, or **read-only** funnel breakdowns — **one PR**; still avoid core auction/bid/buy-now/community mutations unless explicitly scoped.
