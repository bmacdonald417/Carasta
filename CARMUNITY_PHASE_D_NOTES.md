# Carmunity Phase D — Profile + garage redesign

Phase D elevates **public web profiles** (`/u/[handle]`), **garage / dream** collection pages, **follow** affordances, and the **Flutter “You” profile** to match Phase B tokens and Phase C card language—without new backend systems, fake data, or changes to unrelated admin/marketing surfaces.

## 1. Files created

| File | Purpose |
|------|---------|
| `components/profile/ProfilePostPreview.tsx` | Read-only Carmunity post shell for profile (matches explore card rhythm; auction chip uses `--performance-red`). |
| `components/profile/ProfileGaragePreviewGrid.tsx` | Image-first garage preview grid on profile (empty state + up to 6 real cars). |
| `carmunity_app/lib/features/profile/presentation/widgets/profile_post_preview_tile.dart` | Flutter post preview tiles aligned with `FeedPostCard` (read-only engagement row). |
| `CARMUNITY_PHASE_D_NOTES.md` | This document. |

## 2. Files modified

### Web

| File | Summary |
|------|---------|
| `app/(app)/u/[handle]/page.tsx` | New hierarchy: premium header + stat strip (posts, followers, following, garage, listings, bids), action row, **Garage** spotlight with preview grid, **Posts** with `ProfilePostPreview`, TrustPanel + won auctions restyled (copper price emphasis, border tokens). Removed unused `auctionsParticipated` query. |
| `app/(app)/u/[handle]/garage/page.tsx` | Collection-style header, `default` “Add car”, dashed empty state, wider container, `Profile`-back link. |
| `app/(app)/u/[handle]/dream/page.tsx` | Same visual language as garage (header, primary add CTA, empty state, 4:3 media). |
| `app/(app)/u/[handle]/follow-button.tsx` | **Follow** uses `variant="default"` (copper / primary); following state `secondary`, label **Following**. |
| `app/api/carmunity/me/route.ts` | `recentPosts` now include `createdAt`, `auctionId`, `likeCount`, `commentCount` for richer mobile previews (additive JSON). |

### Flutter

| File | Summary |
|------|---------|
| `carmunity_app/lib/features/profile/presentation/profile_screen.dart` | Identity hub: shell card header, stat strip, action row (feed / session / saved), garage showcase card, stacked `ProfilePostPreviewTile` list. |
| `carmunity_app/lib/shared/dto/carmunity_me_dto.dart` | `CarmunityRecentPostDto` extended with optional `createdAt`, `auctionId`, counts (backward compatible). |

### Shared UI (garage cards)

| File | Summary |
|------|---------|
| `components/garage/GarageCard3D.tsx` | Removed external placeholder image URL; **no-photo** uses on-card muted state; hover uses **primary** (copper) not signal red; tokens for borders/text; 4:3 hero. |

## 3. Profile layout changes (web)

1. **Header** — Larger avatar with ring, “Carmunity” eyebrow, display name as primary title, `@handle` secondary, bio/location/social unchanged in role but clearer spacing inside a **glass-style** shell.
2. **Stats** — Six-cell strip: **Posts** first (was missing from the old grid), then followers/following, garage, listings, bids.
3. **Actions** — Follow (when applicable), **Open Carmunity** (own profile), Garage / Dream / Listings / Marketing as outline buttons.
4. **Garage** — Section title + “View all”; real-car **preview grid** (or honest empty CTA).
5. **Posts** — Recent author posts from Prisma; each tile links to `/explore/post/[id]` with the same card skeleton as the feed.

## 4. Garage presentation changes

- **Profile**: compact **portfolio grid** of real vehicles (image or text fallback when no photo).
- **Garage page**: typography-led **collection** header, improved empty state, Phase B primary for add CTA.
- **GarageCard3D**: no fake remote placeholder image; copper-adjacent hover; theme-aligned borders and body copy.

## 5. Alignment between web and Flutter

| Dimension | Web | Flutter |
|-----------|-----|---------|
| Header | Shell card + avatar + name + @handle + bio | `_ProfileShellCard` + same hierarchy |
| Stats | 6-column strip (3 on narrow) | 3-tile strip (posts / followers / following) |
| Actions | Button row | `OutlinedButton` row (feed, session, saved) |
| Garage | Real preview grid + link | Showcase card + count + navigate to garage route |
| Posts | `ProfilePostPreview` (read-only stats) | `ProfilePostPreviewTile` (same meta/media/footer pattern) |

Flutter garage remains a **placeholder route** until APIs expose cars to the app; the **UI** now treats garage as a first-class “collection” surface.

## 6. What was deferred

- **Per-car detail** routes from garage cards (still link to garage list).
- **Flutter garage** full data wiring (requires garage API + models).
- **Public profile API** for the mobile app (today only `/api/carmunity/me` for the signed-in user).
- **Edit profile** in-app / on web from profile header (no dedicated route surfaced).
- **Grid density controls** (e.g. 2 vs 3 columns) and saved layout prefs.

## 7. Recommended Phase E

**Phase E — Motion, empty states, and cross-linking**

- Respectful **motion** on profile post list and garage grid (web: Framer; Flutter: implicit animations).
- **Empty states** with Carmunity copy + single primary CTA (post something / add car / open web).
- **Deep links** from feed author row → profile and back; optional “Posts” tab on web profile for pagination.
- **Settings / edit profile** entry surfaced consistently from profile header on both clients.

## Validation

- `npm run lint` — passed (existing unrelated `<img>` warnings only).
- `npx tsc --noEmit` — passed.
- `flutter analyze` — run locally when Flutter is on `PATH` (not available in the Phase D automation shell).
