# Carmunity / Carasta — Phase 2B: Settings & account shell refinement

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1 substrate, primitives, and shell patterns (`Card`, semantic tokens, `shellFocusRing`).  
**Scope:** `/settings` page shell, `SettingsForm`, and `CarmunitySettingsSection` only. **Not** auth/backend changes, review-mode retirement, profile/garage redesign, assistant, seller/admin, skeleton/motion program, or app parity implementation.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_2B_SETTINGS_ACCOUNT_SHELL.md` | This handoff: scope, changes, deferred work, validation, next-phase recommendation. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(app)/settings/page.tsx` | Page shell: `border-b` intro header, product typography (`font-semibold tracking-tight`), `text-muted-foreground` subtitle; **Profile** block wrapped in **`Card` + `CardHeader` / `CardDescription` / `CardContent`** (solid tokenized surface, no glass). |
| `app/(app)/settings/settings-form.tsx` | Removed legacy **`neutral-*`**, **`border-white/10`**, **`bg-white/5`**, **`font-display` / uppercase** section headings; default **`Input` / `Textarea` / `Label`** token surfaces; **sentence-case** section titles; social icons on **`text-muted-foreground`** (no decorative pink/blue chrome); digest row as **calm bordered `muted` panel** with accessible checkbox focus ring; primary **Save profile** CTA. |
| `app/(app)/settings/carmunity-settings-section.tsx` | Replaced gradient ring + **`#0c0c10` glass slab** with **`Card`** layout (`CardHeader` / `CardContent` / `CardFooter`); product titles; **`caution*`** callout for incomplete onboarding (replaces amber text); gear / lower-gear chips use **`shellFocusRing`** and **border-border / primary** semantics; **default `Button`** for save (removes hardcoded `#0a0a0f` label color). |

---

## 3. Biggest settings / account-shell improvements

- **Trust posture:** Settings reads as a **calm account-management surface** — no translucent glass, no display-font shouting, no dark-first inner panels.
- **Hierarchy:** Clear **page → Profile card → Carmunity card** rhythm with shared **elevation (`shadow-e1`)** and borders from the Phase 1 `Card` primitive.
- **Forms:** Fields rely on **design-system inputs** (`border-input`, `bg-background`) for readability and consistency with the rest of the app.
- **Carmunity block:** Discovery controls sit on the **same card language** as seller/product surfaces; incomplete onboarding uses **semantic caution** (not gold/amber decorative chrome).
- **Focusability:** Multi-select gear chips use **`shellFocusRing`** for shell-consistent keyboard focus.

---

## 4. Shared primitives / patterns extended

- **`Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` / `CardFooter`** — used as the **account-page composition pattern** for settings (no new wrapper component).
- **`shellFocusRing`** — applied to **custom chip `<button>`s** in Carmunity interests (pattern: tokenized toggle chips + shared focus contract).

---

## 5. App / site parity notes

- **Vocabulary unchanged:** Settings, Profile, Carmunity, Gears, Lower Gears, Discussions, Explore — stable for future app copy inheritance.
- **Visual intent:** App settings (when built) should mirror **opaque cards + muted description + primary actions**, not legacy glass stacks.

---

## 6. What was intentionally deferred

- **`/auth/sign-in`** and other auth routes — out of scope unless a future phase groups “account entry” with settings visually.
- **Checkbox primitive** — no new `components/ui/checkbox.tsx`; native input with **`accent-primary`** and focus ring styling is sufficient for this slice.
- **Skeleton / loading / motion audit** — **Phase 2A** per `CARASTA_PHASE2_ROADMAP.md`.
- **Review mode retirement, API/auth hardening** — **Phase 2E**; not touched here.
- **Deep form validation UX** (inline field errors, optimistic UI) — feature expansion; not required for shell refinement.

---

## 7. Recommendation for the next implementation phase

**Phase 2A — Interaction polish (loading states, skeletons, motion consistency)** as defined in `CARASTA_PHASE2_ROADMAP.md`: apply after account shell is normalized so pending states are implemented on **coherent** card layouts.

---

## 8. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Existing repo **info** warnings only (`no-img-element` in unrelated files). |
| `npx tsc --noEmit` | **Pass** (exit 0). |

**Manual sanity:** `/settings` — profile card and Carmunity card render; save and revisit flows unchanged logically (client fetch and server actions preserved).
