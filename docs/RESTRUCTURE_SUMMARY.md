# Frontend Restructure Summary

**Completed:** March 2026  
**Scope:** Route groups, shared libraries, container standardization

---

## Step 1 — Route Groups

### New Folder Structure

```
app/
├── (marketing)/          # Public routes
│   ├── page.tsx          # /
│   ├── auctions/
│   ├── explore/
│   ├── contact/
│   ├── terms/
│   ├── privacy/
│   └── merch/
├── (app)/                # Authenticated routes
│   ├── sell/
│   ├── settings/
│   ├── u/[handle]/
│   ├── garage/add/
│   └── dream/add/
├── (auth)/               # Sign-in/up
│   └── auth/
│       ├── sign-in/
│       └── sign-up/
├── (admin)/              # Admin dashboard
│   └── admin/
├── api/                  # Unchanged
├── layout.tsx
├── loading.tsx
└── providers.tsx
```

### Files Moved

| From | To |
|------|-----|
| `app/page.tsx` | `app/(marketing)/page.tsx` |
| `app/auctions/` | `app/(marketing)/auctions/` |
| `app/explore/` | `app/(marketing)/explore/` |
| `app/contact/` | `app/(marketing)/contact/` |
| `app/terms/` | `app/(marketing)/terms/` |
| `app/privacy/` | `app/(marketing)/privacy/` |
| `app/merch/` | `app/(marketing)/merch/` |
| `app/sell/` | `app/(app)/sell/` |
| `app/settings/` | `app/(app)/settings/` |
| `app/u/` | `app/(app)/u/` |
| `app/garage/` | `app/(app)/garage/` |
| `app/dream/` | `app/(app)/dream/` |
| `app/auth/` | `app/(auth)/auth/` |
| `app/admin/` | `app/(admin)/admin/` |

### Import Updates

- `@/app/auctions/auction-card` → `@/app/(marketing)/auctions/auction-card`
- `@/app/explore/actions` → `@/app/(marketing)/explore/actions`
- `@/app/garage/actions` → `@/app/(app)/garage/actions`
- `@/app/garage/add/add-garage-car-form` → `@/app/(app)/garage/add/add-garage-car-form`
- `@/app/u/[handle]/actions` → `@/app/(app)/u/[handle]/actions`

**URLs unchanged.** Route groups (parentheses) do not affect the URL path.

---

## Step 2 — Shared Libraries

### lib/validations/

| File | Contents |
|------|----------|
| `auth.ts` | `signUpSchema` |
| `contact.ts` | `contactSchema` |
| `auction.ts` | `placeBidSchema`, `quickBidSchema`, `buyNowSchema`, `autoBidSchema` |
| `index.ts` | Re-exports |

**Updated:** `app/api/auth/sign-up/route.ts`, `app/api/contact/route.ts`, `app/(marketing)/auctions/actions.ts`

### lib/motion.ts

Shared Framer Motion variants:
- `fadeInUp`, `fadeIn`
- `staggerChild`, `containerVariants`
- `hoverScale`, `tapScale`, `hoverLift`

**Updated:** `app/(marketing)/auctions/auction-card.tsx`, `components/layout/AppSidebar.tsx`

### hooks/

- `hooks/index.ts` — Placeholder for future shared hooks

### components/patterns/

| Component | Purpose |
|-----------|---------|
| `Container` | Wraps `carasta-container` with optional `maxWidth` (sm, md, lg, xl, 2xl, full) |
| `Section` | Title, subtitle, action slot, children; uses Container |
| `index.ts` | Re-exports |

---

## Step 3 — Container Standardization

### Replacements

All `container mx-auto max-w-* px-4 py-*` replaced with `carasta-container max-w-* py-*`.

**Files updated:**
- `app/(app)/u/[handle]/garage/page.tsx`
- `app/(marketing)/auctions/[id]/page.tsx`
- `app/(marketing)/auctions/page.tsx`
- `app/(app)/u/[handle]/listings/page.tsx`
- `app/(marketing)/merch/page.tsx`
- `app/(app)/garage/add/page.tsx`
- `app/(app)/sell/page.tsx`
- `app/(marketing)/explore/page.tsx`
- `app/(marketing)/explore/post/[id]/page.tsx`
- `app/(marketing)/auctions/error.tsx`
- `app/(app)/settings/page.tsx`
- `app/(app)/u/[handle]/dream/page.tsx`
- `app/(app)/u/[handle]/page.tsx`
- `app/(app)/dream/add/page.tsx`
- `app/(auth)/auth/sign-in/page.tsx`
- `app/(auth)/auth/sign-up/page.tsx`
- `components/layout/nav.tsx`

### Result

- **0** remaining `container mx-auto` usages
- **carasta-container** used consistently (from `styles/carasta.css`)

---

## Verification

- [x] Build passes
- [x] No broken imports
- [x] URLs unchanged (/, /auctions, /auth/sign-in, etc.)
- [x] Middleware still protects /admin, /settings
