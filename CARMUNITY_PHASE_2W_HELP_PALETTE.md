# Carmunity Phase 2W — Read-only help palette / command entry

## 1) Files created

- `lib/help/help-palette.ts` — deterministic `getHelpPaletteModel()` + stable global pins (canonical URLs only).
- `components/help/HelpPaletteProvider.tsx` — palette dialog, keyboard shortcut, `useHelpPalette()` hook.
- `CARMUNITY_PHASE_2W_HELP_PALETTE.md` (this document)

## 2) Files modified

- `components/carasta/CarastaLayout.tsx` — wraps the shell in `HelpPaletteProvider`; adds **Quick help** menu row (opens palette) before **Help center**; splits inner layout as `CarastaChrome` so `useHelpPalette()` is valid.
- `components/layout/AppSidebar.tsx` — **Quick help** control under Resources links (same shortcut affordance).
- `components/assistant/carasta-assistant-launcher.tsx` — marks the assistant `Textarea` with `data-skip-help-palette-shortcut` so **Ctrl/⌘ + /** does not fire while composing a question.

## 3) Biggest help-palette improvements

- **Product-wide read-only palette** (dialog) listing:
  - **Suggested for this page** — `getRetrievedHelpBundle` (Phase 2V) with route-aware ranking caps.
  - **Suggested next** — related canonical topics from the existing graph.
  - **Always useful** — deduped global pins (Resources hub, Why Carasta, How it works, FAQ, Trust & safety, Contact).
- **Clear non-chat positioning** — explicit copy that this is link routing only, and a calm pointer toward **Carasta Assistant** for exploratory Q&A.

## 4) Retrieval / command-entry improvements

- **Keyboard**: **Ctrl + /** or **⌘ + /** (outside inputs / contenteditable / `data-skip-help-palette-shortcut`) opens the palette.
- **Click entry**: signed-in avatar menu **Quick help** + desktop sidebar **Quick help** row.
- **Metadata**: `data-help-palette`, `data-help-palette-schema-version`, `data-help-retrieval-schema-version`, `data-product-help-context`, per-link `data-help-palette-tier` + existing `data-canonical-help-*` attributes.

## 5) Canonical routing improvements

- Palette links **only** use canonical public URLs from the Phase 2U/2V taxonomy (plus explicit `palette.*` pins for hub pages not otherwise indexed).
- **Deduping** prevents the global pin list from repeating items already shown in primary/related sections for the current route.

## 6) Shared patterns / components introduced or extended

- **`HelpPaletteProvider` / `useHelpPalette`** — small command-entry surface API (`openPalette`, `closePalette`, `setOpen`).
- **`getHelpPaletteModel`** — single composition point for palette content (retrieval + pins + schema versions).

## 7) Intentionally deferred

- No new generative flows, no vector/RAG, no nav redesign, no mobile bottom-nav clutter, no exhaustive admin-route mapping (unknown routes fall back to `carmunity.explore` per existing Phase 2V default).
- No guest-specific header button (shortcut remains available globally).

## 8) Recommendation for the next phase

**Phase 2X — Assistant ↔ palette handoff (still bounded):** when the assistant returns `recommendedRoutes` / citations, optionally surface a **“Open in Quick help”** chip that pre-highlights the same canonical `topicId` rows in the palette (read-only), without merging chat into the palette UI.

## Validation

Run `npm run lint` and `npx tsc --noEmit` before merge.
