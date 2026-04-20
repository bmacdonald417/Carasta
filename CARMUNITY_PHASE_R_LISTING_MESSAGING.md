# Carmunity / Carasta — Phase R: Messaging × Listings integration

Phase R extends Phase Q 1:1 messaging so conversations can be **listing-aware** (auction-scoped) while keeping generic DMs intact.

---

## Objective

- Users can message a seller **from a listing**
- Conversations can be tied to a specific listing (`auctionId`)
- Listing context is shown inside the conversation UI
- Phase Q behavior remains unchanged for generic conversations

---

## Schema updates

### `Conversation`

Added:
- `auctionId String?` (nullable)
- optional relation `auction Auction?`
- index on `auctionId`

### Uniqueness / directKey logic

We keep `directKey` as the single unique key for 1:1 dedupe, but change its format to include scope:

- **Generic DM**: `${minUserId}:${maxUserId}:g`
- **Listing DM**: `${minUserId}:${maxUserId}:a:${auctionId}`

This allows the same two users to have:
- at most **one** generic conversation
- at most **one** conversation per listing

Migration:
- `prisma/migrations/20260421180000_messaging_listing_scope_phase_r/migration.sql`

---

## API changes

### `POST /api/messages/conversations`

Enhanced input:
- `targetUserId` (required)
- `auctionId` (optional)

Behavior:
- If `auctionId` is present:
  - listing must exist
  - you cannot message about your **own listing**
  - `targetUserId` must equal the listing’s `sellerId`
  - create/find conversation scoped to (userA, userB, auctionId) via scoped `directKey`
- Still enforces:
  - no self-messaging
  - block rules (either direction block = forbidden)

### `GET /api/messages/conversations/[id]`

Now returns `conversation.auction` capsule when `auctionId` exists (title + basic details + first image + seller mini).

---

## Listing page integration

On the auction detail page:
- Added **“Message Seller”** button
- Calls `POST /api/messages/conversations` with `{ targetUserId: sellerId, auctionId }`
- Redirects to `/messages/[conversationId]`

Guardrails:
- Button only renders for signed-in users who are not the seller

---

## Conversation UI

If the conversation has `auctionId`:
- Show a compact listing context card at the top:
  - image (first listing image if present)
  - title + year/make/model + status
  - link back to listing

---

## Guardrails

- Block rules still prevent creating or sending
- Muting still suppresses notifications (Phase Q behavior)
- Prevent messaging your own listing (API + UI)
- Ensure listing exists and target matches seller

---

## Deferred (intentionally NOT built yet)

- Offers/negotiation flows
- Payment/buy-now negotiation in chat
- Attachments/media
- Group chat
- “Start message from profile” seller/DM entry point improvements
- Backfill/migration of old Phase Q `directKey` formats (existing new convos use scoped key format going forward)

