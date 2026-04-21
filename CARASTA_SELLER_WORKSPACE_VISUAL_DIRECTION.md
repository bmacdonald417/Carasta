# Carasta Seller Workspace Visual Direction

## Executive Summary
The seller growth workspace should become a **distinct sub-theme** inside Carasta: still recognizably Carasta, but more analytical, lighter, more legible, and more structured than the public-facing site. The goal is not a dramatic rebrand. The goal is a tool-quality environment that sellers trust, understand quickly, and want to work inside.

This document recommends one primary visual direction and one fallback direction. The recommended path is designed to be implementable against the current codebase without requiring a total design-system rewrite before work can begin.

## Recommended Visual Direction
### Name
**Light Analytic Command**

### Core feel
- premium SaaS-grade
- calm, crisp, deliberate
- more editorial than flashy
- high-information-density without clutter
- confident and strategic rather than “live auction adrenaline”

### Why this is the recommended direction
- It solves the current scanability problem.
- It separates seller decision-making from the darker consumer-facing brand shell.
- It preserves Carasta identity while removing the overreliance on red and glassy dark panels.
- It is implementable using the current component architecture if new seller-specific surface tokens are introduced.

## Fallback Direction
### Name
**Dark Slate Intelligence**

### Core feel
- darker, more restrained, more modern than the current workspace
- less glass, less copper, less red
- closer to a polished operations dashboard

### When to choose it
Choose this fallback only if stakeholders strongly prefer keeping the seller area visually closer to the rest of the product.

### Tradeoffs
- lower thematic change
- less risk of the workspace feeling disconnected from Carasta
- but weaker improvement in scanability and premium tool feel than the recommended direction

## Distinct Sub-Theme Decision
### Recommendation
Yes, the seller growth workspace should be a **distinct sub-theme** from the rest of Carasta.

### Rationale
The main site is doing brand storytelling, social emotion, discovery, and community identity. The seller workspace is for:
- prioritization
- diagnostics
- execution
- monitoring
- optimization

Those jobs benefit from a cleaner, more analytical visual language.

### What should remain shared
- typography family
- core spacing discipline
- icon style
- global brand accent logic
- semantic state meanings

### What should differ
- surface brightness
- panel layering
- information hierarchy
- chart styling
- how accent colors are used

## Palette Behavior
### Recommended palette model
#### Base neutrals
- canvas: warm off-white or soft cool-white
- primary panels: white / near-white
- secondary panels: pale slate / mist gray
- tertiary emphasis surfaces: deep slate for selected callouts or filters

#### Brand accent
- use the Carasta accent in a controlled way for brand anchors and selected key actions
- do not use copper as the dominant analytic signal color

#### Analytic accent
- use a cool blue or blue-violet for charts, info states, data emphasis, and active analytical affordances

#### Semantic states
- success: emerald
- info: blue
- caution: amber
- urgency: red

### Recommended usage rules
- Red should return to being exceptional, not ambient.
- Copper/brand accent should be sparse and identity-level, not chart-level.
- Blue should carry information and analysis.
- Most card/chrome contrast should come from surface layering and typography, not from neon accents.

## Surface Strategy
### Recommended path
Use a **mixed-surface hierarchy**:

1. **Page canvas**
   - light neutral
   - clean and quiet

2. **Primary modules**
   - white or near-white cards
   - subtle borders
   - minimal shadow or soft elevation

3. **Secondary analytic surfaces**
   - light slate surfaces
   - used for grouped metrics, filter bands, trend sections

4. **Emphasis surfaces**
   - dark slate or rich neutral panels
   - used sparingly for AI insight bands, sticky controls, or featured recommendation zones

### Why this works
- It lets dense data breathe.
- It improves readability of tables, forms, and charts.
- It lets urgency stand out.

## Chart Treatment
### Current constraint
The current workspace mostly uses lists and simple proportion bars. There is no charting library dependency yet, so richer charting is net-new work.

### Recommended chart behavior
- line charts for trends over time
- stacked or grouped bars for channel/source comparison
- horizontal bars for rankings and distributions
- small sparklines inside KPI modules where useful

### Visual rules
- charts should use restrained color ranges
- one primary analytic accent plus semantic highlights
- no neon glows
- no heavy gradients unless subtle and data-supportive
- gridlines soft and quiet
- data labels and legends should prioritize readability over decoration

### If no charting library is introduced in the first pass
Use:
- upgraded tokenized proportion bars
- sparkline-style mini modules only if implementable without heavy dependency cost
- table-plus-microviz patterns

## Card / Module System
### Recommended module families
#### 1. KPI cards
Used for:
- total views
- bid clicks
- share clicks
- active campaigns

