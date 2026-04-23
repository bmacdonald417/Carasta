# Carmunity — Desktop pillar dropdown bugfix & sign-out UX

**Phase:** Focused bugfix / UX correction.  
**Date:** 2026-04-22  

---

## 1. Files created

- `CARMUNITY_DROPDOWN_BUGFIX_AND_SIGNOUT_UX.md` (this file)

---

## 2. Files modified

- `components/carasta/CarastaLayout.tsx`

---

## 3. Root cause of the pillar dropdown issue

**Confirmed in code:** The same pillar navigation trees (`signedInPillarNav` and `signedOutPillarLinks`) were **mounted twice** in the React tree at once:

1. Inside a **mobile** `<nav className="… lg:hidden">` (hidden from layout at `lg+` via `display: none`, but still mounted).
2. Inside the **desktop** `<div className="hidden lg:flex">` (visible at `lg+`).

Each mount contained its **own** Radix `DropdownMenu` roots for Carmunity, Market, and Resources. Having **duplicate** Radix dropdown instances for the same UI led to broken open behavior for the visible triggers (focus / `data-state` could update on the interactive trigger while the **wrong** subtree’s content lifecycle or layering behaved inconsistently). The avatar menu stayed healthy because it was **only mounted once**.

---

## 4. What was changed to fix it

1. **Single mount:** Replaced the dual mobile/desktop pillar blocks with **one** `<nav>` that serves all breakpoints (`overflow-x-auto` on small screens, `lg:overflow-visible` + `justify-end` aligned with prior desktop intent).
2. **Auth shell spacer:** When `pathname` is under `/auth` and the user is signed out, a **desktop-only** `flex-1` spacer preserves header alignment (same role as the previous empty `flex-1` span).
3. **Layering:** Pillar `DropdownMenuContent` uses a shared class with **`z-[100]`** so portaled panels sit **above** the sticky header’s `z-50` chrome if paint order ever tied.
4. **Radix `modal={false}`** on pillar `DropdownMenu` roots only — avoids the default modal layer / scroll-lock interaction edge cases around the sticky, blurred header while keeping the avatar dropdown default (unchanged).

---

## 5. Sign-out UX changes

- Removed the **`<Link href="/api/auth/signout">`** pattern that sent users to NextAuth’s **detached GET sign-out confirmation page**.
- **In-menu flow:** First **Sign out** sets a local `avatarSignOutStep` to `confirm`, showing a short line of copy (“Sign out of Carasta?”), **Cancel** (returns to idle), and a second **Sign out** action that calls **`signOut({ callbackUrl: "/" })`** from `next-auth/react` (session ends; redirect stays product-normal).
- Closing the avatar menu resets the step to **idle** via `onOpenChange`.

---

## 6. Intentionally deferred

- No changes to **NotificationDropdown**, **MobileBottomNav**, or other shells.
- No global change to **`DropdownMenuContent`** defaults in `components/ui/dropdown-menu.tsx` (pillar-only classes live in `CarastaLayout`).
- Other rare sign-out entry points (if any appear later) were not audited in this pass.

---

## 7. Validation performed

- `npm run lint` — passed (existing `<img>` warnings unchanged).
- `npx tsc --noEmit` — passed.

**Manual sanity (recommended):** Open Carmunity / Market / Resources on desktop signed-in and signed-out; open avatar; exercise sign-out confirm / cancel; confirm notifications menu unchanged.
