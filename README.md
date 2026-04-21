# Carasta

A premium collector car auction and community web app (Next.js 14 App Router, TypeScript, Tailwind, Prisma, NextAuth). Luxury dark theme, mobile-first.

**This is a school demo.** No real payments. Checkout is simulated.

## Features

- **Auth** — Sign up / sign in (credentials + optional Google). Profile with handle, bio, stats.
- **Community** — Feed (trending + following), posts (photo + caption, text), like & comment.
- **Garage & Dream Garage** — Add cars you own or want (year, make, model, trim, photos, notes).
- **Auctions** — Create listings (reserve, optional buy-now first 24h, duration). Bid with $250 min increment, anti-sniping (extend 2 min if bid in last 2 min), reserve meter (0–100%, red→green), auto-bid, buy now. Polling every ~4s on detail page.
- **Profile** — Follow/unfollow, garage, dream garage, auction stats.

## Tech stack

- Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn-style UI, Lucide, Prisma (PostgreSQL), NextAuth (Credentials + Google), Zod, Prettier, ESLint.

## Setup

1. **Clone and install**

   ```bash
   cd Carasta
   pnpm install
   # or: npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and fill values there (`.env` is gitignored and is the file you keep aligned with Railway). `.env.example` is only a **name/intent template** — do not put production secrets in it.

   Database:

   - **Local / Cursor:** Prefer `DATABASE_PUBLIC_URL` (Railway’s public TCP proxy URL). With `DATABASE_URL` left unset, `npm run dev` and `npm run db:*` use `scripts/run-with-local-db.cjs` to pass a `DATABASE_URL` to Prisma for that command only.
   - **Alternatively:** Set `DATABASE_URL` in `.env` to the same public URL if you want a single key locally (still gitignored).
   - **Railway runtime:** The web service still needs **`DATABASE_URL`** set to the **private** Postgres URL for `next start` / Prisma; keep private URLs off local machines and out of CI.

   Also set:

   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`.
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`.
   - Optionally: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Google sign-in.

3. **Database**

   ```bash
   pnpm db:generate
   pnpm db:push
   # or: pnpm db:migrate
   pnpm db:seed
   ```

4. **Run**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). All seed users use password **password123**.

   **Demo accounts:** `tom@example.com` (admin), `flat6@example.com`, `v8vince@example.com`, `jdm@example.com`, `classic@example.com`, `rally@example.com`, `collector@example.com`, `dealer@example.com`

   **App:** [App Store](https://apps.apple.com/us/app/carasta/id6740201534) · [Google Play](https://play.google.com/store/apps/details?id=com.hidden_cherry_45273)

## Deploy (Railway)

- **Build:** `pnpm build` (or `npm run build`) — uses `scripts/build-with-public-db.cjs` when `DATABASE_URL` uses `*.railway.internal` (see `.env.example` database section).
- **Start:** `pnpm start` (or `npm start`)
- On the **web** service: set private `DATABASE_URL`, `DATABASE_PUBLIC_URL` (for build), `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, and other keys from your `.env` template. Do not commit real values.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `pnpm dev`     | Start dev server         |
| `pnpm build`   | Production build         |
| `pnpm start`   | Start production server  |
| `pnpm lint`    | Run ESLint               |
| `pnpm db:generate` | Prisma generate   |
| `pnpm db:push`     | Prisma db push      |
| `pnpm db:migrate`  | Prisma migrate dev  |
| `pnpm db:seed`     | Run seed script     |
| `pnpm db:studio`   | Prisma Studio       |

## Disclaimer

Demo only. No Stripe or real payment integration. “Secure checkout partner (demo)” is placeholder text.
