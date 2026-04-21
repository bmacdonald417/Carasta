import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewSurfaceCard } from "@/components/review-mode/review-surface-card";
import { getReviewModeContext, isReviewModeEnabled } from "@/lib/review-mode";

export default async function ReviewPage() {
  if (!isReviewModeEnabled()) notFound();

  const ctx = await getReviewModeContext();
  if (!ctx) notFound();

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Review mode
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Temporary review hub
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
            This mode is only for pre-launch product and design review. It is
            env-gated, uses demo data where needed, and is intended to be
            removable later.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
          <p className="text-sm leading-7 text-amber-900">
            Review mode currently assumes demo access through seller handle{" "}
            <strong>@{ctx.sellerHandle}</strong> and profile handle{" "}
            <strong>@{ctx.profileHandle}</strong>. Admin surfaces are being shown
            from the same temporary review context.
          </p>
        </div>

        <div className="mt-10 rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Review packet guidance
          </p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-600">
            <li>Start with the public-facing experience, then move into community, seller, admin, and assistant surfaces.</li>
            <li>Demo data is intentionally seeded where empty routes would weaken review usefulness.</li>
            <li>Some actions are intentionally disabled in review mode. That is expected behavior for this temporary pre-launch preview system.</li>
          </ul>
        </div>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              1. Public-facing experience
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Review the public product story, support structure, trust posture, and overall first impression.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSurfaceCard
              title="Homepage"
              route="/"
              purpose="Primary public entry point for Carasta’s Carmunity-first, marketplace-proven, seller-intelligent story."
              seeded="Uses current public content plus live/fallback marketplace content."
              focus={[
                "visual hierarchy",
                "first impression clarity",
                "trust and polish",
                "navigation clarity",
              ]}
              mode="interactive"
              bestStartingPoint
            />
            <ReviewSurfaceCard
              title="How It Works"
              route="/how-it-works"
              purpose="Explains how the product fits together at a high level."
              seeded="Static content grounded in current product surfaces."
              focus={["clarity", "readability", "workflow explanation", "usefulness"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Why Carasta"
              route="/why-carasta"
              purpose="Explains the product’s differentiation and broader product story."
              seeded="Static content from the approved public-story work."
              focus={["brand coherence", "differentiation", "trust tone", "credibility"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Resources"
              route="/resources"
              purpose="Public knowledge and support directory."
              seeded="Uses the current grouped public content system."
              focus={["information architecture", "coverage clarity", "support usefulness", "scanability"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="FAQ"
              route="/resources/faq"
              purpose="Short-answer public help layer."
              seeded="Static FAQ content used by both humans and the assistant."
              focus={["brevity", "coverage quality", "retrieval-friendliness", "clarity"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Trust & Safety"
              route="/resources/trust-and-safety"
              purpose="Trust boundaries and safety/help routing surface."
              seeded="Current trust page content with careful non-legal framing."
              focus={["trust clarity", "support routing", "professionalism", "boundary communication"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Contact"
              route="/contact"
              purpose="Direct escalation path when self-serve help is not enough."
              seeded="Live contact form with review-stage help positioning."
              focus={["support confidence", "clarity of purpose", "readability", "professional tone"]}
              mode="interactive"
            />
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              2. Social and community surfaces
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Review community identity, discussion structure, and profile/garage expression.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSurfaceCard
              title="Carmunity"
              route="/explore"
              purpose="Primary community feed and social identity surface."
              seeded="Uses seeded/demo posts and discussion-aware community context where available."
              focus={["community identity", "feed usefulness", "social energy", "clarity of engagement surfaces"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Discussions landing"
              route="/discussions"
              purpose="Thread-discovery and discussion taxonomy surface."
              seeded="Uses seeded demo threads, discussion users, and taxonomy."
              focus={["taxonomy clarity", "thread discovery", "scanability", "maturity of the discussion experience"]}
              mode="interactive"
            />
            {ctx.previewThreadPath ? (
              <ReviewSurfaceCard
                title="Representative discussion thread"
                route={ctx.previewThreadPath}
                purpose="Full thread surface for evaluating replies, trust cues, and moderation affordances."
                seeded="Uses a seeded demo thread and seeded replies."
                focus={["readability", "reply structure", "trust cues", "moderation UX clarity"]}
                mode="interactive"
              />
            ) : null}
            <ReviewSurfaceCard
              title="Profile page"
              route={`/u/${ctx.profileHandle}`}
              purpose="Identity, trust, posts, and Garage-adjacent profile expression."
              seeded="Uses seeded demo profile content."
              focus={["identity richness", "profile usefulness", "trust expression", "Carmunity coherence"]}
              mode="interactive"
            />
            <ReviewSurfaceCard
              title="Garage / listings page"
              route={`/u/${ctx.sellerHandle}/listings`}
              purpose="Seller-owned listings surface for reviewing listing cards and seller-owned route behavior."
              seeded="Uses seeded live auctions for the review seller."
              focus={["listing presentation quality", "seller utility", "contrast/readability", "route usefulness"]}
              mode="interactive"
              caveat="This is temporarily exposed through review mode and is not meant as a permanent guest surface."
            />
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              3. Messaging
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Review the message list, the seeded listing-scoped conversation, and how clearly preview-only behavior is communicated.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSurfaceCard
              title="Conversations list"
              route="/messages"
              purpose="Message-thread list and empty/populated-state review surface."
              seeded="Uses a seeded demo conversation where available."
              focus={["list clarity", "empty vs populated behavior", "readability", "preview-mode clarity"]}
              mode="mixed"
              caveat="Conversation creation and messaging send actions are not the focus here; sending is disabled in review mode."
            />
            {ctx.previewConversationId ? (
              <ReviewSurfaceCard
                title="Seeded listing-scoped conversation"
                route={`/messages/${ctx.previewConversationId}`}
                purpose="One representative 1:1 thread tied to the demo listing."
                seeded="Uses seeded messages and listing-scoped context."
                focus={["thread layout", "listing context card", "readability", "product usefulness"]}
                mode="read_only"
                caveat="Send actions are intentionally disabled in review mode."
              />
            ) : null}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              4. Seller workspace
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              These are the highest-value signed-in-like product surfaces for pre-launch review.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSurfaceCard
              title="Seller marketing overview"
              route={`/u/${ctx.sellerHandle}/marketing`}
              purpose="Portfolio-level seller growth workspace overview."
              seeded="Uses demo seller data, seeded live listing, seeded marketing traffic, seeded notification, and a seeded review campaign."
              focus={["analytical hierarchy", "actionability", "module usefulness", "premium tool feel"]}
              mode="interactive"
              bestStartingPoint
            />
            {ctx.previewAuctionId ? (
              <ReviewSurfaceCard
                title="Per-listing marketing workspace"
                route={`/u/${ctx.sellerHandle}/marketing/auctions/${ctx.previewAuctionId}`}
                purpose="Managed active campaign workspace for one demo listing."
                seeded="Uses seeded plan, tasks, artifacts, linked promo post, traffic events, and conversation context."
                focus={["top-fold decision quality", "AI integration", "analytical quality", "seller usefulness"]}
                mode="mixed"
                caveat="Some actions remain read-only or preview-only in review mode."
              />
            ) : null}
            {ctx.previewAuctionId ? (
              <ReviewSurfaceCard
                title="Public listing detail"
                route={`/auctions/${ctx.previewAuctionId}`}
                purpose="Public-facing listing detail that the seller workspace is built around."
                seeded="Uses the same seeded live listing used in the seller workspace."
                focus={["listing trust cues", "public-marketplace quality", "content quality", "seller-to-public consistency"]}
                mode="interactive"
              />
            ) : null}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              5. Admin surfaces
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Temporarily reviewable admin surfaces that are useful for design and workflow critique.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReviewSurfaceCard
              title="Admin home"
              route="/admin"
              purpose="Top-level admin overview and review navigation surface."
              seeded="Uses current database aggregates and seeded live-auction data."
              focus={["admin clarity", "dashboard utility", "visual hierarchy", "readability"]}
              mode="read_only"
            />
            <ReviewSurfaceCard
              title="Admin marketing"
              route="/admin/marketing"
              purpose="Platform-wide marketing summary and analytics review surface."
              seeded="Uses seeded marketing traffic, review campaign data, and notification/event context."
              focus={["data density", "analytical usefulness", "admin scanability", "readability/contrast"]}
              mode="read_only"
            />
            <ReviewSurfaceCard
              title="Admin discussions moderation"
              route="/admin/moderation/discussions"
              purpose="Moderation queue walkthrough for discussions content."
              seeded="Uses a seeded review-mode discussion report."
              focus={["moderation clarity", "triage flow", "read-only review quality", "admin confidence"]}
              mode="read_only"
              caveat="Moderation mutation controls are intentionally disabled in review mode."
            />
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-neutral-950">
              6. Assistant
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              The assistant launcher appears globally. Use these suggested prompts to review grounding, routing, and bounded behavior.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Suggested assistant questions
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
              <li>• What is Carasta?</li>
              <li>• What is Carmunity?</li>
              <li>• How do forums work on Carasta?</li>
              <li>• Where do seller tools live?</li>
              <li>• Where do I find notifications or settings?</li>
              <li>• Where should I go if the assistant cannot verify my account situation?</li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}
