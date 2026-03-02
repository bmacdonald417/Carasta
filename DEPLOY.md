# Carasta Deployment Guide

## Completed

- **Git push**: All changes pushed to `main` on GitHub
- **Railway project**: Carasta project created at https://railway.com/project/977696bb-9a14-485a-834a-b3e2561bbea9

## Step 1: Add PostgreSQL on Railway

1. Open your Carasta project: https://railway.com/project/977696bb-9a14-485a-834a-b3e2561bbea9
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Railway will provision Postgres and add `DATABASE_URL` to your project variables
4. Copy the `DATABASE_URL` (or `DATABASE_PUBLIC_URL` if your app needs public access)

## Step 2: Configure Web Service Variables

Add these variables to the **Carasta** web service:
   - `DATABASE_URL` (reference from Postgres — see Step 1)
   - `NEXTAUTH_URL` = `https://your-app.railway.app`
   - `NEXTAUTH_SECRET` = generate with `openssl rand -base64 32`

## Step 3: Database Schema and Seed

**Schema is applied automatically** — The build runs `prisma db push`, so tables are created on every deploy. Ensure `DATABASE_URL` is set on the Carasta service (link it from your Postgres service: Variables → Add Variable Reference → `${{Postgres.DATABASE_URL}}`).

**Run seed once** — From your local machine with `DATABASE_URL` pointing to Railway Postgres (use the **public** URL from Postgres → Connect → `DATABASE_PUBLIC_URL`):

```bash
DATABASE_URL="postgresql://..." npx prisma db seed
```

Or set `DATABASE_URL` in `.env` and run `npx prisma db seed`.

> **Troubleshooting:** If you see "No auctions match your filters" or no listings on the home page, the database likely has no demo data. Run the seed command above. Also ensure year filters use full 4-digit years (e.g. 1990, 2024)—partial values like 199 or 202 are ignored.

Demo login: `tom@example.com` / `password123`

## Step 4: Create Pusher App (for real-time bids)

**Pusher apps must be created manually** — there is no API for app creation.

1. Go to https://dashboard.pusher.com/accounts/sign_up
2. Sign up with GitHub or Google (free tier: 200k messages/day)
3. Click **Create app** → **Channels** → choose a name (e.g. "Carasta")
4. Copy your credentials and add to Railway **Carasta** service variables:
   - `PUSHER_APP_ID`
   - `PUSHER_KEY`
   - `PUSHER_SECRET`
   - `PUSHER_CLUSTER` (e.g. `us2`)
   - `NEXT_PUBLIC_PUSHER_KEY`
   - `NEXT_PUBLIC_PUSHER_CLUSTER`

Real-time bid updates will work once these are set.

## Step 5: Google OAuth (optional)

To enable "Continue with Google" on sign-in/sign-up:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized redirect URIs**:
   - Production: `https://your-app.railway.app/api/auth/callback/google`
   - Local: `http://localhost:3000/api/auth/callback/google`
4. Add to Railway variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

The Google button only appears when both variables are set.