Structure:
- compact eyebrow label
- bold value
- optional delta
- optional supporting note
- optional sparkline or status chip

#### 2. Insight cards
Used for:
- next best action
- anomaly detection
- momentum warnings
- readiness prompts

Structure:
- state badge
- concise title
- why it matters
- primary CTA

#### 3. Workspace panels
Used for:
- AI copilot
- content pack
- share/promote
- campaign details

Structure:
- stronger panel header
- utility actions
- clear subsections
- scroll containment when needed

#### 4. Data tables / logs
Used for:
- campaigns
- recent activity
- event logs

Rules:
- clearer row density options
- stronger header contrast
- hover state without heavy color fills
- readable timestamp and secondary metadata styling

### Implementation implication
The repeated KPI tile and panel patterns in the current workspace should be consolidated into reusable seller-specific primitives rather than re-styled ad hoc page by page.

## Typography Direction
### Recommendation
Keep the current type families, but change how they are used.

### Rules
- retain `font-display` for major workspace titles and occasional section headers
- reduce excessive uppercase usage on dense analytical surfaces
- rely more on clear sentence-case utility labels for readability
- keep numeric data prominent and tabular where possible

### Why
The current display style helps Carasta feel distinct, but in a dense seller environment too much uppercase makes scanning slower and more fatiguing.

## State Semantics
### Info
- blue
- used for guidance, recommendations, explanations, and assistant-related signals

### Success
- emerald
- used for healthy performance, completed tasks, or positive status changes

### Caution
- amber
- used for watch conditions, declining momentum, incomplete listing readiness

### Urgency
- red
- used only for true urgency:
  - ending soon with weak traction
  - severe drop-offs
  - critical action needed

### Neutral / inactive
- slate / muted gray
- used for baseline labels, secondary metadata, and dormant states

## Recommended Component / Token Plan
### Reuse from current system
- existing layout containers
- current button/input/textarea/select primitives
- typography families
- spacing and border-radius scale

### New seller-specific pieces to add
- seller workspace surface tokens
- `SellerKpiCard`
- `SellerInsightCard`
- `SellerSectionPanel`
- tokenized analytic bar / microviz component
- unified seller status badge system

### What should be reduced or removed
- hardcoded `#ff3b5c` throughout seller surfaces
- repeated `bg-white/5`, `bg-white/[0.03]`, `bg-black/20` ad hoc patterns
- overuse of dark glass and low-contrast white-on-black cards

## Recommended Implementation Order
### Phase 1
Create seller-specific surface tokens and module primitives.

### Phase 2
Refactor the marketing overview to use the new module system.

### Phase 3
Refactor the per-listing workspace top fold, insight layer, and AI panel.

### Phase 4
Upgrade analytics treatments, campaign tables, and activity logs.

### Phase 5
Introduce richer charting only if the first phases prove the hierarchy and module system.

## Implementation Readiness: Go / No-Go
### Decisions sufficiently settled
- The seller workspace should not remain a simple dark extension of the main site.
- A distinct sub-theme is warranted.
- Red should become a restrained urgency color, not the default ambient accent.
- The workspace should prioritize actionability and scanability over brand drama.
- New seller-specific primitives are preferable to repeated one-off restyling.

### Safe to implement now
- seller-specific token layer
- seller module/card primitive extraction
- hierarchy changes to overview and per-listing top sections
- state-semantic cleanup
- removal of hardcoded red in favor of systemized accent logic

### Should wait
- final charting library decision
- deep animated or highly custom visualization work
- cross-product restyling outside the seller area
- any mobile seller-workspace expansion

### Remaining stakeholder answers
1. How light should the seller workspace become relative to the main site?
2. Is a blue or blue-violet analytic accent acceptable alongside retained Carasta branding?
3. Should the first seller redesign optimize for multi-listing portfolio management or single-listing execution first?
4. Are there preferred visual reference products that should constrain the final direction?

## Dependencies
- approval of the distinct sub-theme approach
- token strategy decision for seller-only surfaces
- decision on whether to add a chart library in the first seller redesign phase
- alignment with the homepage/public IA work so the overall product story stays coherent

## Recommended Next Implementation Phase After This Pass
### Recommended phase
**Begin web implementation with homepage/public IA restructuring and in parallel prepare seller workspace primitives/tokens, but do not fully redesign the seller workspace until the public-story phase is stable.**

### Practical sequence
1. implement homepage/public IA changes
2. create seller token/module foundation
3. redesign seller overview
4. redesign seller per-listing workspace

This sequencing minimizes rework while keeping the seller workspace visual system concrete enough to start building confidently.
