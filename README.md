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

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` — PostgreSQL connection string.
   - `NEXTAUTH_URL` — e.g. `http://localhost:3000`.
   - `NEXTAUTH_SECRET` — e.g. `openssl rand -base64 32`.
   - Optionally: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Google sign-in.

3. **Database**

   ```bash
   pnpm prisma generate
   pnpm prisma db push
   # or: pnpm db:migrate
   pnpm db:seed
   ```

4. **Run**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Seed users (e.g. `tom@example.com`, `flat6@example.com`, `v8vince@example.com`) use password **password123**.

## Deploy (Railway)

- **Build:** `pnpm build` (or `npm run build`)
- **Start:** `pnpm start` (or `npm start`)
- Set `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` in Railway. Use a production Postgres instance.

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
