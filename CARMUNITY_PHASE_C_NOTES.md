# Carmunity Phase C — Feed + card redesign

Phase C aligns the Carmunity **feed**, **post cards**, **post detail**, and **light composer** touches on web and Flutter with the Phase B token system (copper accent, `auctionSignal` red only for auction urgency). Data flows and APIs were not changed.

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_C_NOTES.md` | This document (Phase C deliverable). |

## 2. Files modified

### Web (Next.js)

| File | Summary |
|------|---------|
| `app/(marketing)/explore/community-feed.tsx` | Feed card hierarchy: author row → immersive media → caption → action row; relative time helper; spacing/rhythm; skeleton/empty states; Phase B–aligned styling. |
| `app/(marketing)/explore/create-post-form.tsx` | Carmunity-by-Carasta composer header, copy, primary Post control (copper, not performance red). |
| `app/(marketing)/explore/page.tsx` | Explore shell vertical padding for feed rhythm. |
| `app/(marketing)/explore/post/[id]/page.tsx` | Post detail aligned with feed: author → media → body → engagement + share; comment list spacing and borders. |

### Flutter (Carmunity app)

| File | Summary |
|------|---------|
| `carmunity_app/lib/features/home/presentation/widgets/feed_post_card.dart` | Card hierarchy mirroring web; edge-to-edge media; divider + action row outside main `InkWell` tap target; auction chip uses `AppColors.auctionSignal`; `FontFeature.tabularFigures` for counts. |
| `carmunity_app/lib/features/home/presentation/home_screen.dart` | Increased `ListView.separated` gap between cards (`AppSpacing.lg`) for clearer feed rhythm. |
| `carmunity_app/lib/features/home/presentation/post_detail_screen.dart` | Same hierarchy as feed card (author, auction chip, media-first, body, engagement); comments use lighter separators instead of heavy boxed tiles; comment field styling. |
| `carmunity_app/lib/features/create/presentation/create_post_screen.dart` | Light “Share to Carmunity / by Carasta” app bar + refreshed caption hint. |

## 3. Web feed surfaces updated

- **`/explore`** — `CommunityFeed` post list, loading/empty states, and tabbed feed chrome.
- **Composer** — `CreatePostForm` embedded in the explore experience.
- **Post detail** — `/explore/post/[id]` page layout and comments presentation.

No changes were made to unrelated admin or marketing routes beyond the explore Carmunity slice above.

## 4. Flutter feed surfaces updated

- **Home feed** — `HomeScreen` → `_FeedBody` list spacing and `FeedPostCard` tiles.
- **Post detail** — `PostDetailScreen` main post block and comments section.
- **Create post** — `CreatePostScreen` app bar and primary field copy only.

## 5. Card hierarchy decisions

Shared order (web + Flutter):

1. **Author row** — Avatar, display name, optional **Auction** chip (`auctionSignal` only when `auctionId` is set), secondary line `@handle · relative time`.
2. **Media** — Full-width inside the card, **4:3** (web also uses `sm:aspect-video` on detail for a slightly wider desktop frame).
3. **Caption / body** — Relaxed line height, readable truncation in feed (`line-clamp` / `maxLines`).
4. **Metadata** — Folded into author row (time) and engagement counts in the action row; no extra noisy meta strip.
5. **Social action row** — Icon-first like + counts, comment icon + count; **likes** use **copper accent** when active, not signal red. Signal red remains for auction chip only.

Flutter: the **body** (author + media + caption) is wrapped in `InkWell` for navigation; **like** is isolated so it does not fire the card `onTap`.

## 6. Intentionally deferred

- Full **auction** module redesign (detail, lists, bidding UX).
- **Comment threading**, reactions, or notification depth.
- **Create flow** overhaul (drafts, multi-image, rich text, scheduling).
- **Global** marketing site or **admin** dashboards.
- Backend **Latest** tab / chronological sort (still client-documented as needing API support).
- Shared **design tokens file** consumed by both platforms (tokens are reused conceptually; no new cross-repo codegen).

## 7. Recommended Phase D

**Phase D — Carmunity motion, empty states, and cross-surface consistency**

- Subtle **motion** on feed insert/remove and like feedback (respect `prefers-reduced-motion` on web).
- **Empty / error** illustrations and copy aligned to Carmunity voice on both clients.
- **Profile / @handle** post grids using the same card component or a compact variant.
- Optional: extract a **single documented token map** (CSS variables + Dart `AppColors`) from Phase B notes into one short “source of truth” doc for designers and implementers.

## Validation

From repo root (web) and `carmunity_app` (Flutter), run:

- `npm run lint` — **passed** (existing unrelated `<img>` warnings elsewhere in the repo).
- `npx tsc --noEmit` — **passed**.
- `flutter analyze` (in `carmunity_app`) — run on a machine with Flutter on `PATH`; the automation shell used for Phase C did not have `flutter` available, but edited Dart files were checked with the IDE analyzer (no issues reported).

Confirm: feed fetch/like/comment paths unchanged; auction posts still readable with red limited to urgency chip; no broad restyle outside Carmunity feed/detail/create touchpoints listed above.
