# Route / Label / Parent / Surface Matrix

**Audit date:** 2026-04-22  
**Method:** Mapped from `CarastaLayout`, `AppSidebar`, `MobileBottomNav`, footer blocks, admin home, seller marketing page `<h1>`, admin marketing page `<h1>`.  
**Intended columns** follow locked IA: Carmunity (centerpiece), Market (commerce umbrella), Resources (trust/help), Discussions (canonical), signed-in vs signed-out rules from the brief.

**Legend — surfaces:** TN = top nav (primary app strip), MN = marketing strip (signed-out left cluster), AA = header actions area, AR = avatar dropdown, LR = left rail, MB = mobile bottom nav, FT = footer, AD = admin page body (not global shell), — = not shown.

**Legend — access:** Public = reachable without auth (may still show gated UI); SI = signed-in typical; SO = signed-out typical; Admin = role-gated.

---

## Matrix (shell & primary destinations)

| Current label | Current route | Current surface(s) | Actual page / function | Intended label (per locked IA) | Intended parent grouping | Intended surface(s) | Access / notes |
|---------------|---------------|----------------------|-------------------------|--------------------------------|----------------------------|---------------------|----------------|
| Home | `/` | MN; FT “Explore” column repeats `marketingNav` | Marketing home / signed-out landing | Home (or “Carasta” via logo only) | Brand / marketing entry | SO: TN minimal or logo-only; optional Resources | Public |
| How It Works | `/how-it-works` | MN; LR under **Resources** section label; FT | Public marketing explainer | How It Works | Resources (trust/help) | Resources dropdown + hub; remove from flat SO TN when collapsed | Public |
| Why Carasta | `/why-carasta` | MN; LR under **Resources** section; FT; also in `resourceSections` hub | Public positioning | Why Carasta | Resources | Resources dropdown + hub | Public |
| Resources | `/resources` | MN **and** TN `publicTopNav` (duplicate SO); TN signed-in; LR; MB; AR “Help center”; FT Support links partially overlap | Resource hub index | Resources | Resources | TN pillar + Resources dropdown; **one** SO entry | Public |
| Contact | `/contact` | MN; FT | Contact / help routing | Contact | Resources | Resources dropdown + footer | Public |
| Carmunity (Preview) | `/explore` | TN `publicTopNav` (SO) | Carmunity feed (guest preview + signed-in feed) | Carmunity (preview copy only if needed) | Carmunity | SO: single Carmunity entry → dropdown later | Public |
| Carmunity | `/explore` | TN `signedInTopNav`; MB; FT “Product” | Same feed | Carmunity | Carmunity | SI: TN pillar + Carmunity dropdown | SI |
| Explore | `/explore` | LR **label** under Carmunity | Same feed | Carmunity (feed) or “Feed” under Carmunity | Carmunity | LR under Carmunity | SI |
| Discussions | `/discussions` | LR; MB; FT “Product” | Discussions index / threads | Discussions | Carmunity | Carmunity dropdown + LR + optional MB | Public |
| Messages (text link) | `/messages` | TN AA (xl+); FT “Product” | Messaging inbox | Messages (icon preferred in TN) | Carmunity | TN **icon**; LR | SI |
| Messages | `/messages` | LR | Inbox | Messages | Carmunity | LR + TN icon | SI |
| Market (Browse) | `/auctions` | TN `publicTopNav` | Auctions browse | Market | Market | SO: single Market entry | Public |
| Browse Market | `/auctions` | AA (md+); FT hero CTAs | Same auctions list | Market | Market | Remove duplicate label; keep one SO path | Public |
| Market | `/auctions` | TN `signedInTopNav`; MB; FT | Same | Market | Market | TN pillar + Market dropdown | Public / SI |
| Live auctions | `/auctions` | LR Market section | Same | Live auctions or “Browse” | Market | Market dropdown + LR | SI |
| Sell | `/sell` | LR; MB; FT | Seller entry / flow | Sell | Market | Market dropdown + LR + MB as needed | Public / SI |
| My listings | `/u/[handle]/listings` | LR (under Sell); AR | Owner listings | My listings | Market (selling) | Avatar + Market dropdown + LR | SI |
| Marketing | `/u/[handle]/marketing` | LR (under Sell, gated) | Seller marketing workspace | Seller marketing (name TBD: align with page H1) | Market (seller growth) | LR + avatar | SI + flag |
| Marketing dashboard | `/u/[handle]/marketing` | AR (gated) | Same; page H1 **Marketing command center** | One canonical name (e.g. “Seller marketing” or “Marketing workspace”) | Market | Avatar + LR | SI |
| — (page title) | `/u/[handle]/marketing` | Page content | Seller workspace | *(align nav label to H1 or change H1)* | Market | — | SI |
| Merch Store | `/merch` | LR only | Merch storefront | Merch (TBD) | Market *or* Resources — **unknown** | Market dropdown *or* footer | Public |
| Garage | `/u/[handle]/garage` | LR (bottom section) | User garage | Garage | Carmunity | LR under Carmunity | SI |
| Profile | `/u/[handle]` | LR | Public profile (self) | Profile | Carmunity | LR + avatar | SI |
| You | `/u/[handle]` or `/settings` | AR | Profile if handle else settings | **User display name** | Carmunity / Account | Avatar | SI |
| Settings | `/settings` | AR | Account settings | Settings | Account / Help | Avatar | SI |
| Quick help | *(palette, no route)* | LR; AR | In-app help palette | Quick help | Resources / Help | LR + avatar | SI |
| Help center | `/resources` | AR | Resource hub (not a distinct /help URL) | Help center *or* Resources | Resources | Avatar → consider `/resources` with clearer copy | Public |
| Notifications | *(dropdown)* | TN bell | Notifications UI | Notifications | Global shell | TN icon | SI |
| Sign in | `/auth/sign-in` | AA | Auth | Sign in | Auth | AA | SO |
| Join Carmunity | `/auth/sign-up?...` | AA; FT | Sign up funnel | Join / Sign up | Auth | AA; FT CTA | SO |
| Admin | `/admin` | AR (admin) | Admin dashboard | Admin | Admin / Internal | AR admin section | Admin |
| Element feedback | `/dashboard/feedback` | AR (admin) | Feedback tool | Element feedback | Admin / Internal | AR admin section | Admin |
| Seller marketing (review) | `/admin/marketing` | AR (admin) | Admin marketing summary | **Marketing summary (admin)** or “Platform marketing” | Admin | Admin home + AR; **rename** | Admin |
| — (admin page) | `/admin/marketing` | AD `<h1>` | Read-only aggregates | Marketing summary | Admin | Admin | Admin |
| Sign out | `/api/auth/signout` | AR | Sign out | Sign out | Account | Avatar | SI |
| Community Guidelines | `/community-guidelines` | FT | Policy page | Community Guidelines | Resources | Resources + footer | Public |
| Terms & Conditions | `/terms` | FT | Legal | Terms | Resources / Legal | Footer | Public |
| Privacy Policy | `/privacy` | FT | Legal | Privacy | Resources / Legal | Footer | Public |
| FAQ | `/resources/faq` | FT “Support” | FAQ | FAQ | Resources | Resources hub | Public |
| Glossary | `/resources/glossary` | FT | Glossary | Glossary | Resources | Resources hub | Public |
| Trust & Safety | `/resources/trust-and-safety` | FT | Trust page | Trust & Safety | Resources | Resources hub | Public |
| Get Help | `/contact` | FT | Contact | Contact | Resources | Resources | Public |
| Auctions *(legacy Nav)* | `/auctions` | **Not mounted** in root layout | Would be auctions | Market | Market | N/A if file removed | — |
| Carmunity *(legacy Nav)* | `/explore` | **Not mounted** | Feed | Carmunity | Carmunity | N/A | — |
| Sell *(legacy Nav)* | `/sell` | **Not mounted** | Sell | Sell | Market | N/A | — |
| Discussion reports | `/admin/moderation/discussions` | Admin home card | Moderation queue | Discussion reports | Admin | Admin home | Admin |
| Marketing summary | `/admin/marketing` | Admin home card + page H1 | Admin marketing aggregates | Marketing summary | Admin | Admin home | Admin |
| Wallet | `/wallet` | *Not in audited shell* | Wallet | Wallet | Market *or* Account | TBD | SI |
| Welcome | `/welcome` | *Not in nav* (callback) | Onboarding | Welcome | Auth / Carmunity onboarding | TBD | SI |

