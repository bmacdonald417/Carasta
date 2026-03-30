# Marketing — Phase 1 foundation notes

## Feature flag

- **Variable:** `MARKETING_ENABLED`
- **Enabled when:** value is exactly the string `true` (see `lib/marketing/feature-flag.ts`).
- **Disabled (default):** unset or any other value — route `/u/[handle]/marketing` returns **404** (`notFound()`); profile and listings do not show Marketing links.
- **Local dev:** add `MARKETING_ENABLED=true` to `.env` (see `.env.example` comment).

## Database

- Apply migration when not using ad-hoc `db push` for schema:

  ```bash
  npx prisma migrate deploy
  ```

  Migration folder: **`20260330120000_add_marketing_foundation`**.

- Repo `package.json` **build** script currently uses `prisma db push`; teams using migrations in CI should align build/deploy to apply migrations so new tables exist in production.

## Models (summary)

| Model          | Purpose |
|----------------|---------|
| `TrafficEvent` | Auction-scoped marketing/traffic events (ingestion in PR2). |
| `Campaign`     | Seller campaign tied to one auction (`userId` + `auctionId`). |
| `CampaignEvent`| Audit/history rows for a campaign. |

## Security

- Marketing UI and dashboard: **owner-only**, same ID check as `/u/[handle]/listings`.
- No new roles; **seller** = authenticated user who owns the handle/auctions.

## PR 2 suggestion

1. Public or authenticated **track** endpoint with validation + rate limits.
2. Client: fire-and-forget from auction detail / share control (no blocking render).
3. Optional: `/u/[handle]/marketing/auctions/[auctionId]` drill-down once reads are useful.
