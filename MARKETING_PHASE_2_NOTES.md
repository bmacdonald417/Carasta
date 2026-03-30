# Marketing — Phase 2 (passive ingestion) notes

## API

- **Route:** `POST /api/marketing/track`
- **Flag off:** `204 No Content` (no DB work).
- **Body (JSON):** `auctionId`, `eventType` (`VIEW` | `SHARE_CLICK` | `BID_CLICK`), optional `source` (`MarketingTrafficSource` enum), optional `visitorKey` (≥8 chars), optional `metadata` (string values only after sanitization; **BID_CLICK** may include `bidUiSurface`, `path`, `currentUrl`).

## Event types (this PR)

| `eventType`    | When emitted |
|----------------|--------------|
| `VIEW`         | Auction detail client mount (`AuctionViewTracker`), once per mount (server dedupes). |
| `SHARE_CLICK`  | User picks X, Facebook, LinkedIn, or Copy link in `ShareButtons` (auction context only). |

**Not implemented:** BID_CLICK, conversions, campaigns, notifications.

## Dedupe / anti-spam (server)

- **VIEW:** No second row within **60s** for the same `auctionId` and authenticated `userId`, **or** the same `auctionId` and `visitorKey` (stored in JSON metadata) when anonymous.
- **SHARE_CLICK:** No second row within **5s** for the same `auctionId`, `userId`, and `metadata.shareTarget` (or anonymous + `visitorKey` match).
- **BID_CLICK:** No second row within **12s** for the same `auctionId`, `metadata.bidUiSurface`, and `userId` (or anonymous + `visitorKey` match).

No IP throttling; high-traffic deployments should add edge rate limits in a later PR.

## Client behavior

- **`sendMarketingTrack`:** `navigator.sendBeacon` with JSON `Blob` when possible; else `fetch(..., { keepalive: true })`. Errors are swallowed.
- **Visitor key:** `sessionStorage` key `carasta_mk_v1` for stable anonymous correlation.

## Feature flag

- Same as Phase 1: `MARKETING_ENABLED=true` enables API writes and client instrumentation on the auction detail page.

## PR 3 (done)

See **`MARKETING_PHASE_3_NOTES.md`** — overview metrics + `/u/[handle]/marketing/auctions/[auctionId]`.

## PR 4 suggestions

- Campaigns, rollups / retention, rate limits, optional **BID_CLICK** (client-only).
