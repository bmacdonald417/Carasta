# Carmunity Discussions — Curated Demo Content

This repository includes a **small, intentional** set of seeded discussion data so the Discussions web preview feels alive. It is **not** real user-generated content.

## How demo rows are flagged

| Model        | Field         | Meaning                                      |
|-------------|---------------|----------------------------------------------|
| `User`      | `isDemoSeed`  | Seeded demo profile (safe bulk-delete).      |
| `ForumThread` | `isDemoSeed` | Seeded demo thread.                         |
| `ForumReply`  | `isDemoSeed` | Seeded demo reply.                          |

Stable string primary keys for threads/replies live in `prisma/seed-demo-discussions.ts` (`DEMO_THREAD_IDS`, `DEMO_REPLY_IDS`). Demo users are upserted by **email** so re-seeding stays idempotent even if IDs differ.

## Demo accounts (credentials)

Password for all demo accounts (local / staging only): **`password123`**

| Display name | Handle          | Email                          |
|-------------|-----------------|--------------------------------|
| Nina Shah   | `nina_shift`    | `nina.shift@demo.carasta.com`  |
| Marcus Cole | `marcus_torque` | `marcus.torque@demo.carasta.com` |
| Elena Ruiz  | `elena_lap`     | `elena.lap@demo.carasta.com`   |
| Kai Okada   | `kai_horo`      | `kai.horo@demo.carasta.com`    |

Profiles resolve at **`/u/[handle]`** (canonical public profile route).

## Seeded threads (web URLs)

After `npx prisma db seed`, browse:

1. **Mechanics Corner → General**  
   Thread: *First HPDE weekend of the season — what am I forgetting?*  
   `/discussions/mechanics-corner/general/demo_thread_hpde_first_season`

2. **Mechanics Corner → Diagnostics**  
   Thread: *Intermittent idle dip after cold start (E9x N54)*  
   `/discussions/mechanics-corner/diagnostics/demo_thread_idle_dip_e9x`

3. **Gear Interests → Watches**  
   Thread: *Daily-driver watches that survive track gloves?*  
   `/discussions/gear-interests/watches/demo_thread_watches_track_gloves`

Each thread includes **two replies** from other demo authors.

## UI behavior

- Thread and category pages render author **`@handle`** as a **link** to `/u/[handle]`.
- Demo threads show a **Demo content** banner on the thread page (in addition to DB flags).

## Cleanup (Postgres)

When you are ready to remove demo-only rows (adjust table names if your schema differs):

```sql
DELETE FROM "ForumReply" WHERE "isDemoSeed" = true;
DELETE FROM "ForumThread" WHERE "isDemoSeed" = true;
DELETE FROM "User" WHERE "isDemoSeed" = true;
```

Run in a transaction in production; verify counts first. Do **not** delete real users who happen to share a handle — the demo users use the `@demo.carasta.com` email domain and `isDemoSeed = true`.

## Operational notes

- `ensureDemoDiscussionSeed` runs on **every** `prisma db seed`, including when the heavy auction seed is skipped (existing auctions).
- Volume: **4 users**, **3 threads**, **6 replies** — enough for a credible walkthrough without noisy cleanup.

After Phase E, `ensureBadgesAndDiscussionReactions` also seeds **demo discussion reactions** and **UserBadge** rows for these accounts so reactions/badges render in the web UI (see `CARMUNITY_PHASE_E_DISCUSSIONS_EXPANSION.md`).
