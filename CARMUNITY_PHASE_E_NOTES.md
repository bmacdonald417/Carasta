# Carmunity Phase E — Motion, micro-interactions, empty states

Phase E adds **subtle motion** (with `prefers-reduced-motion` / `motion-safe` fallbacks), **loading skeletons**, **aspirational empty states** with CTAs, **tighter deep links** between feed ↔ post ↔ profile ↔ garage, and light **settings parity** on mobile — without new heavy animation libraries or broad page redesigns.

## 1. Motion changes

### Web

| Area | Change |
|------|--------|
| **Global** | New `styles/carmunity-motion.css` (imported from `app/globals.css`): `.carmunity-feed-card` hover (translate + shadow, reduced: shadow/opacity only), `.carmunity-profile-enter` header fade-up, `.carmunity-skeleton-pulse` opacity loop, `.carmunity-nav-link` active underline transition, **auction strip** animation disabled when reduced motion. |
| **Feed** | `PostCard` uses `usePrefersReducedMotion()` — Framer `initial`/`transition` shortened or skipped; card gets `carmunity-feed-card`. |
| **Tabs** | Explore feed `TabsTrigger` gets `duration-150` and clearer active/inactive color. |
| **Garage cards** | `GarageCard3D` respects reduced motion (no 3D tilt, lighter hover, shorter list stagger); image hover uses `motion-safe:`. |
| **Buttons** | `components/ui/button.tsx` uses `motion-safe:active:scale-[0.98]` so press micro-motion respects OS preference. |
| **Header nav** | `CarastaLayout` app links use `carmunity-nav-link` + `data-active` for underline animation. |

### Flutter

| Area | Change |
|------|--------|
| **Feed card** | `InkWell` on post body: copper-tinted `splashColor` / `highlightColor`, rounded splash bounds. |
| **Page transitions** | `ThemeData.pageTransitionsTheme` set to `FadeUpwardsPageTransitionsBuilder` (Android/Linux/Windows) + `CupertinoPageTransitionsBuilder` (iOS/macOS). |
| **Home loading** | Replaced spinner with three `FeedSkeletonCard` placeholders matching card geometry. |
| **Forums loading** | Three `_ForumSkeletonRow` placeholders; space cards get tuned `InkWell` splash. |

## 2. Loading / skeleton changes

| Surface | Implementation |
|---------|------------------|
| **Web explore feed** | Existing skeleton blocks now use `carmunity-skeleton-pulse` + `carmunity-feed-card` on shell. |
| **Web profile route** | New `app/(app)/u/[handle]/loading.tsx` — header, stats, actions, garage strip, post card skeletons. |
| **Flutter home** | `FeedSkeletonCard` widget (`feed_skeleton_card.dart`). |
| **Flutter forums** | `_ForumSkeletonRow` in `forums_screen.dart`. |

## 3. Empty states added / upgraded

| Surface | Summary |
|---------|---------|
| **Explore feed** | New `components/carmunity/FeedEmptyState.tsx` — headline + guidance + primary/secondary CTAs (sign-in vs write post, Trending vs Forums). |
| **Profile posts** | `components/carmunity/ProfilePostsEmpty.tsx` — owner vs visitor copy + links to composer anchor, garage, explore. |
| **Profile garage preview** | `ProfileGaragePreviewGrid` empty state: copy + **Add a car** (own profile) + **Open garage**; `isOwnProfile` prop from profile page. |
| **Garage page** | Rich empty panel + CTAs (add / profile / explore). |
| **Dream garage** | Matching aspirational empty + CTAs. |
| **Post detail comments** | Empty thread CTA; sign-in button when logged out. |
| **Flutter forums** | Empty spaces: icon + copy + **Open Carmunity feed** + **Draft a thread**. |

## 4. Deep link / nav polish

| Link | Status |
|------|--------|
| Feed author → `/u/[handle]` | Already present; cards use `carmunity-feed-card`. |
| Post detail → profile + garage | New footer row: **View profile** · **Garage**. |
| Composer anchor | `CreatePostForm` `id="carmunity-create-post"` + `scroll-mt-28` for hash scroll from empty states. |
| Profile posts empty → `#carmunity-create-post` | `ProfilePostsEmpty` + `FeedEmptyState` use `/explore#carmunity-create-post` or `<a href="#carmunity-create-post">`. |
| Explore intro → Forums | `carmunity-nav-link` class on Forums link. |
| Web profile (own) | **Settings** button → `/settings` alongside Carmunity. |
| Flutter You | **Settings** outlined action in profile action row (`AppRoutes.settings`). |

## 5. Files created

- `styles/carmunity-motion.css`
- `lib/hooks/use-prefers-reduced-motion.ts`
- `components/carmunity/FeedEmptyState.tsx`
- `components/carmunity/ProfilePostsEmpty.tsx`
- `app/(app)/u/[handle]/loading.tsx`
- `carmunity_app/lib/features/home/presentation/widgets/feed_skeleton_card.dart`
- `CARMUNITY_PHASE_E_NOTES.md`

## 6. Files modified (non-exhaustive highlights)

- `app/globals.css` — import motion stylesheet.
- `app/(marketing)/explore/community-feed.tsx` — reduced motion, empty state, skeleton polish, tabs.
- `app/(marketing)/explore/create-post-form.tsx` — `id` + `scroll-mt-28`.
- `app/(marketing)/explore/page.tsx` — Forums link class.
- `app/(marketing)/explore/post/[id]/page.tsx` — card motion class, profile/garage links, comments empty.
- `app/(app)/u/[handle]/page.tsx` — profile enter class, Settings, `ProfilePostsEmpty`, garage `isOwnProfile`.
- `app/(app)/u/[handle]/garage/page.tsx`, `dream/page.tsx` — empty state CTAs.
- `components/profile/ProfilePostPreview.tsx`, `ProfileGaragePreviewGrid.tsx`
- `components/garage/GarageCard3D.tsx`, `components/carasta/CarastaLayout.tsx`, `components/ui/button.tsx`
- `carmunity_app/lib/features/home/presentation/home_screen.dart`, `feed_post_card.dart`
- `carmunity_app/lib/features/forums/presentation/forums_screen.dart`
- `carmunity_app/lib/features/profile/presentation/profile_screen.dart`
- `carmunity_app/lib/app/theme/app_theme.dart`

## 7. Intentionally deferred

- Per-item list stagger / hero animations on long feeds (performance).
- Shared `prefers-reduced-motion` hook on Flutter (relies on `MediaQuery.disableAnimations` / platform; no custom hook file after cleanup).
- Full shimmer dependency (web uses lightweight opacity pulse only).
- Custom `GoRouter` page `CustomTransitionPage` for every route.

## 8. Recommended Phase F

**Phase F — Notifications + engagement depth**

- Unified notification entry styling (web dropdown + Flutter screen) with same motion tokens.
- Inline “new activity” affordances on feed cards (subtle dot / badge) without noisy counts.
- Optional: saved posts / bookmarks with the same empty-state language as Phase E.

## Validation

- `npm run lint` — passed (existing unrelated `<img>` warnings).
- `npx tsc --noEmit` — passed.
- `flutter analyze` — run locally in `carmunity_app` when Flutter is on `PATH`.
