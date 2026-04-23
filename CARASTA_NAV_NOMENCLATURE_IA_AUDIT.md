# Carasta — Navigation, Nomenclature & IA Audit

**Phase:** Planning / audit only (no implementation in this document).  
**Date:** 2026-04-22  
**Scope:** Web app shell as wired in production layout (`app/layout.tsx` → `CarastaLayout`).

---

## Executive summary

Primary navigation is **centralized in `components/carasta/CarastaLayout.tsx`**, with **signed-in left rail** in `components/layout/AppSidebar.tsx` and **mobile bottom nav** in `components/layout/MobileBottomNav.tsx`. A legacy **`components/layout/nav.tsx`** defines an alternate header (`Auctions` label, different IA) but **is not referenced** by `app/layout.tsx` in this repo state — treat as **orphaned / drift risk** if reintroduced.

The locked IA direction (Carmunity / Market / Resources pillars; Discussions canonical; Garage under Carmunity; etc.) **partially exists in code** but **collides** with:

1. **Dual signed-out headers** (marketing strip + “preview” app strip) causing **duplicate `Resources`** and **parallel Market labels** (`Market (Browse)` vs `Browse Market` → same `/auctions`).
2. **Signed-in top nav** showing only three flat links **without dropdowns** for pillar children, while **left rail + mobile** expose different subsets (e.g. **Discussions** absent from desktop top nav).
3. **Label vs destination mismatches** for marketing surfaces: avatar **“Marketing dashboard”** → seller page whose on-page `<h1>` is **“Marketing command center”**; admin avatar link **“Seller marketing (review)”** → admin page titled **“Marketing summary”**.
4. **Garage** visually separated from the **Carmunity** section in the left rail (appears after Resources + Quick help).
5. **“Explore”** in the left rail under **Carmunity** points to `/explore` (feed) while global marketing language uses **Carmunity** — naming split.

---

## Part 1 — Navigation surfaces (evidence-based)

| Surface | File(s) | Session rule | Label / route source |
|--------|---------|--------------|----------------------|
| **Root shell** | `app/layout.tsx` | Always wraps `CarastaLayout` | N/A |
| **Header (desktop ≥ lg)** | `CarastaLayout.tsx` | `marketingNav` if `!session`; second `<nav>` uses `signedInTopNav` or `publicTopNav` | Inline arrays in component |
| **Header actions** | `CarastaLayout.tsx` | Messages link + `NotificationDropdown` + avatar menu if `session`; else `Browse Market`, Sign in, Join | Inline |
| **Left rail** | `AppSidebar.tsx` | Renders `null` if `!session` | `carmunityNav`, `marketNav`, `resourcesNav` + hardcoded Garage, Merch, Quick help |
| **Mobile bottom** | `MobileBottomNav.tsx` | Hides on `/auth/*`, contact, legal pages; hides for signed-out on “marketing shell” paths | `signedInNavItems` / `publicNavItems` |
| **Avatar menu** | `CarastaLayout.tsx` | Signed-in only | Inline items + `role === "ADMIN"` block |
| **Footer** | `CarastaLayout.tsx` | All users | `marketingNav`, `footerProductLinks`, inline Support/Product columns |
| **Resources hub content** | `components/resources/resource-links.ts` | Public pages under `/resources` | Structured sections (not the header) |
| **Admin home cards** | `app/(admin)/admin/page.tsx` | Server page | Links to `/admin/marketing` labeled **Marketing summary** |
| **Legacy `Nav`** | `components/layout/nav.tsx` | Unused by root layout | Separate `navLinks` array |

**Derivation of visibility**

- **Session:** `useSession()` from `next-auth/react` in client shell components.
- **Marketing feature:** `session.user.marketingEnabled` gates seller **Marketing dashboard** avatar item and sidebar **Marketing** sub-link under Sell.
- **Admin:** `(session.user as any).role === "ADMIN"` gates Admin, Element feedback, Seller marketing (review).

---

## Part 2 — Collisions / drift (specific)

### 1. Signed-out top clutter & redundancy

- **`Resources`** appears in **`marketingNav`** (left cluster) and again in **`publicTopNav`** (right cluster) for the same session state on large screens.
- **`Market (Browse)`** (`/auctions`) coexists with **`Browse Market`** (`/auctions`) in the right-side actions — duplicate destination, different copy.
- **Marketing links** (Home, How It Works, Why Carasta, Contact) sit **alongside** preview IA links (Carmunity (Preview), Market (Browse)), mixing **legacy marketing** and **product preview** in one header band.

### 2. Signed-in top underexposure

- Top row is **only** Carmunity → `/explore`, Market → `/auctions`, Resources → `/resources` (prefix match for resources subtree).
- **No dropdowns** for pillar children. **Discussions** is not in signed-in desktop top nav (it **is** in sidebar and mobile).

