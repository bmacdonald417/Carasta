# Carmunity — Phase 4 backend (forums foundation)

**Branch:** `feature/carmunity-phase-2-engagement`  
**Date:** 2026-04-14

## 1. Audit conclusions

| Area | Role today | Forum decision |
|------|------------|----------------|
| **Post** | Carmunity **feed** cards; optional `auctionId`; likes; flat **Comment** list | **Do not reuse** as forum threads. Feed semantics (likes, explore, marketing) differ from threaded discussion. |
| **Comment** | Attached to **Post** only | **Distinct** from forum replies — keep `Comment` for feed posts only. |
| **Like / Follow** | Social graph + feed | Forums use **no** post-like model in Phase 4; discovery via spaces/categories/thread lists. |
| **Notification** | Existing triggers | Future: optional `forum_reply` notifications — not in this step. |
| **Explore / feed APIs** | `GET /api/explore/feed` | Unchanged; forums are separate routes under `/api/forums/*`. |

**Conclusion:** Model **ForumSpace → ForumCategory → ForumThread → ForumReply** as first-class tables. This avoids overloading `Post`, preserves a clear product boundary (feed vs forums), and keeps indexes/query paths maintainable.

## 2. Chosen forum model

| Model | Purpose |
|-------|---------|
| **ForumSpace** | Top-level product areas (e.g. **Mechanics Corner**, **Gear Interests**). `slug` unique globally. |
| **ForumCategory** | Thread buckets inside a space; `slug` unique **per space** (`@@unique([spaceId, slug])`). Optional `metadata` JSON for future make/model or tagging without schema churn. |
| **ForumThread** | Titled discussion with body text; `replyCount`, `lastActivityAt` for lists; `locked` for future moderation. |
| **ForumReply** | Ordered replies under a thread; `body` text. |

**Not included yet:** voting, subscriptions, full moderation workflows, search, rich attachments (beyond text).

## 3. Prisma changes (additive)

New models and `User` relations: `forumThreads`, `forumReplies`.  
**No** changes to `Post`, `Comment`, `Like`, `Auction`.

Apply locally:

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_forums
npx prisma generate
```

Seed (`prisma/seed.ts`) calls `ensureForumSpacesAndCategories()` **before** the auction short-circuit so forums exist even when demo auctions are already present.

## 4. Shared service layer

- **`lib/forums/forum-service.ts`** — single source of truth for list/read/create. API routes are thin wrappers (same pattern as `lib/carmunity/*`).

## 5. HTTP API surface

See **`FORUMS_API_CONTRACT.md`** for request/response JSON.

Implemented routes:

| Method | Path |
|--------|------|
| GET | `/api/forums/spaces` |
| GET | `/api/forums/spaces/[slug]` |
| GET | `/api/forums/categories/[categoryId]/threads` |
| GET | `/api/forums/threads/[id]` |
| POST | `/api/forums/threads` |
| POST | `/api/forums/threads/[id]/replies` |

**Auth:** Same as Carmunity JSON APIs — `getJwtSubjectUserId` (NextAuth JWT cookie / future Bearer). Writes return **401** when unauthenticated.

## 6. Open questions / limitations

| Topic | Notes |
|-------|--------|
| **ISR / revalidation** | Forum routes do not call `revalidatePath`; web pages can opt in later. |
| **Moderation** | Only `ForumThread.locked` reserved; no report/abuse tables yet. |
| **Gear make/model** | Use `ForumCategory.metadata` JSON until dedicated taxonomy is defined. |
| **Realtime** | No Pusher on forum replies in this pass (comments on feed posts may use Pusher separately). |

## 7. Files created

| File |
|------|
| `lib/forums/forum-service.ts` |
| `app/api/forums/spaces/route.ts` |
| `app/api/forums/spaces/[slug]/route.ts` |
| `app/api/forums/categories/[categoryId]/threads/route.ts` |
| `app/api/forums/threads/route.ts` |
| `app/api/forums/threads/[id]/route.ts` |
| `app/api/forums/threads/[id]/replies/route.ts` |
| `FORUMS_API_CONTRACT.md` |
| `CARASTA_APP_PHASE_4_BACKEND_PLAN.md` (this file) |

## 8. Files modified

| File |
|------|
| `prisma/schema.prisma` — `ForumSpace`, `ForumCategory`, `ForumThread`, `ForumReply`; `User` relations |
| `prisma/seed.ts` — `ensureForumSpacesAndCategories()` |

## 9. Next Flutter prompt (Phase 4 client)

> On `feature/carmunity-phase-2-engagement`, implement **Carmunity Forums** UI: consume **`FORUMS_API_CONTRACT.md`** — list spaces from `GET /api/forums/spaces`, drill into `GET /api/forums/spaces/[slug]`, thread list via `GET /api/forums/categories/[id]/threads`, detail via `GET /api/forums/threads/[id]`, create thread/reply with session cookie / provisional auth. Add a `ForumRepository` (Dio) parallel to `CarmunityRepository`; **do not** map forums onto feed `Post` models. Defer search, voting, and push notifications.

## 10. Validation

- `npx tsc --noEmit` — pass  
- `npm run lint` — pass (existing unrelated `<img>` warnings)  
- `npx prisma generate` — run locally if the environment locks `query_engine` (Windows EPERM); schema is valid Prisma 5 syntax.