---

## Resource hub-only entries (`resource-links.ts`)

These are **not duplicate top-nav items** today but belong under **Resources** in target IA:

| Hub card title | Route | Intended parent | Intended surface |
|----------------|-------|-----------------|------------------|
| What is Carasta? | `/resources/what-is-carasta` | Resources | Hub |
| (Why Carasta card duplicates `/why-carasta`) | `/why-carasta` | Resources | Hub (path may stay or move under `/resources/*` later) |
| How It Works | `/how-it-works` | Resources | Hub |
| FAQ, Glossary, concept guides, buying/selling guides | `/resources/...` | Resources | Hub |

*(URL consolidation is a later cleanup; this matrix records **current** routes.)*

---

## Seller marketing page internal labels (nav-adjacent drift)

| UI string | Location | Route context | Note |
|-----------|----------|---------------|------|
| Seller growth workspace | Badge on seller marketing page | `/u/[handle]/marketing` | Align with global naming when cleanup runs |
| Marketing command center | `<h1>` seller marketing | `/u/[handle]/marketing` | Conflicts with avatar **Marketing dashboard** |
| Campaign command | Section title | same | Adds “command” vocabulary drift vs admin “summary” |

---

## Summary counts

- **Duplicate destinations, multiple labels:** `/auctions` (Market (Browse) + Browse Market); `/resources` (duplicate in signed-out header); `/explore` (Carmunity vs Explore).
- **Same feature, admin vs seller confusion:** “Seller marketing (review)” → admin **Marketing summary**.
- **Orphan nav implementation:** `components/layout/nav.tsx` (different labels: **Auctions**).
