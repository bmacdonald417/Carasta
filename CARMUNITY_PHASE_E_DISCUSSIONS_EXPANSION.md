# Phase E — Carmunity Discussions Social Expansion

This document records the **Phase E** implementation: taxonomy scale-up (Gears / Lower Gears), Discussions UX, unified identity, profile activity, reactions foundation, badges foundation, and premium UI alignment using existing Carmunity tokens (`styles/carmunity-tokens.css` — copper `primary` for social; auction red remains separate).

> Note: `CARMUNITY_DESIGN_SYSTEM_DIRECTION.md` was not present in the repo at implementation time; styling follows the established `carasta-theme` + `carmunity-tokens` direction.

---

## 1. Files created

| Path | Purpose |
|------|---------|
| `prisma/discussion-taxonomy-data.ts` | 20 Gears × 5–8 Lower Gears from `CARMUNITY_DISCUSSIONS_TAXONOMY.md` |
| `prisma/seed-taxonomy-gears.ts` | Idempotent `ensureTaxonomyGearsFromDoc` upserts |
| `prisma/seed-badges-reactions.ts` | Badge definitions + demo `UserBadge` + demo thread/reply reactions |
| `lib/discussions/discussion-paths.ts` | Canonical `/discussions/[gear]/[lower]/[threadId]` helper |
| `components/ui/textarea.tsx` | Shadcn-style textarea for reply composer |
| `components/discussions/DiscussionReactionSummary.tsx` | Reaction totals + compact breakdown |
| `components/discussions/DiscussionAuthorBadges.tsx` | Copper pill badges (thread header + profile) |
| `components/discussions/DiscussionThreadReplyComposer.tsx` | Client reply composer → API |
| `components/profile/CarmunityActivitySection.tsx` | Profile “Carmunity Activity” list |
| `app/(marketing)/discussions/[gearSlug]/page.tsx` | Gear page: Lower Gears + recent threads across Gear |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/page.tsx` | Lower Gear page: sort tabs + thread rows |
| `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` | Thread detail: OP badges, reactions, replies, composer |
| `app/api/discussions/threads/[threadId]/replies/route.ts` | Authenticated POST reply |
| `CARMUNITY_PHASE_E_DISCUSSIONS_EXPANSION.md` | This document |

---

## 2. Files modified

| Path | Changes |
|------|---------|
| `prisma/schema.prisma` | `DiscussionReactionKind` enum; `ForumThreadReaction`, `ForumReplyReaction`, `Badge`, `UserBadge`; relations on `User`, `ForumThread`, `ForumReply` |
| `prisma/seed.ts` | Runs taxonomy seed, then demo discussions, then badges/reactions |
| `lib/forums/forum-service.ts` | `DiscussionReactionTotals`, `DiscussionSortMode`, `getLowerGearBySlugs`, `listRecentThreadsForGear`, sort modes, reaction aggregation, author badges in thread detail |
| `app/(marketing)/discussions/page.tsx` | Gears / Lower Gears copy; premium card chrome |
| `app/(app)/u/[handle]/page.tsx` | Profile badges; Carmunity Activity (threads + replies); queries |
| `CARMUNITY_DISCUSSIONS_AND_SOCIAL_EXPANSION_PLAN.md` | (Optional cross-links maintained elsewhere) |

**Removed (route segment rename only — public URLs unchanged):**

- `app/(marketing)/discussions/[spaceSlug]/...` → replaced by `[gearSlug]/...` (same three-segment URL pattern).

---

## 3. Data model changes (additive)

### 3.1 `DiscussionReactionKind`

`LIKE | FIRE | WRENCH | MIND_BLOWN | LAUGH | RESPECT`

### 3.2 `ForumThreadReaction`

- `threadId`, `userId`, `kind`, timestamps  
- `@@unique([threadId, userId, kind])`  
- Does **not** replace feed `Like` on `Post`.

### 3.3 `ForumReplyReaction`

- Same pattern for replies.

### 3.4 `Badge` + `UserBadge`

- `Badge`: slug, name, description, sortOrder  
- `UserBadge`: `userId`, `badgeId`, `awardedAt`, `@@unique([userId, badgeId])`  
- Award logic is **scaffold + demo assignment** only.

### 3.5 Existing demo flags

`User.isDemoSeed`, `ForumThread.isDemoSeed`, `ForumReply.isDemoSeed` preserved; demo banners/chips unchanged in behavior.

---

## 4. Reaction system structure

- **Storage**: separate tables for thread vs reply reactions (clear uniqueness + indexes).  
- **Aggregation**: `forum-service` batches `groupBy` for list views and thread detail.  
- **API**: `POST /api/discussions/threads/[threadId]/replies` for replies (session required).  
- **UI**: summary counts on thread list, gear-wide recent list, thread OP, and each reply row; composer footnote that full picker is **next phase**.

---

## 5. Badge system structure

- **Storage**: `Badge` catalog + `UserBadge` join.  
- **Demo seed**: five badge types + assignments to demo users (`seed-badges-reactions.ts`).  
- **UI**: `DiscussionAuthorBadges` on thread OP and profile header.

---

## 6. Activity feed implementation

- **Queries** on `/u/[handle]`: latest 10 `ForumThread` and 10 `ForumReply` for the profile user (parallel with posts/garage).  
- **Merge**: combined, sorted by `createdAt` desc, capped at **18** items.  
- **Links**: each item links to the thread URL via `discussionThreadPath`.  
- **Pagination**: intentionally omitted (Phase F).

---

## 7. Gear / Lower Gear counts

- **Taxonomy doc gears seeded**: **20** (`TAXONOMY_GEARS` in `prisma/discussion-taxonomy-data.ts`).  
- **Lower Gears per gear**: **5–8** each (per taxonomy tables).  
- **Legacy gears retained**: `mechanics-corner`, `gear-interests` (existing demo threads remain valid).  
- **Total gears in DB after seed**: **22** (2 legacy + 20 taxonomy), all `ForumSpace` rows.

---

## 8. UX improvements summary

- **Terminology**: UI reads **Gear** / **Lower Gear**; Prisma models remain `ForumSpace` / `ForumCategory`.  
- **Gear hub**: description card, Lower Gear list, **recent threads across the whole Gear**.  
- **Lower Gear hub**: **Trending / New / Top** sort (Top = reply count; Trending = last activity).  
- **Thread rows**: author `@handle` → `/u/[handle]`, time, replies, **reactions**, demo chip.  
- **Thread detail**: OP badges, reaction panel, premium card layout, **reply composer** (live when signed in).  
- **Profile**: badges + **Carmunity Activity** section.

---

## 9. What remains for Phase F (suggested focus)

1. **Reactions UX**: picker, optimistic UI, dedupe rules, rate limits, analytics.  
2. **Ranking quality**: true “Top” (time-windowed score), personalization, spam resistance.  
3. **Pagination / infinite scroll** for thread lists and activity.  
4. **@mentions** parsing and linking in thread/reply bodies (still single identity `/u/[handle]`).  
5. **Notifications** for replies/reactions.  
6. **Moderation** tools and admin surfaces.  
7. **Optional**: Prisma model rename behind migration (`ForumSpace` → `Gear`) — **not** required for product success.

---

## 10. Validation commands run

- `npx prisma generate`  
- `npx tsc --noEmit`  
- `npm run lint`  

Deployers must run **`npx prisma db push`** (or equivalent migration workflow) before `prisma db seed`.
