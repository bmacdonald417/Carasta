# Marketing — Phase 4 (Share & Promote) notes

## Where it lives

- Seller-only: **`/u/[handle]/marketing/auctions/[auctionId]`** (same guards as Phase 3: `MARKETING_ENABLED`, owner handle, auction belongs to seller).
- Section title: **Share & Promote** (below KPI cards, above traffic analytics).

## Link kit

| Row            | `utm_source` | `utm_medium` |
|----------------|--------------|--------------|
| Public listing | *(none)*     | —            |
| Instagram      | `instagram`  | `social`     |
| Facebook       | `facebook`   | `social`     |
| LinkedIn       | `linkedin`   | `social`     |
| Email          | `email`      | `email`      |
| Carmunity      | `carmunity`  | `community`  |

All tracked variants also set `utm_campaign=listing_{auctionId}`.

These values align with **`lib/marketing/resolve-marketing-source.ts`** UTM parsing (`instagram`, `facebook`, `email`, `carmunity`; `linkedin` is not yet mapped to a enum bucket and may appear as **Unknown** in source breakdown).

## Site base URL

Server uses **`getPublicSiteOrigin()`**:

1. `NEXT_PUBLIC_SITE_URL`  
2. else `NEXTAUTH_URL`  
3. else `https://{VERCEL_URL}`  
4. else `http://localhost:3000`

## Copy generation

- **Deterministic** strings from listing fields + link kit (no AI, no DB).
- **High bid** appears in copy only when `status === "LIVE"` and `highBidCents > 0`.
- **Mileage** line only when `mileage != null`.
- Captions: short, long, ending soon; email subject + body; hashtags + keywords lines.

Nothing is **persisted**; refresh regenerates copy.

## UX

- Copy buttons use **`useToast`** (“Copied” / error).
- Client components: `ShareAndPromotePanel`, link rows, text blocks, `MarketingCopyButton`.

## PR 5 ideas

- Saved campaigns / custom `utm_campaign`
- Rollups & retention
- Rate limiting on `/api/marketing/track`
- LinkedIn (and other) source enum mapping if product wants cleaner breakdowns
- One-tap “draft community post” (no auto-post)
