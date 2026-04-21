# Carmunity / Carasta — Phase 1B: Shell coherence + overlay consumers

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1A substrate (semantic tokens, primitives, motion foundation).  
**Scope:** Shared shell + highest-frequency overlay consumer (notifications). **Not** a broad page redesign.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `lib/shell-nav-styles.ts` | Shared class fragments for header, sidebar, and mobile shell nav (active/inactive/focus) so desktop header, sidebar, and bottom nav stay visually aligned. |
| `components/ui/badge.tsx` | Minimal shadcn-style `Badge` primitive (variants: default, secondary, outline, muted, destructive) for shell-adjacent counts/chips without one-off spans. |
| `CARMUNITY_PHASE_1B_SHELL_COHERENCE.md` | This handoff document. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `components/carasta/CarastaLayout.tsx` | Header marketing + app rail links use `shell-nav-styles`; focus-visible on account trigger; user menu `DropdownMenuContent` uses `border` + `shadow-e2` + solid `bg-popover`; Messages link gets `data-active` for underline parity with `carmunity-nav-link`. |
| `components/layout/AppSidebar.tsx` | Replaced legacy `neutral-*` / `white/5` / heavy `bg-primary/90` + black shadows with token-driven `muted` / `primary/15` active states; sidebar surface `bg-card/50` + `border-border`; sub-rows use shared sub-item tokens. |
| `components/layout/MobileBottomNav.tsx` | Replaced `neutral-*` hovers with `shell-mobile*` tokens so active/hover/focus match desktop shell logic. |
| `components/notifications/NotificationDropdown.tsx` | Removed hardcoded dark panel (`#121218`, `white/10`, `neutral-*`); aligned to `popover` / `border` / `muted` / `foreground`; unread rows `bg-muted/50`; review callout uses **caution** semantic (not amber decorative chrome); unread count uses `Badge`; calmer empty/load-more actions. |

---

## 3. Shell coherence improvements

- **Single vocabulary** for shell navigation: `lib/shell-nav-styles.ts` defines marketing vs app-rail active states consistent with Phase 1A intent (primary tint for app, muted pill for marketing).
- **AppSidebar** no longer reads as a separate “dark neon” rail: inactive text is `text-muted-foreground`, hover `hover:bg-muted/70`, active `bg-primary/15 text-primary` (aligned with header app links).
- **Mobile bottom nav** uses the same active/inactive semantics as the desktop app rail (`primary/10` pill + `text-primary` when active).
- **Header** account dropdown uses the same overlay material language as other tokenized menus (`border-border`, `bg-popover`, `shadow-e2`).
- **Focus affordances** normalized on header account trigger (`focus-visible:ring-ring`).

---

## 4. Overlay / notification improvements

- **Notification panel** now uses design tokens (`bg-popover`, `text-popover-foreground`, `border-border`, `shadow-e2`) instead of a bespoke near-black surface, so it matches `DropdownMenu` / Card materials from Phase 1A.
- **Unread vs read:** unread rows use `bg-muted/50`; body copy uses `text-foreground` / `text-muted-foreground` instead of fixed neutrals for light-first + dark mode.
- **Review mode note:** `border-caution/30`, `bg-caution-soft/30`, `text-caution-foreground` — semantic caution, not gold/copper chrome.
- **Unread count:** `Badge` primitive (primary) for consistency with future chip usage.

---

## 5. New shared primitives

- **`Badge`** (`components/ui/badge.tsx`) — small, token-backed chip for counts/labels; default variant maps to primary.
- **`shell-nav-styles`** — not a React component; a **style contract** to prevent drift between `CarastaLayout`, `AppSidebar`, and `MobileBottomNav` without inventing a large taxonomy.

---

## 6. State / interaction consistency updates

- **Active:** `bg-primary/15 text-primary` (app rail + sidebar + mobile); marketing header stays `bg-muted text-foreground`.
- **Inactive:** `text-muted-foreground` + `hover:bg-muted/70 hover:text-foreground` (or mobile `hover:bg-muted/50`).
- **Focus:** shared `focus-visible:ring-2 ring-ring ring-offset-background` on shell links and sidebar rows.
- **Carmunity underline:** preserved via existing `carmunity-nav-link` + `data-active` on header app links and Messages.

---

## 7. App / site parity notes

- Shell vocabulary is stable and token-backed so **Carmunity app** or marketing surfaces can later reuse `shell-nav-styles` or `Badge` without renaming.
- No parity implementation in this phase (per guardrails).

---

## 8. Intentionally deferred

- **Homepage / public marketing pages** beyond shell/footer already in `CarastaLayout`.
- **Messages, seller workspace, admin, assistant, discussions, explore** page-level redesigns.
- **Broad typography pass** (only shell-linked strings in notifications + nav were normalized).
- **Framer Motion** on sidebar: kept subtle `hoverScale` / `tapScale` only; removing motion entirely is a later UX decision.
- **img → next/image** in `CarastaLayout` (existing lint warnings; out of scope for 1B).
- **New Panel/Section primitive:** not required once notification dropdown used `popover` tokens; can add in Phase 2 if repeated marketing panels still drift.

---

## 9. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | Pass (existing `@next/next/no-img-element` warnings unchanged). |
| `npx tsc --noEmit` | Pass. |
| Imports | `Badge`, `shell-nav-styles`, `cn` resolve; no broken paths. |

**Manual sanity (recommended):** signed-in header nav, sidebar active states, mobile bottom bar, open notifications (empty + populated), dark mode toggle if used.

---

## 10. Recommendation — next implementation phase

**Phase 1C — Page-adjacent normalization (still not “full redesign”):** pick one vertical slice (e.g. **messages list + thread chrome** or **seller workspace chrome**) and apply the same token + `shell-nav-styles` patterns to route-local headers, list rows, and empty states—reusing `Badge`, `Button`, `Card` variants, and dropdown materials—before touching layout IA or marketing content.
