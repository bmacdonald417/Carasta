# Carasta deployment — source of truth and cutover checklist

This document is grounded in the **repository only**. It does **not** record Railway console state (for example whether `caring-wonder` is still connected to GitHub); operators must verify that in the Railway UI.

## Canonical production path

1. Develop on **feature branches** (for example `feature/...`).
2. **Merge into `main`** via PR or merge, then **push `main`** to GitHub.
3. The **Railway project named Carasta** (intended canonical service) should be the only project that **auto-deploys** this repo’s **`main`** branch to production.
4. Production database is the **PostgreSQL instance attached to the Carasta Railway project** (via `DATABASE_URL` in that project’s variables). Reason about schema, seeds, and data against **that** database only.

## Legacy duplicate Railway project

- A second Railway project, **`caring-wonder`**, was connected to the **same** GitHub repo and **`main`**, causing duplicate deploys and environment drift.
- **`caring-wonder` must not be treated as a deployment target** going forward.
- **Do not assume** a second Railway project is valid or “staging” simply because it exists—confirm in Railway which project owns production and which Git branch it deploys.

## For Cursor and operators

When discussing deploys, migrations, or env vars, default assumptions must be:

- **Git branch:** `main` (as pushed to `origin/main`)
- **Railway project:** **Carasta**
- **Database:** the DB backing **Carasta**’s `DATABASE_URL`

---

## Repo audit snapshot (verified locally)

| Check | Result |
|--------|--------|
| Current branch | `main` |
| Tracking | `main...origin/main` (up to date) |
| Working tree | **Clean** (no uncommitted changes) |
| `HEAD` / `origin/main` | `c4dffbe` — *feat: complete Carmunity app phases 4-7, forums, auctions, media upload, and backend APIs* |
| `a00fe66` in history | **Yes** — `a00fe66` is an ancestor of `HEAD` (merge narrative `main: a00fe66 → c4dffbe` is consistent with this clone) |
| Carmunity / forum / auction scope on `main` | **Yes** — commits after `a00fe66` include Carmunity engagement/mobile APIs, forums Phase 4 backend, and the merge tip `c4dffbe` |

---

## Prisma / database follow-up (since `a00fe66`)

### What changed in git (`a00fe66..HEAD`)

- **`prisma/schema.prisma`** — **Material change** (~92 lines added):
  - **Forum:** `ForumSpace`, `ForumCategory`, `ForumThread`, `ForumReply`; `User` gains `forumThreads`, `forumReplies`.
  - **Auction watchlist (Carmunity):** `AuctionWatch` with `@@unique([userId, auctionId])`; `User.auctionWatches`, `Auction.watches`.
- **`prisma/seed.ts`** — **Seed change**:
  - New **`ensureForumSpacesAndCategories()`** (idempotent upserts) creates **Mechanics Corner** and **Gear Interests** spaces and starter categories. It runs **at the start of every successful seed invocation**, before the existing “skip if auctions exist” logic.
- **`prisma/migrations/`** — **No files changed** in this range (no new SQL migrations added for this work in the repo).

### How this repo applies schema in production builds

`package.json` defines:

```json
"build": "node scripts/build-with-public-db.cjs",
"build:core": "prisma generate && npx ts-node -P tsconfig.scripts.json scripts/revert-enum-if-needed.ts && prisma db push && prisma db seed && next build"
```

