# Carasta — Phase 2 Roadmap (post–Phase 1)

**Date:** 2026-04-21  
**Status:** Planning package — **no implementation** committed by this document.  
**Doctrine:** Locked light-first, blue-violet functional accent, red for urgency, copper/yellow/gold out of functional chrome, Discussions canonical, public surfaces one language — unchanged.

---

## 1. Roadmap principles

1. **Extend Phase 1 wins** — new UI should compose existing primitives (`Card`, `Badge`, `Button`, `shellFocusRing`, semantic tokens) rather than invent parallel palettes.
2. **Tackle production-risk items** before scaling traffic or paid acquisition.
3. **Sequence narrow vertical slices** (same successful pattern as Phase 1) to avoid another unfocused “big redesign.”
4. **Treat app parity as documentation-first inheritance**, not a simultaneous reskin (per `CARASTA_APP_SITE_PARITY_COMPANION_PLAN.md`).

---

## 2. Ordered Phase 2 sequence

| Order | Phase id | Name | Primary outcome |
|------|-----------|------|-----------------|
| **1** | **Phase 2B** | **Settings & account shell refinement** | `/settings` and adjacent account UX read as **same family** as Phase 1 app surfaces; eliminate legacy glass + display heading drift; align digest opt-in and Carmunity prefs panels to tokenized cards. |
| **2** | **Phase 2A** | **Interaction polish: loading, skeletons, motion** | Consistent **pending/empty/error** choreography across high-traffic routes; optional shared skeleton primitives; audit `framer-motion` usage vs `lib/motion` tokens; reduce layout shift. |
| **3** | **Phase 2D** | **Public content, trust, and IA maturity** | Execute the deferred Phase 1I sweep: nested `/resources/**` articles, glossary-style pages, trust proof density, shallow FAQ expansion where needed — **copy and IA**, minimal new chrome. |
| **4** | **Phase 2C** | **Assistant UI refinement** | `CarastaAssistantLauncher` and answer surfaces: citation hierarchy, escalation clarity, empty/error states, motion consistent with Phase 2A; align tone with public trust pages. |
| **5** | **Phase 2E** | **Production hardening: review mode retirement + env cleanup** | Remove synthetic-session auth paths, middleware bypasses, `/review` if applicable, demo seed side effects from default builds; **security review** of `getJwtSubjectUserId` / `getSession` fallbacks; strip env vars from Railway/docs. See `CARASTA_REVIEW_MODE_RETIREMENT_PLAN.md`. |
| **6** | **Phase 2F** | **App/site parity program (documentation → incremental rollout)** | Update parity companion with **token inheritance table** (web CSS variable → Flutter `AppColors` / theme); refresh app copy for **Discussions** terminology; schedule garage/messages depth **only** after web IA stable. |

### 2.1 Why this order

- **2B before 2A:** Settings is a **bounded, high-trust outlier** with concrete legacy patterns (verified in `app/(app)/settings/page.tsx`). Shipping it first **closes the last obvious “glass island”** on a signed-in path without waiting for a cross-site skeleton audit.
- **2A second:** Interaction polish **applies to everything** including settings; doing it immediately after settings shell avoids re-touching the same files twice.
- **2D before 2C:** Assistant answers will cite public pages; **content maturity** reduces wrong or thin citations and improves SEO-aligned help.
- **2E after 2D/2C:** Stakeholder review may still want review mode while public copy stabilizes; retirement must land **before** treating the deployment as **true production** (see retirement plan).
- **2F last among web-critical phases:** Web token and vocabulary baselines are now stable enough to plan inheritance; execution can span multiple releases without blocking web polish.

### 2.2 Optional parallel track (non-blocking)

- **Seller capability depth** (marketing phases P*, existing notes): can proceed in **parallel** with Phase 2A–2D as long as new seller UI **uses seller-workspace primitives** and does not reintroduce slate/neon substrate.
- **Engineering hygiene:** `next/image` migration for flagged components — can slot into **2A** as a sub-task or a small maintenance PR series.

---

## 3. Single highest-priority next implementation phase

### Recommendation: **Phase 2B — Settings & account shell refinement**

**Why next**

- It is the most visible **authenticated** surface that still uses **pre-Phase-1 patterns** (`font-display` shout heading, `neutral-400`, translucent glass panel).
- Scope is **tight** (settings page, `SettingsForm`, `CarmunitySettingsSection` layout chrome) — low risk of conflicting with completed Phase 1 slices.
- It directly supports **trust**: email visibility, weekly digest opt-in, Carmunity onboarding reset — users should not feel a “beta skin” here.

**Dependencies**

- Phase 1 substrate and primitives (already complete).
- No dependency on new APIs unless settings gains new fields.

**Unlocks**

- Removes the **last major “utility desert”** mismatch before broad interaction polish.
- Makes Phase 2A skeleton work apply to a **coherent** settings layout rather than a legacy wrapper.

**What should wait**

- **Full skeleton system (2A)** can follow immediately after 2B ships — then both generic routes and settings share the same loading language.
- **Review mode retirement (2E)** waits until product/copy review strategy is decided — but must complete before public launch (see retirement doc).

---

## 4. App / site parity position (Part 7)

### 4.1 Is it time to formally plan parity mapping?

**Yes.** Phase 1 completed the **web visual system baseline**; Flutter received a **semantic accent correction** but not a shell parity pass. The right next step is **documentation + inheritance rules**, not blind screen copying.

### 4.2 What must be documented before parity implementation

- **Token map:** web semantic roles → Flutter `ColorScheme` / custom extensions (primary, signal, caution, destructive, surfaces).
- **Terminology lock:** **Discussions** on web vs **Forums** in app router — decide on **user-facing string** trajectory and timeline.
- **Web-first domains:** seller marketing workspace, deep garage editing, messages — remain web-first per companion plan unless product explicitly greenlights mobile scope.
- **Behavior parity list:** notification semantics, auction states, onboarding prefs API — already partially in companion matrix; refresh post–Phase 1.

### 4.3 What should remain web-first

- Seller workspace / marketing tooling.
- Deep account flows that require dense forms (until mobile UX is designed).

### 4.4 What is stable enough for the app to inherit now

- **Accent semantics:** blue-violet primary for functional emphasis; red/signal reserved for urgency; copper heritage-only.
- **Card / border / elevation intent:** opaque product cards over glass-by-default (app should mirror **material intent**, not pixel layout).
- **Public vocabulary:** Carmunity, Discussions, Garage, Messages as concepts.

---

## 5. Protecting against drift during Phase 2

- **PR checklist:** any new route must use **semantic Tailwind tokens** (`bg-card`, `border-border`, `text-muted-foreground`, `shadow-e1`) — no raw hex except documented email-safe constants in `lib/design-tokens.ts`.
- **Scheduled grep:** `bg-signal`, `text-signal`, `variant="performance"`, `#ff3b5c`, `bg-black/`, `backdrop-blur` on non-glass components — triage monthly or before major release.
- **Review mode:** treat as **non-default** in all new environment templates after retirement milestone is scheduled.

---

## 6. Deliverables index

| File | Purpose |
|------|---------|
| `CARASTA_POST_PHASE1_REASSESSMENT.md` | Audit of accomplishments + remaining drift + risks |
| `CARASTA_PHASE2_ROADMAP.md` | This ordered roadmap + single next-phase recommendation + parity stance |
| `CARASTA_REVIEW_MODE_RETIREMENT_PLAN.md` | When/how to remove review mode and env vars |
