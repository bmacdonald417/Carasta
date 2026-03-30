# Marketing — Phase 3 (seller metrics + drill-down) notes

## Routes

| Route | Access |
|-------|--------|
| `/u/[handle]/marketing` | Owner only + `MARKETING_ENABLED=true` |
| `/u/[handle]/marketing/auctions/[auctionId]` | Same + auction must belong to that user |

Non-owners and wrong `auctionId` → **404** (`notFound()`). No data from other sellers is returned.

## Overview metrics (seller-wide)

- Total listings, live auctions, all `TrafficEvent` rows count, active campaigns  
- **Total views** (`VIEW`) and **share clicks** (`SHARE_CLICK`) across the seller’s auctions  

## Per listing card (overview)

- Views count, share clicks, **last activity** timestamp (max `TrafficEvent.createdAt` for that auction)  
- Links: **View listing** (public), **View marketing** (drill-down)

Up to **100** most recently created listings.

## Drill-down metrics (single auction)

- Total views, total share clicks  
- Views in last **24h** and **7d** (VIEW only)  
- **Last activity** timestamp  
- **Source breakdown** — all `MarketingTrafficSource` enum values (zero-filled when no rows)  
- **Event type breakdown** — all `MarketingTrafficEventType` enum values  
- **Share actions** — counts by `metadata.shareTarget` from up to **3,000** recent share events (see limitations)  
- **Recent activity** table — last **50** events: time, type, source, share target  

Empty states when there are no `TrafficEvent` rows.

## Limitations

- All numbers are derived from **`TrafficEvent`** at read time (no rollup tables). Large histories may slow pages; consider PR4 rollups.  
- Share-target totals are approximate if an auction has more than **3,000** share events stored.  
- **BID_CLICK** / **EXTERNAL_REFERRAL** appear in type breakdown if present in DB; Phase 2 instrumentation does not emit them yet.

## PR 4 suggestions

- Campaign management and UTM link helpers  
- Nightly or incremental **AuctionAnalytics** (daily buckets)  
- API rate limits and row retention for `TrafficEvent`  
- Optional **BID_CLICK** UI-only tracking  
