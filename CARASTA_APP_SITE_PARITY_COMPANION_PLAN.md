# Carasta App / Site Parity Companion Plan

## Executive Summary
Carasta should not pursue naive parity between the website and the app. The right goal is **shared product identity, shared system logic where it matters, and platform-specific expression where it helps usability**.

The website is evolving into a stronger public-facing story and a deeper seller/workflow surface. The app already reflects key Carmunity and auction concepts, but it is narrower in scope today. That is acceptable in the short term as long as the product language, navigation concepts, identity model, and important behavior stay aligned.

The key parity conclusion from this pass is:
- `Carmunity`, `Discussions/Forums`, `Auctions`, `Profiles`, and `Notifications` should remain **shared conceptually** across site and app.
- `Messages`, `Garage depth`, and especially `Seller tools / marketing workspace` are currently **not at equal maturity** and should remain intentionally web-first for now.
- If the site changes first, the app should not mirror layout or IA literally. It should instead inherit the updated product vocabulary, object model, onboarding concepts, empty-state language, and eventually assistant/help affordances where appropriate.

The next safe implementation phase after this planning pass remains:

**Homepage + public IA restructuring on web**, with a lightweight parity guardrail layer so the app does not drift conceptually while the site evolves.

## Current State Summary
### Web
The web product currently exposes:
- `Carmunity` at `/explore`
- `Discussions` at `/discussions`
- `Messages` at `/messages`
- user profiles at `/u/[handle]`
- `Garage` at `/u/[handle]/garage`
- `Sell`
- seller marketing at `/u/[handle]/marketing`
- notifications via header dropdown

Key relevant files:
- `components/carasta/CarastaLayout.tsx`
- `components/layout/AppSidebar.tsx`
- `components/layout/MobileBottomNav.tsx`
- `app/(marketing)/explore/page.tsx`
- `app/(marketing)/discussions/page.tsx`
- `app/(app)/messages/page.tsx`
- `app/(app)/u/[handle]/garage/page.tsx`
- `app/(app)/u/[handle]/marketing/page.tsx`

### App
The Flutter app currently exposes:
- `Carmunity` under `/home`
- `Forums` under `/forums`
- `Create`
- `Auctions`
- `You`
- notifications screen
- saved auctions
- settings placeholder for Carmunity onboarding/preferences
- garage placeholder

Key relevant files:
- `carmunity_app/lib/app/router/app_router.dart`
- `carmunity_app/lib/features/home/presentation/home_screen.dart`
- `carmunity_app/lib/features/notifications/presentation/notifications_screen.dart`
- `carmunity_app/lib/features/profile/presentation/garage_placeholder_screen.dart`
- `carmunity_app/lib/features/profile/presentation/settings_placeholder_screen.dart`

## Parity Principles
### What must stay shared
These should remain aligned across web and app:
- brand language
- core product objects: posts, threads, auctions, profiles, garages, notifications
- platform concepts: Carmunity, discussions/forums, profile identity, garage identity
- onboarding preference model where shared APIs already exist
- trust language and support explanations

### What should have behavior parity
These should behave similarly even if the UI differs:
- feed sorting concepts and social identity
- forum/discussion participation model
- notification meaning and destinations
- onboarding preference persistence
- public auction state semantics

### What can intentionally differ
- route labels and path structures
- navigation shape
- screen architecture
- level of seller tooling exposure
- notification inbox presentation
- empty-state density and CTA format

