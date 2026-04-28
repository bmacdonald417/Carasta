# Screenshot → Code Playbook

Practical workflow for modernizing a demo UI from screenshots using GitHub + ChatGPT + Cursor + Gemini.

## 1) Screenshot intake
Collect:
- **Before** screenshots (current UI)
- **Target** screenshots (desired direction or reference)
- Notes for:
  - layout/spacing changes
  - typography changes
  - states (hover/focus/active/loading/empty/error)
  - responsive expectations

Tips:
- Capture at least: 375px (mobile), 768px (tablet), 1280px (desktop).
- Include one screenshot showing the whole screen and one zoomed on the critical area.

## 2) Create a GitHub issue (required)
Use the issue form: **UI Modernization (Screenshot → Code)**.

Fill in:
- screen/page name
- route
- screenshot attachments/links
- desired changes
- must preserve / must not touch
- acceptance criteria
- validation commands
- risk level

## 3) Prompt preparation (ChatGPT)
Provide ChatGPT:
- Issue link and screenshots
- Current constraints (“do not touch” list)
- Definition of done

Ask ChatGPT to produce:
- UI analysis vs target screenshot
- Explicit component inventory (what to modify)
- Step-by-step implementation plan
- Risk callouts (what might break)
- Validation plan

## 4) Cursor implementation (feature branch)
Rules:
- Create a feature branch
- Keep changes scoped to the issue
- Prefer reusing existing primitives and semantic tokens

Implementation loop:
1. Find the exact screen route and primary component(s).
2. Make the smallest change that improves alignment to the target.
3. Verify states (hover/focus/active, loading, empty).
4. Check responsive breakpoints (mobile + desktop).
5. Capture after screenshots.

## 5) Gemini review (independent QA critic)
Give Gemini:
- Before + after screenshots
- PR diff / list of changed files
- Acceptance criteria

Ask it to critique:
- Visual regressions
- Inconsistent spacing/typography
- Missing states
- A11y issues (focus rings, contrast)
- Responsive layout issues

## 6) Human visual approval
Human owner reviews:
- Before/after screenshots
- Live preview if available
- Whether the “premium” feel is improved without clutter

If changes are needed:
- Update issue acceptance criteria if scope changes
- Keep iteration in the same PR (unless it becomes large; then split)

## 7) Merge / deploy flow
Before recommending merge, run:
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

Then:
- Ensure PR template checklist is completed
- Merge only after checks pass and screenshots approved

## Common failure modes (and how to avoid them)
- **Changing protected areas unintentionally**
  - Avoid touching auth/db/env/deploy/routing files unless explicitly authorized.
- **Overfitting to one screenshot**
  - Verify multiple breakpoints and real content lengths.
- **Introducing one-off styles**
  - Prefer existing primitives and semantic tokens.
- **Missing interaction states**
  - Always verify focus rings + hover + active + disabled.
- **Large PRs**
  - Keep to one screen/flow per issue when possible.

## Final polish checklist
- [ ] No overflow on mobile
- [ ] Tap targets >= 44px for key actions
- [ ] Focus rings visible and consistent
- [ ] Typography hierarchy is clear
- [ ] Spacing rhythm is consistent with adjacent screens
- [ ] Cards/panels use consistent border + shadow language
- [ ] No console errors on the screen
- [ ] Before/after screenshots attached
- [ ] Lint/typecheck/build pass

