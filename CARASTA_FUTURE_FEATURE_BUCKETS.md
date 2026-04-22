# Carasta Future Feature Buckets (Roadmap-aligned)

This document groups future ideas into **Near-term**, **Medium-term**, and **Later strategic** buckets, and flags risk/unknowns.

## Guiding principle
Ship features that reinforce the thesis:
- **Carmunity** drives habit + identity.
- **Market** monetizes intent and equips sellers.
- **Resources** builds trust and reduces risk.
- **AI** accelerates seller success and content quality, without becoming the “main product.”

---

## A) Near-term roadmap (next releases)
High-confidence, supports Carmunity-first IA and guest conversion.

### Guest preview + sign-up wall (product-ready gating)
- Metered preview on Carmunity surfaces
- Hard-gate participation (react/comment/post/follow)
- Consistent auth prompts (inline disabled actions + end-of-feed wall)

### Smarter assistant (workflow-first, not nav-first)
- **Seller pricing assistant** (Market → Sell / edit listing)
- **Seller marketing assistant** (generate captions, listing highlights, cross-post suggestions)
- **Quality checks**: missing specs, confusing claims, photo checklist (assistive, not punitive)

### AI-enriched seller marketing (basic)
- Auto-generate variant post copy for Carmunity promo
- Suggest tags/categories and “where to post” (forums/spaces)

### Video uploads (MVP)
- Upload video into posts/listings as media
- Basic playback, moderation/reporting hooks, limits/quotas

**Why near-term:** supports social proof + seller outcomes quickly; improves content richness.

---

## B) Medium-term roadmap (scale + differentiation)
Adds depth, increases retention, and expands seller tooling.

### Smarter assistant / agent capabilities (multi-step)
- “Help me sell this car” guided flow (collect details → draft listing → suggest price range → marketing plan)
- “Summarize this thread / listing” for trust + comprehension
- Personalized recommendations (people, forums, auctions) with transparent controls

### App-native live video creation tools
- In-app capture, trimming, clips
- Live session creation (if platform-ready), replay support

### Shopify/webhook/data enrichment (seller operations)
- Webhook ingest for inventory updates (where applicable)
- Optional storefront sync (careful: avoid becoming a generic ecomm platform)
- Structured data enrichment to improve search/filters

### Content/taxonomy generation (platform hygiene)
- Assist with listing categorization, attribute completion, and dedupe
- Generate “spec highlights” and structured fields from free text (with review)

---

## C) Later strategic roadmap (high leverage, higher risk)
Potential moat-building, but must be treated cautiously.

### Article/forum scraping or ingestion → gears/subgears + article generation
- Ingest external content to build knowledge graphs and structured resources
- Generate articles, guides, and topic hubs

### AI-enriched seller marketing (advanced)
- Multi-channel campaign generation (email/social templates)
- A/B testing suggestions and performance learning loops

### Advanced agentic automation
- “Run my listing refresh” with safe, reviewable diffs
- Auto-respond draft assistance (if messaging exists) with strict guardrails

---

## Risk / caution flags (by theme)

### Legal/compliance
- **Scraping/ingestion**: copyright, licensing, TOS violations, attribution requirements.
- **Generated content**: deceptive claims risk; require seller review and disclaimers.

### Data quality & content reliability
- Pricing assistant can mislead if comps are poor; needs confidence signals + “why.”
- Taxonomy generation must be reviewable; avoid irreversible automation.

### Operational complexity
- Live video creation tools: bandwidth, moderation, abuse vectors, storage cost.
- Webhooks/storefront sync: support burden, edge cases, reconciliation.

### Trust & safety
- AI should not enable fraud (e.g., polishing misleading listings). Add guardrails and reporting pathways.

---

## IA / roadmap consequences (what this direction implies)

### Navigation restructuring (Carmunity-first default)
- Logged-in default should be **Carmunity**, not a generic “Home.”
- Keep top-level stable: **Carmunity / Market / Resources**.
- Add new modules as sub-areas first (e.g., Messaging under Carmunity; Seller tools under Market).

### Public/homepage strategy
- Public homepage is a **marketing orchestrator** (brand + social proof + market trust + AI seller value).
- Carmunity preview drives conversion; Market browse supports credibility and high-intent conversion.

### Guest gating implementation (future work implications)
- Requires a consistent “read-only mode” across Carmunity surfaces.
- Requires metering and UX rules (wall after N views, intercept on action).
- Deep links must remain shareable in read-only mode.

### Account/profile placement
- Primary entry via avatar menu; contextual “Profile/Garage” entry under Carmunity only.
- Avoid duplicating profile entry under every top-level.

### Assistant placement
- AI assistant remains a **global utility**, but primary “value moments” are embedded in Market seller workflows.
- Avoid making “AI” a first-class top-level nav competing with Carmunity.

### Market grouping implications
- “Seller tools” should live under Market, not as a separate product area.
- Social promotion of listings remains Carmunity-owned content with Market-linked objects.

---

## App / site parity implications (conceptual)

### What should be shared across web + app
- Pillars and mental model: **Carmunity / Market / Resources**
- Guest vs logged-in rules: preview vs participation
- Market objects and URLs as shareable entities (read-only for guests)
- Trust/safety rules and reporting patterns

### What can differ by platform (expected)
- **Navigation mechanics**: web header vs app bottom tabs
  - App likely: tabs = Carmunity / Market / Resources / (optional) Create, plus avatar
- **Creation UX**: app can emphasize camera/video creation flows more strongly
- **Notification surfaces**: app can foreground notifications; web can keep in header/avatar

### How Carmunity-first affects app navigation later
- App should default to Carmunity feed tab
- Market remains a peer tab, not the default
- Assistant access should be present but not occupy a core tab unless it becomes a daily habit driver (unlikely vs Carmunity)

### Public vs logged-in behavior differences (web vs app)
- Web: public preview is important for SEO + sharing; strong guest mode needed
- App: guest mode is less critical; prompt install/sign-up early, but still allow deep-link read-only previews if the app supports it

