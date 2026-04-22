# Carmunity Phase 2X — Bounded Assistant ↔ Quick help palette handoff

This document records the **Phase 2X** work: a **read-only, deterministic** bridge between **Carasta Assistant** and the **Quick help palette** (Phase 2W), without merging chat and palette or expanding assistant scope.

---

## 1. Files created

| File | Purpose |
|------|---------|
| `lib/help/assistant-palette-bridge.ts` | Deduped `topicId` collection from assistant `citations` and `recommendedRoutes` via `findCanonicalHelpTopicByHref`; exports `ASSISTANT_PALETTE_BRIDGE_VERSION`. |
| `CARMUNITY_PHASE_2X_ASSISTANT_PALETTE_HANDOFF.md` | This handoff. |

---

## 2. Files modified

| File | Change summary |
|------|----------------|
| `app/providers.tsx` | Wraps the app tree with `HelpPaletteProvider` so **Carasta Assistant** (sibling of `CarastaLayout` in root layout) can call `useHelpPalette`. |
| `components/carasta/CarastaLayout.tsx` | Removed nested `HelpPaletteProvider`; layout still uses `openPalette` from context. |
| `components/help/HelpPaletteProvider.tsx` | Added `assistantHighlightTopicIds`, `openPaletteFromAssistant`, clearing highlights on `openPalette`, shortcut open, and dialog close; palette rows highlight matching `topicId`s; short bridge copy in header when highlights active; `data-assistant-bridge-version` on dialog. |
| `components/assistant/carasta-assistant-launcher.tsx` | Uses `AssistantAnswer` type; **Open Quick help** CTA resolves topic ids and calls `openPaletteFromAssistant`, then closes assistant dialog to avoid stacked modals. |
| `lib/help/help-retrieval.ts` | `findCanonicalHelpTopicByHref` now normalizes absolute URLs to pathname and ensures leading `/` before index/static lookup. |

*(Phase 2U–2W foundations: `product-help`, `help-palette`, `help-retrieval` static hub rows, etc., remain the canonical taxonomy source.)*

---

## 3. Biggest assistant ↔ palette bridge improvements

- **Single provider at app shell**: Quick help context is available to both shell chrome and the floating assistant launcher.
- **Explicit handoff CTA**: After each successful reply, users get **Open Quick help** with copy that ties the action to the same shortcut-driven palette (`Ctrl`/`⌘` + `/`).
- **Deterministic topic carryover**: Citation and recommended-route `href`s are resolved to the same `topicId` space the palette uses; matching rows get visible emphasis.

---

## 4. Routing / highlighting / topic-continuity improvements

- **Routing**: Reuses `findCanonicalHelpTopicByHref` (canonical index + `STATIC_HELP_BY_HREF` for hub paths) — no parallel assistant-only URL taxonomy.
- **Highlighting**: `assistantHighlightTopicIds` is a `Set` applied in all palette sections (primary, related, global pins) so any visible canonical row for the current page can light up if the assistant pointed at it.
- **Continuity**: Highlights are set only when opening from the assistant; cleared when using normal `openPalette`, the keyboard shortcut, or closing the palette — predictable, no hidden state across sessions.

---

## 5. Shared patterns / components introduced or extended

- **`collectAssistantPaletteTopicIds`** (`assistant-palette-bridge.ts`): small, testable resolver from `AssistantAnswer` slices → palette `topicId[]`.
- **`HelpPaletteContext`**: extended with `openPaletteFromAssistant` and `assistantHighlightTopicIds` for a bounded, explicit API.
- **`findCanonicalHelpTopicByHref`**: slightly more robust href normalization for future absolute URLs in API payloads.

---

## 6. Intentionally deferred

- **Assistant ↔ palette “reverse” bridge** (e.g. opening assistant from a palette row).
- **Deep-linking palette open state** in the URL (shareable palette state).
- **Auto-scroll to first highlighted row** inside the dialog (nice-to-have UX).
- **Broad citation / chunk schema changes** or RAG/vector retrieval.
- **Palette as chat** or **assistant as full help browser** — explicitly out of scope.

---

## 7. Validation result

Run locally from repo root (2026-04-22):

- **`npm run lint`**: completed successfully (`next lint`). Existing warnings only: `@next/next/no-img-element` in `AuctionsMapView.tsx`, `CarastaLayout.tsx`, `InstagramShowcase.tsx` (unchanged by this phase).
- **`npx tsc --noEmit`**: **pass** (exit code 0). A `MapIterator` iteration in `findCanonicalHelpTopicByHref` was adjusted to `Array.from(...values())` for compatibility with the project’s default TS target.

**Sanity checks (manual):**

- Assistant still returns answers; **Open Quick help** opens the palette.
- When citations match palette rows on the current path, those rows show highlight styling.
- Canonical `Link` targets unchanged; palette remains read-only link list.
- `Ctrl`/`⌘` + `/` still opens palette and clears assistant-driven highlights.

---

## 8. Recommendation for the next phase

**Phase 2Y (suggested focus):** *Palette discoverability + optional reverse hint* — e.g. a single line in the palette footer when the user last used the assistant (session-scoped, no chat), or **scroll-into-view** for the first highlighted topic; optionally **telemetry** on `openPaletteFromAssistant` vs organic opens to validate the bridge. Keep **canonical URLs** and **bounded** surfaces; still **no** merged chat/palette.
