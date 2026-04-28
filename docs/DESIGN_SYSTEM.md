# Design System (Starter)

This is a lightweight starter design system for **demo UI modernization** work.

## First principle: inspect existing tokens first
Do **not** invent brand colors, token names, or theme primitives in isolation.

Before changing any colors or tokens, inspect:
- `tailwind.config.ts`
- `app/globals.css`
- `styles/*.css` (semantic tokens and legacy token maps)
- UI primitives in `components/ui/*`

If you can accomplish the task by **using existing semantic classes** (`bg-card`, `text-foreground`, `border-border`, `text-primary`, etc.), do that first.

## Visual style direction
- Premium, calm, product-forward UI
- Subtle surfaces with clear hierarchy
- Minimal ornamentation; polish comes from proportion, rhythm, and restraint
- “Demo-ready” screens: they should look great in screenshots and recordings

## Typography principles
- Default text should be comfortable at typical laptop viewing distances
- Strong hierarchy:
  - page title
  - section title
  - body
  - supporting / muted
- Avoid overusing uppercase; reserve for micro-labels with tracking
- Prefer consistent line-heights and avoid cramped paragraphs

## Spacing principles
- Use a consistent vertical rhythm (stack spacing in small set of steps)
- Cards/panels should have consistent padding (avoid per-screen one-offs)
- Keep touch targets \(\ge 44px\) on mobile for primary actions

## Cards / panels
- Use `bg-card` / `text-card-foreground` for primary surfaces
- Use `border-border` and a light shadow (`shadow-e1/e2`) for elevation cues
- Avoid heavy borders; prefer subtle borders + spacing to communicate structure

## Buttons
- Primary: `bg-primary text-primary-foreground` (reserved for the most important action)
- Secondary/outline: `border-border` with hover `bg-accent`
- Icon buttons should:
  - have consistent size
  - be discoverable (tooltip/title)
  - show focus rings

## Navigation
- Clear active states
- Consistent spacing across header and side nav
- Avoid shifting layout on active/hover

## Forms
- Labels: clear and readable (avoid faint contrast)
- Inputs:
  - consistent height
  - visible focus ring
  - predictable error state styling
- Error messages should be helpful and specific

## Responsive behavior
- Mobile-first layouts; avoid overflow and horizontal scrolling
- Prefer stacked content on small screens
- Images should have defined aspect ratios and safe fallback states
- Verify: 375px, 430px, 768px, 1024px+

## Accessibility expectations
- Visible focus rings for keyboard navigation
- Maintain adequate contrast (especially muted text)
- Use semantic headings and landmarks
- Avoid relying on color alone to convey state

## Animation / motion guidance
- Motion should be subtle and purposeful
- Prefer short durations and eased transitions
- Avoid large parallax or heavy continuous animations on core screens

