# Carasta — Review / demo mode retirement plan

**Date:** 2026-04-21  
**Scope:** Planning for removal of temporary review/demo access. **No code changes** in this document.

---

## 1. What exists today (repo facts)

### 1.1 Environment variables (documented in `.env.example`)

| Variable | Role |
|----------|------|
| `REVIEW_MODE_ENABLED` | Server-side master switch (`=== "true"`). |
| `NEXT_PUBLIC_REVIEW_MODE_ENABLED` | Client-visible switch (`components/review-mode/review-mode-client.tsx` → `isReviewModeClient()`). |
| `REVIEW_MODE_DEMO_HANDLE` | Demo seller user handle (defaults in code to `trackdaytom` if unset). |
| `REVIEW_MODE_PROFILE_HANDLE` | Profile preview handle (defaults to `nina_shift` if unset). |

### 1.2 Code touchpoints (non-exhaustive but critical)

| Area | File / location | Behavior |
|------|-----------------|----------|
| Banner | `components/review-mode/review-mode-banner.tsx` | Renders global amber banner + links when review mode on; calls `getReviewModeContext()` (DB reads, demo data ensure). |
| Root layout | `app/layout.tsx` | Always mounts `ReviewModeBanner` (no-op when disabled). |
| Session synthesis | `lib/auth.ts` → `getSession()` | If no NextAuth session and review mode on, returns a **synthetic session** for the demo seller user. |
| Middleware | `middleware.ts` | When review mode on, allows **`/admin/*`**, **`/settings`**, and **`/review`** without normal auth checks. |
| JWT / API user | `lib/auth/api-user.ts` → `getJwtSubjectUserId` | If `NEXTAUTH_SECRET` is **missing**, or as fallback when review mode on with no cookie, may resolve to **demo seller id** — **high risk** if mis-set in any real environment. |
| Demo data | `lib/review-mode-demo-data.ts` (from Phase 9 doc) | Ensures seeded content for non-empty review. |
| Hub | `app/review/page.tsx` | Reviewer entry surface. |
| Consumer messaging | `REVIEW_MODE_SURFACE_MAP.md` | Reviewer-facing route map and caveats. |

---

## 2. Should review mode stay active through Phase 2?

### 2.1 During **early Phase 2** (2B settings, 2A interaction)

**Yes, optionally** — *only if* all of the following are true:

- The deployment is **not** indexed as a public production brand yet **or** access is IP/VPN restricted at the edge.
- The database is **disposable demo data** or a dedicated staging instance — **never** production PII.
- Operators understand that **`REVIEW_MODE_ENABLED` effectively bypasses admin/settings auth** in middleware and **synthesizes sessions**.

If any condition fails → **turn review mode off immediately** regardless of roadmap phase.

### 2.2 When it becomes unsafe / inappropriate to keep

Review mode must be **off** before:

- Real paying users, disputes, or **financially binding** auctions.
- Real **admin moderation** on live user-generated content.
- Public marketing launch, **SEO indexing**, or press demos where URLs are shared broadly.
- Any environment where **`NEXTAUTH_SECRET` might be unset** (API identity fallback bug-class).

At that point, synthetic sessions and auth bypasses become **legal, security, and trust liabilities**, not convenience features.

---

## 3. Best point in the roadmap to remove from the live site

**Primary milestone: Phase 2E — Production hardening & review mode retirement** (see `CARASTA_PHASE2_ROADMAP.md`).

**Suggested timing within Phase 2:**

1. Complete **2B** (settings shell) and **2D** (public trust/content pass) *if* you still need stakeholder-visible polish under review mode.
2. Freeze a **“copy/design sign-off”** checkpoint.
3. Execute **2E** as a **single cohesive PR train**:
   - Remove or hard-gate `/review`.
   - Remove `ReviewModeBanner` from default layout (or feature-flag only in internal builds).
   - Revert `getSession()` synthetic user behavior.
   - Restore strict middleware authorization for `/admin` and `/settings`.
   - Remove `getJwtSubjectUserId` fallbacks that impersonate the demo seller except in **explicit local dev** tooling if still needed.
   - Delete or archive `ensureReviewModeDemoData` automatic runs on page load.

**If launch urgency compresses the roadmap:** move **2E earlier**, at the cost of doing fewer preview walkthroughs — **never** launch public production with review mode on.

---

## 4. When to remove environment variables and deployment wiring

### 4.1 Ordering rule

**Variables are removed only after code paths are gone** (or in the same release commit), and **after** operators confirm:

- No Railway / Vercel / CI job still sets `REVIEW_MODE_*` or `NEXT_PUBLIC_REVIEW_MODE_*`.
- No documentation (`CARASTA_DEPLOYMENT_WORKFLOW.md`, `REVIEW_MODE_SURFACE_MAP.md`, internal runbooks) instructs reviewers to enable them on shared staging unless replaced by a **proper staging auth** story.

### 4.2 Suggested lag

- **Same release** as code removal for `REVIEW_MODE_ENABLED` / `NEXT_PUBLIC_REVIEW_MODE_ENABLED` (avoid “flags on, code gone” confusion).
- **Within one sprint** after 2E merges: purge mentions from `.env.example`, deployment templates, and any scripts.

### 4.3 If a future internal QA mode is still needed

Do **not** resurrect synthetic production sessions. Prefer:

- **Normal OAuth** + role `ADMIN` on staging, or
- **Basic auth at the edge** / VPN, or
- **Feature flags** tied to authenticated staff accounts.

---

## 5. Named milestones (for project tracking)

| Milestone | Definition of done |
|-----------|---------------------|
| **M2E-1 — Review mode retirement (site)** | Live site builds and runs with review flags **false**; no synthetic `getSession`; middleware enforces roles; `/review` removed or staff-auth-only. |
| **M2E-2 — Production hardening** | Secret presence enforced at boot for API routes that mint/decode JWTs; audit log for admin routes; no demo-user fallback in `getJwtSubjectUserId`. |
| **M2E-3 — Variable & environment cleanup** | All `REVIEW_MODE_*` and `NEXT_PUBLIC_REVIEW_MODE_*` keys removed from `.env.example`, host env panels, and docs; `REVIEW_MODE_SURFACE_MAP.md` archived or retitled as historical. |

---

## 6. Build / ops note (already documented)

`CARASTA_DEPLOYMENT_WORKFLOW.md` calls out that `getReviewModeContext` runs during **Next.js prerender** when review mode is enabled and previously stressed Postgres connections (mitigated by sequential queries). Removing review mode also **reduces build-time DB load risk** on small plans.

---

## 7. Summary decision table

| Question | Answer |
|----------|--------|
| Keep through Phase 2 planning? | **Yes**, if staging-only and team-aware of bypass semantics. |
| Keep through public launch? | **No.** |
| Remove code in which phase? | **Phase 2E** (or earlier if launch accelerates). |
| Remove env vars when? | **Same release as code removal** + docs cleanup within one sprint. |
| Biggest technical risk until then? | **`getJwtSubjectUserId` + missing `NEXTAUTH_SECRET` + review mode` combo** — treat as P0 if ever observed outside local dev. |
