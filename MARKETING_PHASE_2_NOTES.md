# Marketing — Phase 2 (passive ingestion) notes

## API

- **Route:** `POST /api/marketing/track`
- **Flag off:** `204 No Content` (no DB work).
- **Body (JSON):** `auctionId`, `eventType` (`VIEW` | `SHARE_CLICK`), optional `source` (`MarketingTrafficSource` enum), optional `visitorKey` (≥8 chars), optional `metadata` (string values only after sanitization).

## Event types (this PR)

| `eventType`    | When emitted |
|----------------|--------------|
| `VIEW`         | Auction detail client mount (`AuctionViewTracker`), once per mount (server dedupes). |
| `SHARE_CLICK`  | User picks X, Facebook, LinkedIn, or Copy link in `ShareButtons` (auction context only). |

**Not implemented:** BID_CLICK, conversions, campaigns, notifications.

## Dedupe / anti-spam (server)

- **VIEW:** No second row within **60s** for the same `auctionId` and authenticated `userId`, **or** the same `auctionId` and `visitorKey` (stored in JSON metadata) when anonymous.
- **SHARE_CLICK:** No second row within **5s** for the same `auctionId`, `userId`, and `metadata.shareTarget` (or anonymous + `visitorKey` match).

No IP throttling; high-traffic deployments should add edge rate limits in a later PR.

## Client behavior

- **`sendMarketingTrack`:** `navigator.sendBeacon` with JSON `Blob` when possible; else `fetch(..., { keepalive: true })`. Errors are swallowed.
- **Visitor key:** `sessionStorage` key `carasta_mk_v1` for stable anonymous correlation.

## Feature flag

- Same as Phase 1: `MARKETING_ENABLED=true` enables API writes and client instrumentation on the auction detail page.

## PR 3 suggestions

- Per-auction seller page under `/u/[handle]/marketing/auctions/[auctionId]` reading `TrafficEvent`.
- Time-series or daily rollups if raw table grows large.
- Optional client-only **BID_CLICK** on bid control taps (never coupled to `placeBid`).