## Parity Matrix
| Area | Current web state | Current app state | Must remain shared conceptually | Behavior parity required | Acceptable platform differences | What must update in app if site changes first |
|---|---|---|---|---|---|---|
| `Carmunity` | `/explore` with onboarding, trending, discussed auctions, community feed | `/home` with same social identity and shared feed APIs | yes | feed identity, post meaning, follow/social graph, core terminology | route name and shell placement can differ | app copy, tabs, empty-state language, any renamed product concepts |
| `Discussions / Forums` | `/discussions` with Gears / Lower Gears | `/forums` route family | yes | thread model, taxonomy intent, discovery logic where feasible | label can differ short-term, but concept should not | app naming should eventually align if web standardizes “Discussions” vs “Forums” |
| `Messages` | real 1:1 messaging at `/messages` | no surfaced message UI in current Flutter router | yes, as a platform capability | eventual parity desirable, but not required immediately | web can remain ahead | app roadmap and nav strategy if web begins positioning messages as core identity |
| `Profiles` | `/u/[handle]` with broader profile expression | `/you` self-profile branch | yes | same identity model, handles, self-state, core social metadata | self-profile routing can differ | app should reflect any major changes to profile sections or terminology |
| `Garage` | real garage route and add flow | placeholder screen saying web/API wiring is later | yes | car ownership portfolio concept | web can remain richer for now | app should inherit updated garage language, empty states, and future add/edit prioritization |
| `Seller tools / marketing workspace` | robust web-only seller stack | not present in current app UI | yes, at product-strategy level | none required immediately | should remain intentionally web-first for now | app should only update if a mobile seller experience is formally planned |
| `Notifications` | header dropdown + notification APIs | full-screen notifications inbox with same row concepts | yes | notification row meaning, read/unread state, destinations | dropdown vs full screen is fine | app navigation targets if web introduces new assistant/help destinations |
| `Assistant entry points` | no user-facing assistant yet | no assistant entry point | yes, once launched | scope, tone, help boundaries, citation behavior | entry point can differ by platform | app needs an assistant/help access pattern if web launches assistant first |
| `Onboarding / preferences` | web explore onboarding + settings | settings screen already uses same onboarding API contract | yes | preference persistence and meaning | UI flow can differ | app should mirror any schema or preference-model changes quickly |
| `Empty states` | richer empty states on web in garage/feed/etc. | simpler or placeholder empty states in app | yes, at a messaging level | core CTA intent should align | density and visual treatment can differ | app copy should be refreshed when site reframes product identity |

## Area-by-Area Guidance
### Carmunity
#### Shared across web and app
- Carmunity should remain the umbrella social identity.
- Social graph, post meaning, reaction intent, and identity should stay shared.

#### Required parity
- If the site becomes more explicitly Carmunity-first, the app should inherit the same language and value framing.
- Feed categories and onboarding preference semantics should stay aligned.

#### Allowed differences
- Web can continue using `/explore`; app can continue using `/home`.
- The app can remain more direct and less content-heavy.

#### If site changes first
Update app copy and affordances so it does not still feel like an older product framing.

### Discussions
#### Shared across web and app
- The forum/discussion product should remain one shared concept.
- The taxonomy model should remain coherent.

#### Required parity
- Thread semantics, category meaning, and participation model should stay in sync.

#### Allowed differences
- Web can call it `Discussions` while app temporarily uses `Forums`, but this should eventually be rationalized.

#### If site changes first
If public IA starts heavily using “Discussions” as the canonical label, app naming should be reviewed early to avoid long-term drift.

### Messages
#### Shared across web and app
- Messages should remain part of the Carasta platform identity even if web remains ahead for a while.

#### Required parity
- None immediate, because mobile does not yet expose this feature in the repo.

#### Allowed differences
- Web-first rollout is fine.

#### If site changes first
If the site begins emphasizing messaging as a primary pillar of the product identity, the app roadmap should explicitly acknowledge the absence rather than silently drift.

### Profiles and Garage
#### Shared across web and app
- Profiles and Garage are part of the social identity model, not optional extras.
- The live public site also reinforces that these matter.

#### Required parity
- Profile identity, basic metadata, and the meaning of a Garage should remain shared.

#### Allowed differences
- App can keep a simplified self-profile branch.
- Web can remain the richer portfolio and profile-editing surface.

#### If site changes first
Any stronger site narrative around Garage/Dream Garage should be reflected in app placeholders and profile language so users do not perceive two different products.

