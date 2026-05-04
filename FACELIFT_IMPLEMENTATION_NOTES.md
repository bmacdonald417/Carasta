# Homepage facelift — implementation notes

Concise reference for the Carmunity marketplace homepage facelift (visual/shell layer only). Does not replace component source or architecture docs.

---

## New marketplace components (`components/marketplace/`)

| Component | Role |
|-----------|------|
| **`live-auction-strip.tsx`** | Horizontal “Live Auctions” band with green live indicator, compact cards, optional scroll control on desktop, “View all” → auctions index. |
| **`auction-card-compact.tsx`** | Small auction tile: fixed aspect image, uppercase headline, muted seller/bid meta, **primary-colored** bid, countdown + reserve gauge dot. |
| **`featured-auction-hero.tsx`** | Primary hero for one featured live auction: large image, title, bid + time block, CTAs to listing or `/auctions`. |
| **`seller-cta-strip.tsx`** | Banner prompting sellers with short copy and CTA → **`/sell`**. |
| **`carmunity-feed-panel.tsx`** | Home preview of trending/latest posts with links to profiles and **`/explore/post/[id]`**, plus “Open full feed” → **`/explore`**. |
| **`user-garage-card.tsx`** | Left column: signed-in profile/garage preview or guest login/join CTAs (routes aligned with shell sign-up callback). |
| **`carmunity-forums-panel.tsx`** | Right column: trending forum threads + “Browse discussions” → **`/discussions`**. |
| **`site-footer.tsx`** | Navy footer columns (product/learn/sell/company), optional social icons (same env rules as header), legal strip. |

---

## Main shell / layout files touched

- **`components/carasta/CarastaLayout.tsx`** — Global header (Carmunity branding, dense nav, dropdowns, optional social icons from env, feed shortcut, messages/notifications/avatar, mobile royal-blue drawer), **`SiteFooter`** inclusion, main **`overflow-x-clip`**.
- **`components/layout/AppSidebar.tsx`** / **`MobileBottomNav.tsx`** — Unchanged structurally by facelift; still gate logged-in rail/bottom nav.
- **`app/(marketing)/page.tsx`** — Composes strip, hero, CTA, three-column grid (garage \| feed \| forums), stats + activity, existing marketing sections below.
- **`components/home/HomePublicSections.tsx`** — Reduced vertical padding on several sections for density (spacing-only tuning).

---

## Main route targets (nav / footer / home)

Approximate map only; source of truth remains components.

**Header (desktop / drawer)**

- `/`, `/auctions`, `/sell`, `/explore`, `/discussions`, `/messages`, `/wallet`, `/merch`, `/how-it-works`, `/resources`, `/resources/faq`, `/resources/trust-and-safety`, `/contact`, `/why-carasta`, `/community-guidelines`, `/terms`, `/privacy`, `/settings`, `/auth/sign-in`, `/auth/sign-up` (+ callbacks), `/u/[handle]`, `/u/[handle]/garage`, `/u/[handle]/listings`, `/u/[handle]/marketing` (when enabled), `/admin` (admin).

**Footer**

- `/explore`, `/discussions`, `/auctions`, `/sell`, `/`, `/resources`, `/how-it-works`, `/why-carasta`, `/contact`, `/messages`, `/community-guidelines`, `mailto:info@carasta.com`, `/terms`, `/privacy`.

**Home-specific**

- Live strip / hero / grids → `/auctions`, `/auctions/[id]`; feed → `/explore`, `/explore/post/[id]`; forums → **`discussionThreadPath`** + `/discussions`.

---

## Brand colors / tokens

- **Canonical semantic tokens:** `styles/carasta.semantic.tokens.css` (imported via `styles/carmunity-tokens.css` → `app/globals.css`).
- **Examples:** `--primary` / `--primary-hover` (cobalt), `--navy` / `--navy-soft` (footer/chrome), `--background`, `--card`, `--border`, **`--live-accent`** (green live dot), **`--seller-cta-bg`** (seller banner wash).
- **Legacy/marketing hooks:** `styles/carasta.css` (`.carasta-container`, shadows, optional utilities).

---

## Known limitations / TODOs

- **Social icons:** Shown only when official URLs are set via env (see below). No generic platform homepage links in production UI by default.
- **Header “search” control:** Navigates to **`/explore`** (feed entry), not a dedicated global search route.
- **Auction listing “View all” on home:** Points to **`/auctions`** (no `?sort=` filters unless the auctions page implements them).
- **`/messages` in footer:** Visible to everyone; unauthenticated behavior depends on existing auth/messaging gates.
- **Accessibility:** Some marketing/footer assets still use `<img>` for logos; ESLint may warn (`@next/next/no-img-element`).

---

## Adjusting official social links later

1. In **`.env`** (local/production), set any of:
   - `NEXT_PUBLIC_CARMUNITY_INSTAGRAM_URL`
   - `NEXT_PUBLIC_CARMUNITY_YOUTUBE_URL`
   - `NEXT_PUBLIC_CARMUNITY_FACEBOOK_URL`
2. Use full **`https://…`** URLs to the **official** brand profiles.
3. Restart / redeploy so Next.js picks up `NEXT_PUBLIC_*` values.

Helpers: **`lib/marketing/social-links.ts`** (`getPublicSocialLinks()`). Documented placeholders live in **`.env.example`**.

---

## Commands verified (facelift QA pass)

From repo root:

```bash
npm run lint
npx tsc --noEmit
npx next build
```

All completed successfully at last documented run; lint may still report existing **warnings** (e.g. `<img>`), not necessarily errors.

---

*Last updated for documentation of the Carmunity homepage marketplace facelift pass.*
