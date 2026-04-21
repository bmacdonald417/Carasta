# Carmunity Phase 1G — Public Auction Browse + Listing Card Vertical Slice

Bounded design-system normalization for **public** auction discovery (marketing auctions index, filters, listing cards, and touched public listing-detail chrome). No bidding rules, backend search logic, or seller-workspace scope.

---

## 1. Files created

- `CARMUNITY_PHASE_1G_AUCTIONS_VERTICAL_SLICE.md` (this document)

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(marketing)/auctions/page.tsx` | Browse hierarchy (header + intro copy), map loading + sparse map states, empty grid state, pagination controls |
| `app/(marketing)/auctions/auction-card.tsx` | Listing card materials, `Badge` for live / ending soon / ended / condition, calmer typography and motion, focus ring on card link |
| `app/(marketing)/auctions/auction-filters.tsx` | Filter bar surface (`shadow-e1`, solid card), grid/map toggle, active filter pills (primary tokens + focus), sort pill label coverage |
| `app/(marketing)/auctions/[id]/page.tsx` | Detail chrome: hero thumbs, title block, description tone, buyer protections + seller panels, bid history rows + empty state |
| `app/(marketing)/auctions/[id]/auction-detail-client.tsx` | Bid panel card material, high bid + countdown typography, no-reserve success treatment, primary CTAs instead of performance red |
| `app/(marketing)/auctions/[id]/message-seller-button.tsx` | Error text uses `destructive` token |
| `app/(marketing)/auctions/error.tsx` | Calmer typography; `Button` outline for retry |
| `app/globals.css` | `.reserve-meter` gradient: removed amber/yellow bridge; primary → emerald |

---

## 3. Biggest auctions / index / card improvements

- **Browse hierarchy**: Title and supporting copy are calmer and sentence-case where appropriate; header separated with `border-b` for clearer page rhythm.
- **Listing cards**: Opaque `Card` + `shadow-e1` / hover `shadow-e2`, muted image well, removed heavy glass/blur on body, reduced hover scale for a more premium, restrained feel.
- **Status chips**: `Badge` + semantic roles — primary for **Live**, caution-soft for **Ending soon** (replaces neon yellow), secondary/outline for ended and condition.
- **High bid on cards**: Foreground + tabular nums instead of loud signal red on every tile (money reads as listing fact, not alarm).
- **Empty / sparse states**: Dashed bordered panel for zero results; friendlier map “no coordinates” panel; bid history empty state copy.

---

## 4. Trust / status cue improvements

- Ended/sold overlay: translucent `background` scrim + `Badge` instead of heavy black + display uppercase slab.
- Buyer protections: bullets use **primary** (informational trust), links use primary + focus ring — removed decorative hex red bullets/links.
- Bid history amounts: **foreground** emphasis (credible ledger tone) instead of performance red on every row.
- Detail bid sidebar: high bid headline no longer uses display + red; countdown inherits calmer default classes; **No reserve** uses **success** soft surface.

---

## 5. Shared primitives / patterns extended

- **`Badge`** (`components/ui/badge`) used on auction cards for live, time pressure, condition, and non-live status — demonstrates reuse without new component families.
- **`shadow-e1` / `shadow-e2`** elevation tokens applied consistently on browse chrome, cards, and side panels.
- **`.reserve-meter`** (global utility used by `ReserveMeter`) updated so the progress fill no longer runs through amber/yellow; aligns reserve visualization with “no copper/yellow in functional chrome.”

---

## 6. App / site parity notes

- Vocabulary kept stable: “auctions,” “listings,” “filters,” “high bid,” “reserve,” “seller.”
- No new query params or routes; server components and search contract unchanged.
- Flutter / app parity remains **semantic-role alignment** later (accent/info/success/caution/danger + surfaces), not pixel parity.

---

## 7. Intentionally deferred

- **AuctionsMapView** map chrome, markers, and popups (only parent loading/empty copy touched on the index page).
- **`CountdownTimer`** urgency ramp (still uses `signal` for elevated urgency — acceptable time-sensitive semantics; not redesigned this phase).
- **ReserveMeter** layout/labels beyond the shared gradient token.
- **ShareButtons**, **AuctionConditionReport**, **AuctionDiscussPanel**, and other deep listing modules — not comprehensively redesigned to avoid scope creep.
- **Bidding / buy-now / auto-bid behavior** — unchanged.

---

## 8. Recommendation for the next implementation phase

**Phase 1H (suggested): Marketing homepage + high-traffic static marketing surfaces** — apply the same tokenized panels, typography discipline, and focus treatment to `CarastaLayout`-wrapped homepage and adjacent landings, completing the “public discovery” story after auctions.

Alternatively, begin **Phase 2A — Interaction polish**: standardized skeleton/loading for marketing grids and cards (including auction browse) once more vertical slices are token-aligned.

---

## 9. Validation

| Check | Result |
|-------|--------|
| `npm run lint` | Pass (existing unrelated warnings: `no-img-element` in map/layout/instagram) |
| `npx tsc --noEmit` | Pass |

Manual sanity: auctions index grid, filters bar, empty state, pagination links, auction card hover/focus, and public listing detail hero + sidebar + bid history should render without import or route regressions.
