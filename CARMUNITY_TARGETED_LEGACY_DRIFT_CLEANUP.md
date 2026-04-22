# Carmunity — Targeted legacy color / panel / CTA drift cleanup

Surgical pass after the broader visual-consistency rollout. Scope: remove incorrect **hot-pink / performance-red primary CTAs**, **legacy dark glass slabs** on seller campaign surfaces, **How It Works** timeline pink, and align **contact submit** with the shared primary button system—without reopening design direction or redesigning entire pages.

## 1. Files created

- `CARMUNITY_TARGETED_LEGACY_DRIFT_CLEANUP.md` (this file)

## 2. Files modified

| Area | File |
|------|------|
| Contact | `app/(marketing)/contact/ContactForm.tsx` |
| How It Works | `app/(marketing)/how-it-works/page.tsx`, `components/how-it-works/HowItWorksTimeline.tsx`, `components/how-it-works/HowItWorksStep.tsx` |
| Seller campaigns | `app/(app)/u/[handle]/marketing/campaigns/page.tsx`, `app/(app)/u/[handle]/marketing/campaigns/new/page.tsx`, `app/(app)/u/[handle]/marketing/campaigns/[campaignId]/edit/page.tsx` |
| Shared marketing | `components/marketing/campaign-form.tsx`, `components/marketing/campaign-delete-button.tsx`, `components/marketing/carmunity-post-preview.tsx` |
| Public misc | `app/(marketing)/merch/page.tsx` |

## 3. Legacy CTA issues fixed

- **Contact** — Submit used `Button` `variant="performance"` (performance red). Now **`variant="default"`** (blue-violet primary).
- **Campaigns list** — “New campaign” used inline **`#ff3b5c`**. Now **`Button variant="default"`** + `Link`.
- **Campaign form** — Save/Create used inline **`#ff3b5c`**. Now **`variant="default"`**.
- **Merch** — “Back to Showroom” used **`#ff3b5c`**. Now **primary** link classes aligned with tokenized marketing CTAs.
- **Campaign delete** — Replaced arbitrary **`hover:text-red-400`** on ghost with **tokenized destructive outline** (`border-destructive/*`, `text-destructive`, `hover:bg-destructive/10`); full red pill only when **`variant="destructive"`** is passed.

## 4. Legacy panel / material issues fixed

- **How It Works timeline** — Vertical line no longer uses **`#ff3b5c`** gradient; uses **`primary`** opacity gradient.
- **How It Works steps** — Replaced dark glass cards (`bg-black/40`, pink borders/icons) with **`bg-card`**, **`border-border`**, **`shadow-e1`**, **`text-muted-foreground`**, primary-accent dot ring.
- **How It Works page** — One remaining **`neutral-*` / white** panel aligned to **`bg-card`** / **`shadow-e1`**; pillar labels use **`text-foreground`**.
- **Campaigns empty state + table** — Replaced **`border-white/*`**, **`bg-white/[0.03]`** table chrome with **`border-border`**, **`bg-card`**, **`bg-muted/*`** header row, **`divide-border`**.
- **Campaign new/edit** — Form shell **`border-border bg-card shadow-e1`** instead of translucent white-on-dark slab.
- **`CampaignForm`** — Empty state and inputs/selects use **design-system defaults** (removed hard-coded **`#121218`** select menus and dark input overrides).
- **`CarmunityPostPreview`** — Card **`border-border bg-card`**; avatar fallback **`primary`** tint instead of pink wash.
- **Merch** — Panel **`border-border bg-card shadow-e1`**.

## 5. Shared component fixes

- **`HowItWorksStep` / `HowItWorksTimeline`** — Shared timeline visuals now use **semantic primary + card** surfaces (fixes all consumers of the timeline).
- **`CampaignForm`** — Single form used by create/edit; submit and fields normalized once.
- **`CampaignDeleteButton`** — Centralized destructive-adjacent styling for table + edit contexts.
- **`CarmunityPostPreview`** — Any listing/marketing preview using this card inherits the update.

## 6. What was intentionally deferred

- Other files still containing **`#ff3b5c`** in non–focus areas (e.g. `InstagramShowcase`, map/sell AI helpers, damage gallery, settings) — not in the **campaigns / contact / how-it-works / merch** focus set for this pass.
- No dedicated **admin feedback dashboard** route was found in-repo under a clear `app/.../feedback` path; if it lives elsewhere or is unmerged, it was not modified.
- **`performance` Button variant** remains in `components/ui/button.tsx` for true auction/urgency surfaces; only **misused primary actions** were migrated.

## 7. Recommendation for the next phase

- Run a **narrow grep pass** for `#ff3b5c`, `performance-red`, and `variant="performance"` on **remaining** seller/sell/explore components, converting only where the action is **not** time-sensitive auction signal.
- If an **admin feedback** route exists in another branch or path, apply the same **card + primary + destructive-only** rules there in one small PR.

## Validation

- `npm run lint`
- `npx tsc --noEmit`

Sanity: `/contact`, `/how-it-works`, `/u/[handle]/marketing/campaigns`, campaign new/edit, `/merch`.
