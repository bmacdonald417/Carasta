# Carmunity Phase N — Mobile/web parity + notifications & alerts unification

## 1. Files created

- `CARMUNITY_PHASE_N_PARITY_AND_ALERTS.md` (this document)

## 2. Files modified

### Web (Next.js)

- `components/marketing/marketing-alerts-panel.tsx` — removed incorrect **“In-app only”** framing; clarified same queue as header bell and mobile roadmap.
- `components/notifications/NotificationDropdown.tsx` — subtitle + empty state + `aria-label` aligned to one-account / non–app-only inbox; mentions seller marketing when enabled.
- `components/carasta/CarastaLayout.tsx` — footer app download section retitled and copy added so web is not framed as secondary.
- `app/(app)/u/[handle]/marketing/page.tsx` — note that instant marketing alerts also appear in the header bell.

### Mobile (Flutter)

- `carmunity_app/lib/features/notifications/presentation/notifications_screen.dart` — replaced **“In-app list”** / Phase-2-only web API copy with unified inbox language.
- `carmunity_app/lib/features/home/presentation/home_screen.dart` — bell tooltip aligned with web terminology.
- `carmunity_app/lib/shared/services/push_notification_service.dart` — banner clarifies web bell is live today; push is additive.
- `carmunity_app/lib/features/profile/presentation/profile_screen.dart` — garage subtitles no longer imply “website only” in a second-class way; same profile framing.
- `carmunity_app/lib/features/profile/presentation/settings_placeholder_screen.dart` — settings parity with web Settings.
- `carmunity_app/pubspec.yaml` — package description: companion to carasta.com, same identity/APIs.

## 3. Biggest parity gaps found (audit summary)

| Area | Web | Mobile | Gap |
|------|-----|--------|-----|
| **Notifications list** | Live `GET /api/notifications` in header bell | Placeholder screen; no list yet | Functional parity — mobile still to wire API + auth session to same endpoints. |
| **Marketing alerts** | Correct data in bell + Marketing dashboard | Not surfaced in list UI | Exposure parity — copy was wrong on web (“in-app only”). |
| **Feed “Latest”** | Varies | Empty + banner (needs server sort) | Product gap — documented in mobile `home_screen.dart`. |
| **Garage editing** | Full web garage | Read-only / manage on web | Capability parity by design for now; copy softened to “same profile,” not “app is incomplete.” |
| **Auction bid/buy** | Full | Directed to web (Phase M held scope) | Intentionally unchanged in Phase N (no deeper auction/social work). |
| **Settings / Carmunity prefs** | `/settings` + Carmunity section | Placeholder | Deferred to future mobile screens. |
| **Discussions depth** | Full Gears / threads / replies | Forums tab + API gaps | Broader parity deferred; forums empty state already points to Carmunity feed. |

## 4. Parity model chosen

- **One identity:** `/u/[handle]` on web; same account on mobile (`carmunity_me` / session).
- **One notification model per account:** Header bell on web is canonical **today**; mobile bell is the **same conceptual inbox** and will consume the same APIs as the list ships.
- **Platform-adapted UI:** Layout differs (bottom nav vs sidebar); behaviors should be **equivalent**, not pixel-identical.
- **Web is not “second class”:** Marketing and footer copy must not imply notifications or social are app-exclusive.
- **Auctions:** No new auction features; existing “bid on web” mobile copy left as accurate product constraint.

## 5. Notification / alert wording changed

| Before | After |
|--------|--------|
| Marketing Alerts: “In-app only (same items as the header bell)…” | Same queue as **header bell**; mobile will use same APIs. |
| Notification empty state (implicit app-only) | Explicit: not a separate **“app-only”** inbox; includes **seller marketing** when enabled. |
| Dropdown title only “Notifications” | Subtitle: Carmunity + listing alerts; **aria-label** on bell. |
| Flutter “In-app list” + Phase 2 API note | **“Live queue (parity)”** + one-account explanation + web bell reference. |
| Push banner: push “not enabled yet” (ambiguous) | Clarifies **web bell is live**; push is additive. |
| Footer “Download the app” only | **“Carmunity on mobile”** + line that web is not lesser. |
| Marketing page digest line | Adds **instant alerts in header bell**. |

## 6. Features aligned in this phase

- **Copy / UX alignment** only (no new API routes, no new notification transport).
- **Marketing alerts panel** and **notification dropdown** consistent with actual web behavior.
- **Flutter** notification, home bell tooltip, push banner, profile garage, settings placeholder, `pubspec` description.

## 7. Intentionally deferred

- Wiring Flutter `NotificationsScreen` to `GET /api/notifications` (requires stable mobile auth + pagination UX).
- Full garage edit on mobile.
- “Latest” feed sort parameter and mobile empty states for that tab.
- Dedicated `/notifications` page on web (bell-only today).
- Deeper discussions parity (thread composer, saved threads list in app, etc.).
- Auction/social crossover beyond existing Phase M linkage.

## 8. Recommended next phase (Phase O suggestion)

1. **Mobile notifications inbox:** implement `GET /api/notifications` + read/patch in app with infinite scroll; match web payload shaping.
2. **Mobile Carmunity settings:** mirror web `PATCH /api/user/carmunity-onboarding` + prefs read.
3. **Saved discussions in app:** surface saved threads list using existing web APIs if available, or add thin read-only API.
4. **Push:** bind FCM/Windows token to user; optional digest still email-based on web.

## Validation

Run from repo root:

```bash
npm run lint
npx tsc --noEmit
cd carmunity_app && flutter analyze
```

Confirm: no contradictory **“in-app only”** on web marketing alerts; mobile notification copy references unified model; identity remains `/u/[handle]` on web.