### Seller Tools / Marketing Workspace
#### Shared across web and app
- Conceptually, seller intelligence is part of Carasta’s differentiation.

#### Required parity
- None immediate.

#### Allowed differences
- This should remain intentionally web-first in the near term.
- The app should not block or distort the web strategy by trying to force mobile parity too early.

#### If site changes first
The app does not need immediate seller-workspace implementation, but public/app product language should not imply parity that does not exist.

### Notifications / Assistant Entry Points
#### Shared across web and app
- Notifications should remain a unified inbox concept.
- A future assistant/help layer should be consistent in identity and boundaries across platforms.

#### Required parity
- notification semantics and destinations
- assistant scope and refusal behavior once launched

#### Allowed differences
- web can use dropdown + drawer patterns
- app can use full-screen inbox and native-style help entry

#### If site changes first
If the website introduces a floating assistant or help drawer, the app should get a clearly named help/assistant access point in a later phase, even if the UI is different.

### Onboarding / Preferences / Empty States
#### Shared across web and app
- preference model
- onboarding completion model
- core empty-state intent

#### Required parity
- API contract and preference meaning
- key CTAs should point toward the same conceptual actions

#### Allowed differences
- app can remain terser and more operational
- web can be more explanatory

#### If site changes first
App placeholders and empty states should be refreshed early because they are low-cost and high-signal.

## Platform-Specific Implications
### Website implications
- The website should become the canonical place for richer public storytelling, seller tooling, and support content.
- The site can go first on public IA, assistant/help architecture, and seller workspace redesign.

### App implications
- The app should stay aligned on terminology and identity.
- The app does not need to chase seller workspace parity yet.
- The app should be protected from drift through copy updates, nav review, and placeholder refreshes where the site narrative changes materially.

### Shared backend / product implications
- Avoid changing shared concept names casually.
- When updating onboarding, notification, or profile concepts, consider app API impact early.
- Keep a short “shared product vocabulary” reference as a future artifact so app and site do not diverge semantically.

## Implementation Readiness: Go / No-Go
### Decisions sufficiently settled
- Web should lead with the new public IA and homepage restructuring first.
- Carmunity/discussions/profiles/garage remain core shared product concepts.
- Seller growth workspace should remain web-first in the near term.
- Notifications are shared conceptually but can remain differently presented by platform.
- A future assistant should be platform-aware but not required to launch identically everywhere.

### What can be implemented safely now
- web homepage and public IA restructuring
- public terminology cleanup
- app/site vocabulary alignment pass
- app placeholder and empty-state copy refresh after web copy settles
- seller workspace visual/system implementation planning on web

### What should wait
- any attempt at full mobile parity for seller marketing
- any forced route/name convergence until product naming decisions are finalized
- any deep assistant rollout in app before web assistant scope and source-of-truth are defined

### Stakeholder answers still needed
1. Should `Discussions` become the canonical cross-platform term, or should app retain `Forums` longer?
2. Is messaging important enough strategically to warrant an app roadmap commitment soon, or can it remain web-only for now?
3. Should Garage/Dream Garage become more explicit in app UX once the website leans more heavily into that identity?
4. Should the future assistant launch on web first only, or as a coordinated cross-platform capability with different entry points?

## Dependencies
- final public IA and terminology decisions
- approval on what remains intentionally web-first
- owner for shared product vocabulary
- future assistant scope and policy definition

## Recommended Next Implementation Phase After This Pass
### Recommended phase
**Web homepage + public IA implementation, with parity guardrails**

### Why
- It resolves the biggest product-story issue first.
- It does not require premature mobile implementation.
- It gives the app a stable narrative target for copy and concept alignment.

### What to pair with that phase
- a lightweight app alignment checklist:
  - review cross-platform terminology
  - note deliberate capability gaps
  - queue placeholder/empty-state refreshes
  - flag any shared API/schema implications before shipping web changes
