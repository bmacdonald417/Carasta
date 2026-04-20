# Carmunity Phase K — Onboarding, growth loops, and empty-state polish

Phase K makes Carmunity **easier to enter** for new accounts, **richer when quiet**, and **simpler to share** — without new identity systems or breaking existing feed, discussions, moderation, or follows.

---

## 1. Files created

| Path | Role |
| --- | --- |
| `prisma/migrations/20260421120000_phase_k_carmunity_onboarding/migration.sql` | Adds `carmunityOnboardingCompletedAt` + `carmunityInterestPrefs`; backfills completion for existing users. |
| `lib/carmunity/onboarding-service.ts` | Space/category options, onboarding pack builder, prefs parse/save, completion. |
| `app/api/user/carmunity-onboarding/route.ts` | `GET` status; `PATCH` prefs + optional `complete`. |
| `components/carmunity/CarmunityOnboardingDialog.tsx` | Lightweight first-run dialog (interests, follows, starter threads). |
| `components/profile/ProfileCarmunitySetupStrip.tsx` | Owner guidance when posts + garage + activity are still empty. |
| `CARMUNITY_PHASE_K_ONBOARDING_AND_GROWTH.md` | This document. |

---

## 2. Files modified

| Path | Summary |
| --- | --- |
| `prisma/schema.prisma` | `User.carmunityOnboardingCompletedAt`, `User.carmunityInterestPrefs` (JSON). |
| `lib/forums/discussions-discovery.ts` | `listThreadsForPreferredGears` for same-Gear surfacing. |
| `components/ui/share-buttons.tsx` | Optional `triggerClassName` for Carmunity-styled triggers. |
| `app/(marketing)/explore/page.tsx` | Loads onboarding state + pack; passes into `CommunityFeed`. |
| `app/(marketing)/explore/community-feed.tsx` | Mounts `CarmunityOnboardingDialog` when appropriate. |
| `app/(marketing)/discussions/page.tsx` | “Threads in your Gears” when prefs contain `gearSlugs`. |
| `app/(marketing)/discussions/.../[threadId]/page.tsx` | `ShareButtons` on every thread (path + title). |
| `app/(app)/u/[handle]/page.tsx` | Profile share; setup strip; richer saved-empty card. |
| `components/carmunity/FeedEmptyState.tsx` | Premium copy + CTAs for trending/following. |
| `components/carmunity/ProfilePostsEmpty.tsx` | Aligned empty state + Discussions secondary CTA. |
| `components/profile/ProfileGaragePreviewGrid.tsx` | Garage empty state polish. |
| `components/notifications/NotificationDropdown.tsx` | Notifications empty panel + CTAs. |

---

## 3. Onboarding behavior

- **Who sees it**: Users with `carmunityOnboardingCompletedAt == null`. Migration sets the column to **now** for all **existing** rows so deploy does not mass-open the dialog; **new signups** after migrate get `null` until they finish or skip.
- **Where**: First visit to **`/explore`** opens **`CarmunityOnboardingDialog`** when a server-built **`onboardingPack`** is present.
- **Steps (single dialog)**:
  1. **Gears** — toggle up to 8 `ForumSpace` slugs.
  2. **Lower Gears (optional)** — per selected Gear, toggle categories (capped at 16 total).
  3. **Follow** — one-tap `POST /api/user/follow` for suggested active users.
  4. **Starter threads** — links into discussions.
- **Finish**: **`PATCH /api/user/carmunity-onboarding`** with `{ gearSlugs, lowerCategories, complete: true }` saves prefs then sets **`carmunityOnboardingCompletedAt`**.
- **Skip**: **`PATCH`** with `{ complete: true }` only — closes the loop without persisting interests.

---

## 4. Empty states improved

- **Following / Trending feed** — `FeedEmptyState` copy + primary/secondary CTAs; following variant nudges Discussions for follows.
- **Profile posts** — `ProfilePostsEmpty` aspirational layout + Discussions path for owners.
- **Profile garage** — dashed copper border, clearer hierarchy, stronger owner CTA.
- **Saved discussions (own profile)** — framed empty card with Discussions + Following links.
- **Notifications** — “All caught up” panel with Carmunity + Discussions buttons.

---

## 5. Discovery improvements

- **`listThreadsForPreferredGears`** — recent non-hidden threads in active spaces whose **slug is in saved `gearSlugs`**.
- **Discussions landing** — signed-in users with prefs see **“Threads in your Gears”** above the existing discovery stack.

---

## 6. Sharing improvements

- **`ShareButtons`** accepts **`triggerClassName`** for copper-outline Carmunity styling.
- **Thread page** — share dropdown for **all visitors** (copy + social) using canonical thread path.
- **Profile** — share dropdown for **`/u/[handle]`** next to follow/safety actions.

---

## 7. What was deferred

- **Re-open onboarding / edit interests UI** — prefs are stored; changing them again is API-capable but not exposed in product UI yet.
- **Referral codes, attribution, growth analytics** — out of scope.
- **Push / email nudges** — not added.
- **Per-Gear onboarding analytics** — not instrumented.

---

## 8. Recommended Phase L

- **Preference editor** in Settings (Gears / Lower Gears) wired to the same JSON field.
- **Quality gates** for onboarding suggestions (diversity, locale, block-aware lists in-dialog).
- **Share previews** (Open Graph) for threads and profiles.
- **Light metrics** on onboarding completion and skip rates.

---

## Validation

```bash
npx prisma generate
npm run lint
npx tsc --noEmit
```

Apply the Phase K migration (or `db push`) before relying on onboarding columns in production.
