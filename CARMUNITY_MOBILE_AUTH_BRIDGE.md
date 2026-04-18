# Carmunity mobile auth bridge

How Carmunity authenticates to Carasta **JSON APIs** without duplicating session logic in Flutter.

## Principles

- **Single source of truth:** `NEXTAUTH_SECRET` + JWT payload shape from `next-auth/jwt` (`encode` / `decode` / `getToken`).
- **No fake users:** the app stores only what the server mints or what the user pastes for dev; no client-generated subjects.
- **Swappable transport:** cookie (legacy / web parity) or **Bearer** (preferred for mobile).

## Server: resolving the user

`getJwtSubjectUserId(req)` (`lib/auth/api-user.ts`):

1. **`getToken({ req, secret })`** — NextAuth session cookie on the request.
2. If no cookie subject: **`Authorization: Bearer <token>`** → **`decode({ token, secret })`**.
3. User id from JWT **`sub`** or **`id`**.

Unauthenticated protected routes return **401** with `{ "ok": false, "error": "Unauthorized" }` unless a route documents otherwise.

## Obtaining a Bearer JWT (mobile)

### A) Credential exchange (password accounts)

**`POST /api/auth/mobile/token`**

**Body:**

```json
{ "email": "user@example.com", "password": "…" }
```

**200:**

```json
{
  "ok": true,
  "accessToken": "<jwt>",
  "userId": "<cuid>",
  "handle": "…"
}
```

**401** — invalid credentials.  
**400** — missing email/password or invalid JSON.  
**500** — `NEXTAUTH_SECRET` missing (server cannot mint).

**Limitation:** users who only sign in with **OAuth** and have **no `passwordHash`** receive **401** (“Invalid credentials”) from this route. They must use another path (see below).

### B) Demo / internal mint (non-production flows)

**`POST /api/carmunity/demo-session`** (existing product behavior) mints the same JWT type via **`mintCarmunityAccessToken`** for approved demo accounts.

### C) Manual dev (cookie or JWT string)

Developers may paste a session cookie header or raw JWT into dev tools **only** for local testing — not a product requirement.

## Flutter contract

- Prefer **`Authorization: Bearer <accessToken>`** on `ApiClient` once `signInWithAccessToken` (or equivalent) has run.
- When switching to Bearer from dev helpers, **clear** the copied `Cookie` header if both were set, to avoid ambiguous precedence.
- On **401** from protected routes, surface a clear **sign-in required** state; do not silently retry with fake credentials.

## Security notes

- **HTTPS only** in production for token exchange and all authenticated APIs.
- Add **rate limiting** and lockout policy for `/api/auth/mobile/token` at the edge.
- JWT **maxAge** is **30 days** (`lib/auth/carmunity-access-token.ts`); align refresh/re-auth UX in future phases if needed.

## Future work (not Phase 7)

- OAuth authorization-code or refresh flow that returns the **same** JWT shape for Google-only users.
- Optional short-lived access + refresh tokens if session policy tightens.
