# Phase 2 — Carmunity engagement backend

## 1. Existing mutation audit (web)

| Flow | Location | Inputs | Rules / side effects |
|------|-----------|--------|-------------------------|
| **Create post** | `app/(marketing)/explore/actions.ts` → `createPost` | `FormData`: `content`, `imageUrl` | Must be signed in; at least one of text or image URL (trimmed); `prisma.post.create`; `revalidatePath("/explore")` |
| **Like post** | `likePost` | `postId` | Signed in; `like` upsert; `revalidatePath("/explore")` |
| **Unlike post** | `unlikePost` | `postId` | Signed in; `like` deleteMany; `revalidatePath("/explore")` |
| **Comment** | `addComment` | `postId`, `content` | Signed in; non-empty trimmed content; `comment.create`; **Pusher** `broadcastActivityEvent` (new_comment); `revalidatePath` explore + post |
| **Follow** | `app/(app)/u/[handle]/actions.ts` → `followUser` | `targetUserId` | Signed in; not self; `follow` upsert; `revalidatePath(/u/{handle})` |
| **Unfollow** | `unfollowUser` | `targetUserId` | Signed in; `follow` deleteMany; `revalidatePath` |

**Validation:** No shared zod module today; rules lived inline in Server Actions.

**Trapped in Server Actions:** All of the above were only reachable via `"use server"` + `getSession()` until this phase.

**Auction-adjacent (not built now):** `app/(marketing)/auctions/actions.ts` — `placeBid`, `quickBid`, `executeBuyNow`, auto-bid, feedback, etc. These should eventually call shared `lib/auction-utils` (already) behind **future** REST routes; out of scope for Carmunity Phase 2.

---

## 2. Reusable logic

- New module: **`lib/carmunity/engagement-service.ts`** — single source of truth for create post, like/unlike, comment (including Pusher activity), follow/unfollow.
- Web Server Actions now **only**: `getSession`, call service, `revalidatePath` (and profile handle lookup for follow revalidation).
- **No duplicated Prisma** in API route handlers beyond what the service encapsulates.

---

## 3. Mobile-safe endpoints added

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/carmunity/posts` | Create post |
| POST | `/api/carmunity/posts/[id]/like` | Like |
| DELETE | `/api/carmunity/posts/[id]/like` | Unlike |
| POST | `/api/carmunity/posts/[id]/comments` | Comment |
| POST | `/api/carmunity/users/[id]/follow` | Follow |
| DELETE | `/api/carmunity/users/[id]/follow` | Unfollow |

Handlers: `app/api/carmunity/**/route.ts`. JSON-only responses.

---

## 4. Request/response shapes

See **`CARMUNITY_MOBILE_API_CONTRACT.md`** for copy-paste contracts.

---

## 5. Auth assumptions

- **Implemented helper:** `lib/auth/api-user.ts` — `getJwtSubjectUserId(req)` using `getToken({ req, secret: NEXTAUTH_SECRET })` (same pattern as `app/api/notifications/list/route.ts`).
- **Works today** when the client sends the **NextAuth JWT cookie** (typical browser / WebView).
- **Gap for Flutter:** Native app using `dio` against `API_BASE_URL` **without** cookies cannot authenticate until one of:
  - Cookie jar + sign-in through web session, or
  - **Bearer token** validated in route handlers (not implemented in this pass).

**Recommendation for Prompt 3 (Flutter):** Prefer a small backend addition: accept `Authorization: Bearer <jwt>` where the JWT is the same NextAuth-signed token, or add a dedicated mobile token exchange — document and implement in lockstep.

---

## 6. Known blockers

| Blocker | Notes |
|---------|--------|
| **Flutter auth transport** | APIs require JWT identification; cookie-less mobile needs Bearer or session bridge. |
| **CORS** | If the app calls the API from a different **origin**, Next must allow credentials/CORS (not configured in this change). |
| **revalidatePath** | API routes do not call `revalidatePath`; ISR/server-rendered explore pages may lag until next refresh or tag-based revalidation is added later. |
| **Rate limiting / abuse** | Not added; consider middleware or edge limits for public deploys. |

---

## 7. Recommended next Flutter-side prompt

> **Phase 2b — Flutter engagement client**  
> On `feature/carmunity-phase-2-engagement`, wire `ApiClient` **POST/DELETE** to `/api/carmunity/*` with the agreed JSON bodies. Implement a **minimal auth bridge** (cookie from WebView or Bearer once backend accepts it). Add like/comment/follow/create UI on existing screens **without** duplicating validation in Dart — treat server `error` strings as source of truth. Refresh feed after mutations via `ref.invalidate(homeFeedProvider)` or equivalent.

---

## 8. Verification

Run from repo root:

```bash
npm run lint
```

Ensure `NEXTAUTH_SECRET` is set in env for JWT resolution in dev/production.
