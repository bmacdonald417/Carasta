# Carmunity — Phase P (UX + interaction polish)

Phase P elevates **interaction quality**, **UI polish**, and **perceived performance** without new major systems, auction expansion, or architectural redesign.

---

## Files created

| File | Purpose |
| --- | --- |
| `app/api/carmunity/mention-suggestions/route.ts` | Read-only suggestions for `@` mentions: following (recent follows), thread participants (optional `threadId`), recent feed/discussion peers, then community prefix matches. |
| `components/carmunity/MentionComposerTextarea.tsx` | Client textarea with `@` detection, debounced suggestions, keyboard navigation, and clean insertion of `@handle ` while preserving existing server-side mention parsing. |
| `CARMUNITY_PHASE_P_UX_POLISH.md` | This document. |

---

## Files modified

| Area | File(s) |
| --- | --- |
| Reactions (web) | `components/discussions/DiscussionReactionPicker.tsx`, `components/discussions/DiscussionReactionSummary.tsx` |
| Discussion composer | `components/discussions/DiscussionThreadReplyComposer.tsx` |
| Discussion empty state | `components/discussions/DiscussionThreadRepliesPanel.tsx` |
| Explore composer + feed | `app/(marketing)/explore/create-post-form.tsx`, `app/(marketing)/explore/community-feed.tsx` |
| Profile | `app/(app)/u/[handle]/page.tsx`, `components/profile/CarmunityActivitySection.tsx` |
| Mobile (Flutter) | `carmunity_app/lib/features/home/presentation/widgets/feed_post_card.dart`, `carmunity_app/lib/features/forums/presentation/forum_thread_detail_screen.dart` |

---

## UX improvements (by part)

### Part 1 — Reaction UX (web)

- **Clear selected state:** the react trigger gains a subtle **ring** when the viewer has a reaction set; pending requests slightly **fade** the control instead of hard-disabling (avoids “dead” feeling).
- **Summary feedback:** when the viewer has reacted, the total shows a **small dot** and a very light **scale** on the count — intentional, not flashy.
- **Micro-interaction:** `active:scale-[0.98]` on the trigger; menu rows have a short **color transition** for selected kinds.

**Before → after (reasoning):** reactions worked but felt “API-driven” (state jumped after refresh). The picker now **communicates ownership** of a reaction at a glance and gives **immediate tactile feedback** on press without adding heavy motion.

### Part 2 — Mentions autocomplete (web)

- Typing **`@`** opens a **dropdown**; queries are **debounced** and backed by `/api/carmunity/mention-suggestions`.
- **Priority:** following first, then thread participants (`threadId`) or recent peers (comments on your posts + threads you replied in), then community prefix matches when the user has typed a filter.
- **Insertion:** replaces the active `@token` with `@handle ` and restores focus/caret.
- **Backend parsing unchanged:** still plain text in POST bodies; linkification/notifications remain server-owned.

**Before → after:** users had to remember handles from memory; now the composer **guides** them while keeping the same mention contract.

### Part 3 — Composer polish (web)

- **Discussion reply:** clearer hierarchy (label row + character meter), softer container, **rounded** primary action, tighter tip copy.
- **Explore create post:** same mention surface, **clearer placeholder**, optional **image preview** (plain `<img>` so arbitrary URLs don’t depend on `next/image` remote patterns), footer separation for actions.

**Before → after:** composers were functional but visually “flat”; spacing and affordances now read as a **single modern module**.

### Part 4 — Feed polish (web)

- **Skeleton list:** `role="status"`, `aria-busy`, consistent **card border**, slightly tighter vertical rhythm (`space-y-5`).
- **Post cards:** clearer **author → media → actions** rhythm (tweaked vertical padding), **hover elevation** on cards, like/comment actions get **active scale** + like icon **micro-scale** when liked.

**Before → after:** loading felt anonymous; cards now **signal interactivity** and hierarchy without a layout redesign.

### Part 5 — Profile polish (web)

- **Identity strip:** slightly stronger **shadow** on the header card for depth.
- **Posts list:** tighter vertical spacing between previews.
- **Activity empty state:** upgraded to the same **actionable CTA language** as the feed (Discussions + Explore), using existing `Button` patterns.

**Before → after:** profile read well for populated users but **empty / low-activity** states didn’t onboard behavior; they now **point to the next meaningful step**.

### Part 6 — Empty states

- **Thread replies:** replaced a single muted line with a **dashed, guided panel** (mention tip + encouragement).
- **Profile activity:** upgraded from a plain box to **CTA-backed** guidance (see above).

### Part 7 — Consistency (web + mobile)

- **Web:** feed + discussion surfaces share **card hover language**, **rounded primary actions**, and **mention affordances** in composers.
- **Mobile:** feed like control uses **Tooltip + splashRadius + AnimatedScale** for a premium tap read; forum reply field uses **filled outline** styling and clearer hint copy; empty replies use a **soft callout** aligned with web’s “start the conversation” tone.

**Note:** Full `@` autocomplete on Flutter was **not** shipped here to avoid a large new client subsystem; mobile keeps **parity in polish** (composer + empty states + like interaction) while web carries the richer mention UI.

### Part 8 — Documentation

- This file satisfies the Phase P documentation request.

---

## Before vs after (product reasoning)

| Dimension | Before | After |
| --- | --- | --- |
| Reactions | Correct totals; picker felt utilitarian | Selected state + summary cueing + light press feedback |
| Mentions | Free-text only | Guided `@` flow; ranked suggestions; same server contract |
| Composers | Plain stacks of controls | Clear hierarchy, meters, previews, separated action row |
| Feed loading | Visual skeleton only | Skeleton + accessibility busy state + tighter rhythm |
| Profile / empty | Informative but passive | Actionable CTAs + clearer “why this is empty” |

---

## Remaining gaps (intentional / follow-ups)

1. **Flutter @ autocomplete:** would need either a shared suggestions client + overlay list or reuse of web API with `Authorization` bearer — scope kept to **hint + web parity** in Phase P.
2. **Mention suggestions for signed-out users:** API returns empty (by design); no guest suggestions.
3. **Remote image optimization:** create-post preview uses `<img>` to avoid `next/image` domain allowlist friction; not optimized bandwidth-wise.
4. **Reaction summary animation:** intentionally minimal; no aggregate “bounce” on count changes (would fight reduced-motion expectations if added carelessly).

---

## Verification

Recommended checks after merge:

- `npm run lint`
- `npx tsc --noEmit`
- `dart analyze` (from `carmunity_app/`)

---

## Success criteria (Phase P)

- Carmunity reads **more intentional** in discussions and the feed.
- **No change** to mention parsing contracts; only authoring assistance was added.
- **No new major systems** — one small read-only suggestions route plus UI wiring.
