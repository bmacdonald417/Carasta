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

## Step 3: Run Database Migration

After Postgres is running, either:

**Option A — From your local machine** (with `DATABASE_URL` pointing to Railway Postgres):

```bash
npx prisma db push
npx prisma db seed
```

**Option B — Add a one-off deploy command** in Railway for the web service:

```bash
npx prisma db push && npx prisma db seed
```

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
