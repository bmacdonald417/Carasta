# Carmunity / Carasta — Phase Q: Messaging (Phase 1)

Phase Q introduces a **minimal, scalable 1:1 messaging system** for Carmunity users.

**Goals**
- 1:1 messaging between users (no group chat yet)
- Uses existing identity (`User`)
- Respects **block** rules (hard stop)
- Integrates with existing **Notification** model + UI
- Minimal web UI: conversations list + conversation detail

**Explicitly NOT built in Phase Q (by design)**
- Group chats
- Media/attachments
- Voice/video
- Listing-bound conversations (auction-scoped DMs)
- End-to-end encryption
- Complex moderation tooling beyond existing blocks/mutes

---

## Schema changes (Prisma)

### `Conversation`
- `id`
- `directKey` (optional, unique): `${minUserId}:${maxUserId}` for 1:1 dedupe
- `createdAt`, `updatedAt`
- `lastMessageAt`
- `lastMessagePreview` (varchar 240)
- relations:
  - `participants` → `ConversationParticipant[]`
  - `messages` → `Message[]`

### `ConversationParticipant`
- `id`
- `conversationId`
- `userId`
- `lastReadAt`
- `isMuted` (bool, default false; reserved for Phase R)
- constraints/indexes:
  - unique `(conversationId, userId)`
  - indexes on `userId`, `conversationId`

### `Message`
- `id`
- `conversationId`
- `senderId`
- `body` (text)
- `createdAt`
- `isEdited` (bool, default false)
- `isSystem` (bool, default false; reserved)
- indexes:
  - `(conversationId, createdAt)`
  - `(senderId, createdAt)`

### Migration
Added a SQL migration:
- `prisma/migrations/20260421170000_messaging_phase_q/migration.sql`

Note: this repo’s migrations are authored as SQL files (as with P3). Apply via your normal deploy migration process.

---

## API routes

All routes require auth via the existing NextAuth JWT (cookie) or Carmunity mobile bearer token.

### `GET /api/messages/conversations`
Lists conversations for the current user.

Returns:
- `otherParticipants` (user mini profiles)
- `lastMessagePreview`
- `unreadCount` (messages since `lastReadAt`, excluding your own)

### `POST /api/messages/conversations`
Create-or-get a 1:1 conversation.

Body:
- `targetUserId`

Enforces:
- cannot create a self-conversation
- cannot create if either user has blocked the other

Returns:
- `conversationId`

### `GET /api/messages/conversations/[id]`
Loads messages for a conversation (membership required).

Query:
- `limit` (default 30, max 80)
- `cursor` (message id, optional; simple pagination)

Returns:
- `conversation` (participants + preview fields)
- `messages` (latest first in API response; UI reverses for display)
- `nextCursor`

### `POST /api/messages/conversations/[id]/messages`
Send a message (membership required).

Body:
- `body` (1..5000 chars; trimmed; control chars stripped)

Enforces:
- sender must be a participant
- if either user blocked the other: **403**
- basic per-process rate limit (`allowAction`) to prevent spam bursts

Side effects:
- writes `Message`
- updates `Conversation.lastMessageAt` + `lastMessagePreview`
- updates sender participant `lastReadAt`
- creates a `Notification` row for the recipient (see below), unless the recipient has muted the sender

### `PATCH /api/messages/conversations/[id]/read`
Mark conversation read for the current user.

Side effect:
- sets participant `lastReadAt = now`

---

## Block / mute enforcement

Reuses `lib/user-safety.ts`:

- **Blocks:** `usersAreBlockedEitherWay(prisma, a, b)`
  - prevents conversation creation
  - prevents sending messages

- **Mutes:** `recipientHasMutedActor(prisma, recipientId, actorId)`
  - **does not block messaging**
  - suppresses the notification for the muted recipient (Phase Q behavior)

---

## Notifications integration

On new message:
- create a `Notification` row for the recipient:
  - `type`: `"MESSAGE"`
  - `actorId`: sender id
  - `targetId`: `conversationId`
  - `payloadJson`: includes:
    - `href`: `/messages/[conversationId]`
    - `preview` / `message` / `title`: a short one-line preview

This works with the existing web `NotificationDropdown`, which renders `payload.href` and uses `payload.title/message` as row text.

No notification is created for the sender.

---

## Web UI (Phase Q)

Routes:
- `/messages`: conversations list
- `/messages/[conversationId]`: detail thread + send box

Navigation:
- “Messages” entry added to:
  - header app nav
  - sidebar
  - mobile bottom nav

UI notes:
- Minimal layout; no attachments; no message edit UI yet.
- Conversation open performs a best-effort `PATCH /read`.

---

## Mobile (basic hook)

No Flutter UI was added in Phase Q, but endpoints are mobile-friendly:
- Auth via `Authorization: Bearer <jwt>` using `POST /api/auth/mobile/token` output.
- Same JSON shapes as web.

---

## Guardrails

- Send rate limit: in-memory throttle per user+conversation (`lib/api-rate-limit.ts`)
- Validation:
  - `body` required, max 5000
  - control chars stripped, trimmed
- No HTML rendering in UI; message bodies are rendered as plain text (`whitespace-pre-wrap`)

---

## Recommended Phase R follow-ups

- Start conversation from user profile (“Message” CTA)
- Better unread accuracy + batch unread counts (remove N+1)
- Server-driven pagination/infinite scroll and “load older”
- Muting UI per conversation participant (`ConversationParticipant.isMuted`)
- Push notification integration (mobile)
- Message editing + system messages (optional)
- Admin tooling / abuse reporting for messages

