# Carmunity Phase 1H — Seller / Admin Funnel Alignment

Bounded visual and interaction alignment for the **seller → marketing** and **admin → admin marketing** clusters. No new seller/admin features, bidding changes, or backend workflow expansion.

---

## 1. Files created

- `CARMUNITY_PHASE_1H_SELLER_ADMIN_ALIGNMENT.md` (this document)

---

## 2. Files modified

| Area | File |
|------|------|
| Sell | `app/(app)/sell/page.tsx` |
| Sell | `app/(app)/sell/create-auction-wizard.tsx` |
| Seller marketing overview | `app/(app)/u/[handle]/marketing/page.tsx` |
| Seller per-listing marketing | `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` |
| Shared seller primitives | `components/marketing/seller-workspace-primitives.tsx` |
| Seller alerts (shared) | `components/marketing/marketing-alerts-panel.tsx` |
| Admin shell | `app/(admin)/admin/layout.tsx` |
| Admin dashboard | `app/(admin)/admin/page.tsx` |
| Admin marketing | `app/(admin)/admin/marketing/page.tsx` |

---

## 3. Biggest Sell improvements

- **Guided intro**: Header uses tokenized `Card`-like surface (`border-border`, `bg-card`, `shadow-e1`), clearer hierarchy, and calmer copy (including an inline note for Marketing / env flag).
- **Wizard**: Replaced dark glass slab (`bg-black/40`, `backdrop-blur`, red progress) with **light `bg-card`**, **`border-border`**, **`shadow-e1`**, **primary** step rail, and explicit **Step x of y** guidance.
- **Sub-forms**: Imperfection and damage rows use **`border-border` + `muted`** instead of translucent white-on-dark.
- **Publish CTA**: Final action uses **`variant="default"`** (blue-violet system primary) instead of performance red.

---

## 4. Biggest seller marketing alignment improvements

- **Primitives** (`seller-workspace-primitives`): Neutral tone no longer hardcodes **slate**; panels and KPI/insight cards use **`bg-card`**, **`border-border`**, **`shadow-e1`**, calmer **section titles** (no `font-display`). Insight CTAs use **primary + focus ring** for parity with the rest of the app.
- **Overview + listing hero**: Replaced heavy custom shadows with **`shadow-e1`**, **`border-border`**, subtle **`to-info-soft`** gradient for a family look without a separate “sub-brand.”
- **Tables / empty states / listing grid**: **Slate** icon wells → **`muted`**, dashed empties → **`border-border` + `muted/30`**, listing tiles → **card + hover primary border** (no lift gimmick).
- **Alerts panel**: Caution banner uses **global caution tokens**; list uses **card + divide-border**; links hover to **primary**.

---

## 5. Biggest admin / admin-marketing improvements

- **Admin layout**: Removed **`#0a0a0f`** canvas, glass header, and **neon red** title; admin now sits on **`bg-background`** with a **`bg-card`** header band and **muted** subtitle — same language as product surfaces.
- **Admin dashboard**: Stat cards, moderation/marketing entry tiles, and live table use **`border-border`**, **`bg-card`**, **`shadow-e1`**, **semantic icon chips** (primary / success / info), and **primary links** (no `#ff3b5c` / `#CCFF00`).
- **Admin marketing**: Full pass from “dark console” to **light-first tooling** — `WindowStatsPanel`, KPI grid, all tables, and footnote use **foreground / muted-foreground / border / card**. Feature-off callout uses **caution** tokens (not amber-on-dark). Calendar section icon uses **primary**, not lime.

---

## 6. Shared primitives / patterns extended

- **`shadow-e1` / `shadow-e2`**, **`border-border`**, **`bg-card`**, **`text-primary`** with **focus-visible rings** — applied consistently across Sell, seller marketing, and admin.
- **Seller workspace primitives** now lean on **global card/border/muted** for chrome while keeping **seller semantic tokens** for info/success/caution/urgency accents (still in-family with `:root` seller vars).

---

## 7. App / site parity notes

- Seller/admin **vocabulary unchanged** (Marketing, workspace, presets, exports).
- No new routes or API contracts.
- Mobile/app can later map the same **roles** (primary, caution, success, card, border) without matching exact radii.

---

## 8. Intentionally deferred

- **`seller-marketing-workspace.tsx`** and other deep marketing modules (share panel, copilot innards) — only inherited primitive/section changes where composed from updated components.
- **`app/(admin)/admin/moderation/**` and **`admin/reputation/**`** — not in this slice beyond the main dashboard link.
- **Campaigns / presets sub-routes** — not individually audited.
- **Dark-mode polish** for admin — layout is tokenized; secondary dark tuning can follow a global pass.

---

## 9. Recommendation for the next implementation phase

**Phase 1I (suggested):** Normalize **marketing homepage + key static marketing pages** under the same shell/card rhythm (completes public + logged-in story after auctions and seller/admin).

**Smaller alternative:** **Admin moderation + reputation tool pages** — apply the same admin layout tokens to remaining admin routes for zero “legacy island” pages.

---

## 10. Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (existing unrelated `no-img-element` warnings) |
| `npx tsc --noEmit` | Pass |

Sanity: `/sell`, `/u/:handle/marketing`, `/u/:handle/marketing/auctions/:id`, `/admin`, `/admin/marketing` should render on **light** `background` with coherent cards and primary links.
