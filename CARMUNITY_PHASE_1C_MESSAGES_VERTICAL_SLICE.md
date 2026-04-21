# Carmunity / Carasta — Phase 1C: Messages vertical slice normalization

**Status:** Complete (implementation + validation).  
**Depends on:** Phase 1A substrate (`styles/carasta.semantic.tokens.css`, elevation tokens, motion foundation) and Phase 1B shell primitives (`Badge`, `shellFocusRing` / `lib/shell-nav-styles.ts`, overlay vocabulary).  
**Scope:** Messages list + thread + listing context + empty/error/review states only. **Not** messaging feature expansion, **not** seller/admin/assistant redesign.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `CARMUNITY_PHASE_1C_MESSAGES_VERTICAL_SLICE.md` | This handoff: scope, changes, deferred work, validation, next-phase recommendation. |

---

## 2. Files modified

| File | Summary |
|------|---------|
| `app/(app)/messages/page.tsx` | Calmer page header hierarchy (`header` + `border-border`), product typography for title/subtitle (no display/uppercase drift), stable copy for attachments guardrail. |
| `app/(app)/messages/[conversationId]/page.tsx` | Slightly wider thread canvas on `md+` (`md:max-w-4xl`) within `carasta-container`. |
| `app/(app)/messages/messages-conversations-client.tsx` | Tokenized list surface (`card`, `border-border`, `divide-border`, `shadow-e1`); row hierarchy (handle, optional legal name, preview, time); unread tint `bg-primary/5` + primary `Badge` count; loading/error/empty states on semantic tokens; review-mode empty hint via **caution** (not decorative amber); list links use `shellFocusRing` for shell-consistent focus. |
| `app/(app)/messages/[conversationId]/conversation-client.tsx` | Thread shell: `card` + `border-border` + token elevation; header rhythm + `muted` back link; peer bubbles `card` + border, own messages `primary`; listing-context block as integrated marketplace card (thumb, title, meta, primary “View listing” affordance); composer on `background` / `border-input`; default primary **Send** (no signal-red chrome); errors `destructive`; review-mode read-only callout on **caution**; system messages centered muted pill; scroll-to-end uses valid `behavior: "auto"`. |

---

## 3. Biggest list / thread improvements

- **Conversation list:** Reads as a single premium panel (divided rows, token borders/shadows) instead of ad-hoc translucent neutrals. Primary vs secondary text is clearer (`foreground` / `muted-foreground`), with compact **timestamps** and an **unread count Badge** aligned to shell notification patterns.
- **Unread vs read:** Unread rows get a subtle primary wash; typography weight differentiates unread handles; focus rings match Phase 1B shell contract via `shellFocusRing`.
- **Thread:** Full-height thread frame with calmer header, scroll region on `background/50`, and bubbles that respect marketplace product language (primary for “me,” bordered card for peer).
- **Composer:** Token-backed input surface; Send uses default `Button` (blue-violet primary), preserving red for urgency/destructive only.

---

## 4. Listing-context improvements

- Listing-scoped threads show an **integrated card** above the timeline: thumbnail in a bordered frame, title + year/make/model/trim line, status as calm emphasis, and a clear **“View listing”** label in `text-primary` inside the existing auction link — marketplace-native without noisy hex or glass stacks.

---

## 5. Empty / read-only / review improvements

- **Empty list:** Centered guidance in `card` + `border-border` + `shadow-e1`; review mode adds a **caution** semantic note when demo data may apply (aligned with Phase 1B notification copy).
- **Load / error:** Spinner uses `text-primary`; destructive surfaces use `border-destructive/25` + `bg-destructive/5` + `text-destructive` with outline **Retry**.
- **Review thread:** Banner explains read-only behavior; composer and send disabled to avoid dead clicks; messaging send remains blocked by API (unchanged).

---

## 6. Shared primitives / patterns extended

- **`Badge`:** Reused for unread counts on the conversation list (primary variant — consistent with Phase 1B unread treatment).
- **`shellFocusRing`:** Imported on conversation list `<Link>` rows so keyboard focus matches header/sidebar/mobile shell semantics.
- **Semantic tokens:** `caution` / `caution-soft` / `caution-foreground` for review hints; `shadow-e1` / `shadow-e2` from Tailwind `theme.extend.boxShadow` (maps to CSS vars from Phase 1A).
- **No new large primitives:** Intentionally avoided new list-row components to keep Phase 1C bounded; patterns are composable with existing `Button`, `Avatar`, `Textarea`, `Badge`.

---

## 7. App / site parity notes

- Vocabulary stays stable: **Messages**, **conversation**, **listing**, **review mode** — no web-only rebranding.
- Visual rules are token-driven (`primary`, `muted`, `card`, `popover`-adjacent materials) so a future **Carmunity app** can map the same semantic keys without forked hex.
- Listing thumbnail remains `<img>` with a documented eslint exception (varied image hosts; same pragmatic approach noted in Phase 1B for shell assets).

---

## 8. Intentionally deferred

- **Conversation list auction context / badges** (e.g., per-row “listing thread” chip) — would need API/list payload enrichment; out of scope for normalization-only phase.
- **Pagination / infinite scroll** for long threads and long conversation lists.
- **Read receipts, typing indicators, attachments, offers/negotiation UX** — product expansion, not Phase 1C.
- **next/image** for all listing thumbnails — infra/config follow-up across auction surfaces.
- **Broader pages** (explore, discussions, seller workspace, settings) — unchanged by design.

---

## 9. Recommendation for the next implementation phase

**Phase 1D — Discussions vertical slice normalization** (or equivalently: **Carmunity / Explore feed card pass** if product priority favors feed frequency first). Rationale: `CARASTA_SURFACE_PRIORITY_AND_ROADMAP.md` positions **Discussions** and **Explore** as the next high-traffic surfaces still carrying legacy glass/primary-ambient drift; applying the same **bounded slice** playbook (list + detail + empty states + tokenized materials + `Badge` / `shellFocusRing` where appropriate) proves the system again without broad IA churn.

---

## 10. Validation

| Check | Result |
|--------|--------|
| `npm run lint` | **Pass** (exit 0). Pre-existing `@next/next/no-img-element` warnings in other files only; no new errors in messages files. |
| `npx tsc --noEmit` | **Pass** (exit 0). |
| Manual sanity (code review) | List + thread + listing card + review callouts compose only token utilities documented in Phase 1A/1B; routes and imports unchanged aside from styling. |
