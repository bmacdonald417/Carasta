# Carmunity Phase 1I-bis — Admin Legacy Cleanup + Seller/Admin Substrate Polish

Finishes **remaining admin sub-route** visual debt and removes **decorative substrate** (seller grid / heavy canvas) that competed with operational panels. No new admin features, moderation/reputation logic changes, or seller workflow expansion.

---

## 1. Files created

- `CARMUNITY_PHASE_1I_BIS_ADMIN_CLEANUP.md` (this document)

---

## 2. Files modified

| Area | File |
|------|------|
| Seller workspace shell | `components/marketing/seller-workspace-primitives.tsx` |
| Global seller utilities | `app/globals.css` |
| Admin moderation page | `app/(admin)/admin/moderation/discussions/page.tsx` |
| Admin moderation UI | `components/discussions/AdminDiscussionModerationClient.tsx` |
| Admin reputation page | `app/(admin)/admin/reputation/[handle]/page.tsx` |
| Seller marketing (substrate context) | `app/(app)/u/[handle]/marketing/page.tsx` |
| Seller listing marketing (substrate context) | `app/(app)/u/[handle]/marketing/auctions/[auctionId]/page.tsx` |

---

## 3. Biggest admin moderation / reputation improvements

- **Discussion moderation** (`AdminDiscussionModerationClient`): Replaced dark glass table (`border-white/10`, `bg-black/30`, `neutral-*`) with **`border-border`**, **`bg-card`**, **`shadow-e1`**, **`muted/50`** header band, **hover row** tint, tokenized **select/textarea** on `bg-background`, and **caution-soft** review-mode banner (replacing amber-on-implied-dark).
- **Moderation page chrome**: Calmer **sentence-case** title, **`border-b`** page rhythm, **primary** back link with focus ring.
- **Reputation debug**: Summary uses **card + metric tiles** (`border-border`, `muted/30`); events table matches **admin marketing** operational pattern; points use **`text-success` / `text-destructive`** instead of raw emerald/red utilities.

---

## 4. Biggest seller / admin substrate cleanup improvements

- **`SellerWorkspaceShell`**: No longer wraps content in **`seller-grid`**; outer surface is **`min-h-full bg-background text-foreground`** so marketing workspaces sit on the **same canvas as the app**, not a separate gradient+grid “product skin.”
- **`app/globals.css`**: **`.seller-workspace-shell`** maps to **`hsl(var(--background))`**; **`.seller-grid`** grid lines **removed** (`background-image: none`) for backwards compatibility if the class appears elsewhere.
- **Marketing heroes**: Slightly **reduced** info-soft gradient stop (**`/35` → `/20`**) so hero panels read as **foreground content**, not ambient wallpaper.

---

## 5. Shared primitives / patterns extended

- Reuse of **card / border / muted / primary / caution-soft / destructive** language already established in Phase 1H admin — applied to **moderation** and **reputation** for one operational toolkit.
- **Focus-visible rings** on primary navigation links in moderation/reputation where touched.

---

## 6. App / site parity notes

- Routes, APIs, and data unchanged.
- Admin copy and labels stable.
- Mobile can inherit the same rule: **operational surfaces = background + card**, no decorative grid.

---

## 7. Intentionally deferred

- **Other admin routes** (if added later) — not present beyond moderation + reputation in this repo slice.
- **Seller marketing inner modules** (copilot, share panel internals) — no change beyond shell + hero tint.
- **Dark mode** fine-tuning for moderation selects — uses semantic tokens; dedicated dark QA can follow.

---

## 8. Recommendation for the next implementation phase

**Phase 1I — Marketing homepage + high-traffic static marketing pages** (public shell parity), or **Phase 2A — Loading/skeleton system** for grids and admin tables once more surfaces are stable.

---

## 9. Validation

Run `npm run lint` and `npx tsc --noEmit` after implementation; sanity-check `/admin/moderation/discussions`, `/admin/reputation/:handle`, and seller marketing overview + per-listing pages for layout and contrast.
