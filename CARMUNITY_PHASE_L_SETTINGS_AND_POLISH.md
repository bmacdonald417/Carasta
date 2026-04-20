# Carmunity Phase L — Settings, personalization, share polish, analytics

## 1. Files created

- `app/(app)/settings/carmunity-settings-section.tsx` — client UI for editing Gears / Lower Gears and revisiting onboarding.
- `app/api/carmunity/event/route.ts` — authenticated POST endpoint for lightweight client events (`thread_open_feed`, `share_action`).
- `lib/forums/discussion-recommendations.ts` — (from earlier in Phase L) improved suggested users + discovery thread mix helpers.
- `lib/carmunity/carmunity-analytics.ts` — structured JSON log lines for server-side events.

## 2. Files modified

- `lib/carmunity/onboarding-service.ts` — onboarding pack uses improved suggestions + thread mix; optional prefill from prefs; `resetCarmunityOnboarding`.
- `app/api/user/carmunity-onboarding/route.ts` — `resetOnboarding`; analytics on complete / reset.
- `app/api/user/follow/route.ts` — log `follow_user` on new follow.
- `app/api/discussions/threads/[threadId]/subscribe/route.ts` — log `save_thread` on first save.
- `app/(app)/settings/page.tsx` — loads taxonomy + prefs; renders Carmunity settings section.
- `app/(marketing)/discussions/page.tsx` — viewer-aware suggested users + trending/discovery mix; dedupe vs “your Gears” strip.
- `components/carmunity/CarmunityOnboardingDialog.tsx` — prefill from saved prefs; copy points to Settings.
- `app/(marketing)/explore/community-feed.tsx` — `thread_open_feed` for Explore trending strip + following thread/reply cards.
- `components/ui/share-buttons.tsx` — optional `carmunityShareMeta`; fires `share_action` after copy / social targets.
- `app/layout.tsx` — `metadataBase` from `getPublicSiteOrigin()` for correct absolute OG URLs.
- `app/(marketing)/discussions/[gearSlug]/[lowerGearSlug]/[threadId]/page.tsx` — richer `generateMetadata` (OG/Twitter); cleaner share description; share analytics meta when signed in.
- `app/(app)/u/[handle]/page.tsx` — profile `generateMetadata` (OG/Twitter); polished share title/description; share analytics when signed in.

## 3. Settings behavior

- **Location:** `/settings`, below the main profile form.
- **Gears / Lower Gears:** Same JSONB as onboarding (`carmunityInterestPrefs`) via `PATCH /api/user/carmunity-onboarding` (no new models).
- **Save:** Sends `gearSlugs` + `lowerCategories`; `router.refresh()` so discovery picks up changes on next load.
- **Revisit onboarding:** `PATCH` with `resetOnboarding: true` clears `carmunityOnboardingCompletedAt`, then navigates to `/explore` where the existing dialog flow runs. Prefs remain unless the user changes them in the dialog or settings.
- **Onboarding dialog prefill:** When the pack is built for a signed-in user, existing prefs seed chips so “revisit” feels intentional.

## 4. Recommendation improvements

- **Suggested users (signed-in):** `listSuggestedDiscussionUsersForViewer` excludes self, blocks, and already-followed; boosts activity in the viewer’s preferred Gears (last 30d); then sorts by activity score. Used in onboarding pack and `/discussions` “Suggested voices”.
- **Threads:** `listDiscoveryThreadMixForViewer` merges preferred-Gear recent threads with global trending, de-duped by thread id. On `/discussions`, signed-in users get this mix for the main trending-style list; threads already shown under “Threads in your Gears” are filtered out to reduce duplication.
- **Onboarding starter threads:** Built from the same discovery mix instead of raw global trending only.

## 5. Share preview behavior

- **`metadataBase`** in root layout ensures relative image paths resolve for crawlers when used.
- **Threads:** `generateMetadata` sets title, description snippet (whitespace-normalized), canonical URL, `openGraph` (`article`), and `twitter` summary card metadata.
- **Profiles:** `generateMetadata` sets display title (`Name (@handle)` or `@handle`), bio or fallback description, canonical URL, `openGraph` `profile`, optional image when `avatarUrl` / `image` is present (absolute URL for relative paths).
- **In-app share payloads:** Thread share description uses Gear + Lower Gear labels (no raw URL in the text). Profile share uses cleaned bio snippet and a readable title.

## 6. Analytics events added

Server logs via `logCarmunityEvent` (JSON to stdout in prod, `console.debug` in dev):

| Event | Where |
|--------|--------|
| `carmunity_onboarding_completed` | `PATCH` carmunity-onboarding when `complete: true` |
| `carmunity_onboarding_reset` | `PATCH` when `resetOnboarding: true` |
| `follow_user` | `POST` `/api/user/follow` on first follow |
| `save_thread` | `POST` subscribe on first subscription row |

Client + server (`POST /api/carmunity/event`, then logged):

| Event | Where |
|--------|--------|
| `thread_open_feed` | Explore trending strip; following thread/reply cards (signed-in only) |
| `share_action` | Share menu copy / X / Facebook / LinkedIn when `carmunityShareMeta` is set (signed-in viewers on thread + profile share buttons) |

## 7. Deferred / out of scope

- Full analytics product (dashboards, funnels, third-party SDKs).
- Dynamic OG image generation (e.g. `@vercel/og` cards) — only practical metadata + existing avatars.
- ML-based ranking or large offline recommendation jobs.
- Server-side logging of every anonymous share click (client events require a session by design).

## 8. Recommended Phase M

- **Notifications for prefs:** optional nudge when a user has zero Gears selected after N days.
- **Quality guardrails:** rate limits on `POST /api/carmunity/event`; richer allowlist or sampling in production.
- **Feed modules:** reuse `listDiscoveryThreadMixForViewer` in additional home/explore surfaces with telemetry on CTR.
- **Settings:** inline preview of “what discovery will feel like” (e.g. sample threads) before save.

## Validation

Run from repo root:

```bash
npm run lint
npx tsc --noEmit
```

Manual checks: edit interests in Settings → confirm `/discussions` “For you” / mix updates after refresh; Revisit onboarding → Explore dialog; share a thread/profile and confirm logs; save thread / follow user once and confirm single event per action.