### 3. Avatar menu nomenclature drift

- **“You”** — generic; product direction prefers **display name**.
- **“Marketing dashboard”** (avatar) vs page `<h1>` **“Marketing command center”** on `app/(app)/u/[handle]/marketing/page.tsx` — internal inconsistency.
- **“Seller marketing (review)”** (admin-only avatar item) → **`/admin/marketing`**, whose `<h1>` is **“Marketing summary”** — reads as seller tooling; actually **platform admin read-only aggregates**.

### 4. Left-rail hierarchy drift

- **Carmunity** section: **“Explore”** label for `/explore` vs brand term **Carmunity** elsewhere.
- **Messages** uses same icon family as Discussions (`MessageSquare` for both).
- **Garage** and **Merch Store** sit **below** Resources + Quick help — conflicts with “Garage under Carmunity” IA.
- **Market** subsection nests **My listings** / **Marketing** under **Sell** — reasonable for selling, but overlaps avatar **My listings** / **Marketing dashboard**.

### 5. Shared strings / single points of change

- **`CarastaLayout.tsx`** owns most collisions (duplicate Resources, Browse vs Market (Browse), avatar labels).
- **`AppSidebar.tsx`** owns Explore vs Carmunity naming and Garage placement.
- **`MobileBottomNav.tsx`** is the **only** surface that shows **Discussions + Sell** together for signed-in mobile in the bottom bar (different from desktop top).

### 6. Route alias (documentation)

- **`/carmunity`** exists as `app/(marketing)/carmunity/page.tsx` and **301-style redirects** to **`/explore`** — not linked in audited nav arrays but relevant for IA canonical URLs.

---

## Part 3 — Matrix deliverable

See **`CARASTA_ROUTE_LABEL_PARENT_MATRIX.md`** (required table).

---

## Parts 4–8 — Target structure, avatar plan, left rail, auth shell, SEO

See **`CARASTA_NAV_CLEANUP_TARGET_STRUCTURE.md`** for recommended target IA mapping, avatar grouping, left rail vs top responsibilities, signed-out/auth shell rules, and **SEO roadmap track**.

---

## Part 9 — Files created (this package)

1. `CARASTA_NAV_NOMENCLATURE_IA_AUDIT.md` (this file)  
2. `CARASTA_ROUTE_LABEL_PARENT_MATRIX.md`  
3. `CARASTA_NAV_CLEANUP_TARGET_STRUCTURE.md`  

---

## Part 10 — Critical unknowns (need product input)

1. **Merch Store** (`/merch`): pillar is **Market** vs **Resources** vs standalone — not specified in locked IA list.  
2. **Wallet** (`/wallet`): no primary nav exposure in audited shell — intentional omission or backlog?  
3. **`components/layout/nav.tsx`**: delete, merge, or keep for a subdomain/story — decision needed.  
4. **Canonical public path for “Carmunity”**: `/explore` is feed today; `/carmunity` redirects — confirm long-term URL story for SEO and external links.  
5. **Discussions** on signed-in **desktop top**: dropdown under Carmunity only vs also top-level — tradeoff between pillar purity and discoverability.

---

## Code reference index (audit anchors)

```31:49:components/carasta/CarastaLayout.tsx
const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-carasta", label: "Why Carasta" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

const signedInTopNav = [
  { href: "/explore", label: "Carmunity" },
  { href: "/auctions", label: "Market" },
  { href: "/resources", label: "Resources" },
];

const publicTopNav = [
  { href: "/explore", label: "Carmunity (Preview)" },
  { href: "/auctions", label: "Market (Browse)" },
  { href: "/resources", label: "Resources" },
];
```

```171:236:components/carasta/CarastaLayout.tsx
                    <DropdownMenuItem asChild>
                      <Link
                        href={
                          (session.user as any)?.handle
                            ? `/u/${(session.user as any).handle}`
                            : "/settings"
                        }
                      >
                        You
                      </Link>
                    </DropdownMenuItem>
                    ...
                        <Link href={`/u/${session.user.handle}/marketing`}>
                          Marketing dashboard
                        </Link>
                    ...
                          <Link href="/admin/marketing">
                            Seller marketing (review)
                          </Link>
```

```32:47:components/layout/AppSidebar.tsx
const carmunityNav = [
  { href: "/explore", label: "Explore", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/messages", label: "Messages", icon: MessageSquare },
] as const;
```

```182:184:app/(app)/u/[handle]/marketing/page.tsx
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--seller-foreground))] md:text-4xl">
                Marketing command center
              </h1>
```

```137:139:app/(admin)/admin/marketing/page.tsx
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Marketing summary
          </h1>
```