The **`build-with-public-db`** wrapper assigns **`DATABASE_URL` from `DATABASE_PUBLIC_URL`** in the **same Node process** before `execSync("npm run build:core")`, so every Prisma step sees the public proxy host. Railway’s **Nixpacks build phase** cannot use **private networking** (`postgres-*.railway.internal` per [Railway private networking](https://docs.railway.com/guides/private-networking)).

**Critical:** `DATABASE_PUBLIC_URL` must exist on the **web** service that runs the build—not only on the Postgres service. Add it via **Variables → New Variable → Reference** from Postgres (`DATABASE_PUBLIC_URL`), or paste the public connection string. If the build log still shows `railway.internal`, the public URL was not present in that service’s **build** environment (re-check the variable is on Carasta, not only the database card).

**Do not remove `DATABASE_URL` from the Railway web service:** Prisma’s datasource is `env("DATABASE_URL")`, so the running Next.js process must still receive the **private** URL at **runtime** (`npm start`). The security goal is to keep that private value **off** laptops, Cursor global env, CI logs, and git — not to delete the variable from Railway.

So a **default `npm run build`** on Railway **already** runs **`prisma db push`** and **`prisma db seed`** (after `prisma generate` and the enum helper script). This is **not** `prisma migrate deploy`; the project relies on **`db push`** for deploy-time schema sync.

### Recommendations

1. **Carasta Railway service** must use a build that includes the steps above (typically **`npm run build`** / **`railway run npm run build`** equivalent). If the Carasta service overrides the build command and **omits** `db push` / seed, the new tables will be missing and forum/watchlist features will fail at runtime.
2. **`prisma migrate dev`** / **`npm run db:migrate`** are oriented toward **local** migration workflow; **this merge did not add new migration SQL** for the forum/watchlist work—**do not assume `migrate deploy` is the primary path** unless you introduce migrations and change the deploy pipeline.
3. **Seed:** Running seed after deploy is **required** for **forum space/category bootstrap** (Mechanics Corner / Gear Interests). The build already runs seed; if you run seed manually, use the **Carasta** `DATABASE_URL` only.
4. **Production data:** `seed.ts` still **skips demo auction/user seeding** when the DB already has auctions; the new forum bootstrap runs **before** that check—safe for a DB that already has production auctions **as long as** tables exist (i.e. `db push` has run).

---

## Operator checklist (safe order)

Railway steps **cannot be performed from this repo**; complete them in the [Railway dashboard](https://railway.app).

### 1. Railway — stop duplicate deploys (manual)

- [ ] Open Railway project **`caring-wonder`** (legacy).
- [ ] Under **Settings → Service / Git**, **confirm** whether this project is still connected to the Carasta GitHub repo and branch **`main`**.
- [ ] If it is still connected: **disconnect** GitHub auto-deploys from this legacy project, **or** archive/delete the project per your org policy, so **only Carasta** deploys from **`main`**.
- [ ] **Cannot verify from repo:** you must **explicitly confirm** in the UI that `caring-wonder` no longer deploys on every `main` push.

### 2. Railway — environment parity (manual)

- [ ] In project **Carasta**, open **Variables** for the production service(s).
- [ ] Compare **non-database** variables (API keys, `NEXTAUTH_*`, upload, Pusher, marketing flags, etc.) against the legacy project **only to copy missing keys into Carasta**. Do **not** copy `DATABASE_URL` from legacy unless you intend to point Carasta at that DB (usually **avoid**—use **Carasta’s** canonical Postgres).
- [ ] Confirm **`DATABASE_URL`** on **Carasta** points at the **Carasta** Postgres plugin/instance you want for production.

### 3. Prisma / database (repo-aligned commands)

**If Carasta uses the default `npm run build`:** redeploying **`main`** at `c4dffbe` should run `prisma generate`, `db push`, and `db seed` automatically. **Trigger a deploy** after Railway/Git settings are correct.

**If you need a one-off run against Carasta’s DB** (e.g. custom build command without push/seed), from a trusted environment with **Carasta’s** `DATABASE_URL` set:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Optional local sanity (does not deploy):

```bash
npm run db:generate
```

**Not recommended as the primary path for this merge:** `npx prisma migrate deploy` — there were **no new migration files** for this schema delta in `a00fe66..HEAD`; production alignment is defined by **`db push`** in this repo’s build script.

### 4. Production verification (after Carasta deploy)

Use the **Carasta** deployment URL (from the Carasta project, not legacy):

- [ ] App boots; no Prisma errors in deploy logs about missing tables (`ForumSpace`, `ForumCategory`, `ForumThread`, `ForumReply`, `AuctionWatch`).
- [ ] **Forums:** list spaces/categories, create thread/reply (per your app’s routes/UI).
- [ ] **Auction watchlist:** save/remove watch on an auction (Carmunity flows).
- [ ] **Carmunity / mobile JSON APIs** touched by this release (per your release notes / `c4dffbe` scope).
- [ ] **Auth and core auctions** still work (regression smoke).

---

## What this repo cannot do

- **Cannot** disconnect GitHub from `caring-wonder`, copy Railway variables, or trigger deploys—**manual Railway (and optionally GitHub) actions required**.
- **Cannot** see whether two Railway projects still share the same `DATABASE_URL`; operators must confirm in Railway.

---

## Revision note

Document created from repository state: branch `main`, clean tree, `origin/main` at `c4dffbe`, `git diff a00fe66..HEAD` on `prisma/`, and `package.json` build script.
