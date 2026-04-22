import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";
import { ResourceCardGrid } from "@/components/resources/ResourceCardGrid";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Current draft terms structure for Carmunity by Carasta, written to clarify platform expectations while final legal review is pending.",
};

export default function TermsPage() {
  const relatedLinks = pickResourceLinks([
    "/privacy",
    "/community-guidelines",
    "/resources/trust-and-safety",
    "/resources/faq",
  ]);

  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-10">
        <LegalDraftBanner />

        <nav aria-label="Resources breadcrumb" className="text-sm text-muted-foreground">
          <Link
            href="/resources"
            className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Resources
          </Link>
          <span className="px-2 text-muted-foreground">/</span>
          <Link
            href="/resources/trust-and-safety"
            className="font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Trust &amp; Safety
          </Link>
          <span className="px-2 text-muted-foreground">/</span>
          <span className="text-foreground">Terms</span>
        </nav>

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Terms and conditions
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: April 21, 2026 (draft structure)
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            These terms are still being finalized, but the platform already
            needs a clearer public explanation of the current rules structure.
            By using Carasta, users should expect the service to operate under
            terms, privacy, and community standards even while formal legal
            drafting is still in progress.
          </p>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              1. Scope and current status
            </h2>
            <p className="mt-2">
              This page is a draft structure, not final binding legal language.
              It explains the current product areas these terms are expected to
              cover: Carmunity, Discussions, Messages, profiles, Garage
              identity, auctions, selling flows, and related support surfaces.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              2. Accounts and platform conduct
            </h2>
            <p className="mt-2">
              Users should expect baseline rules around account integrity,
              truthful participation, misuse prevention, and compliance with the{" "}
              <Link href="/community-guidelines" className="text-primary hover:underline">
                Community Guidelines
              </Link>
              . Final legal text will define the exact enforcement and notice
              mechanics.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              3. Carmunity, Discussions, and user content
            </h2>
            <p>
              Public participation on Carasta involves user-generated content.
              Final terms will define content permissions, moderation authority,
              takedown handling, and account consequences more precisely. For
              now, users should expect that platform participation is governed by
              conduct rules and moderation review, not a free-for-all posting
              environment.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              4. Auctions, listings, and seller participation
            </h2>
            <p className="mt-2">
              Auctions and seller workflows require clearer public framing.
              Final terms will define bidding commitments, listing expectations,
              payment-related responsibilities, dispute handling, and service
              limitations in detail. Until then, users should treat listing
              detail, auction rules, and trust pages as the current operational
              guidance rather than assuming hidden guarantees.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              5. Messaging, direct interaction, and platform boundaries
            </h2>
            <p className="mt-2">
              Messages help users communicate directly, but they do not remove
              the need for normal judgment or convert every private interaction
              into a platform guarantee. Final terms will clarify these
              boundaries more formally.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              6. Service limits and future legal finalization
            </h2>
            <p className="mt-2">
              Final legal drafting will add the formal disclaimer, liability,
              jurisdiction, and dispute language this page does not yet contain.
              This draft exists so users have a responsible public structure now
              instead of pure placeholders.
            </p>
          </section>

          <p>
            For questions about these terms, contact{" "}
            <a href="mailto:info@carasta.com" className="text-primary hover:underline">
              info@carasta.com
            </a>{" "}
            or use the{" "}
            <Link href="/contact" className="text-primary hover:underline">
              contact form
            </Link>
            .
          </p>
          <p>
            For the broader support and trust context around these drafts, visit{" "}
            <Link href="/resources/trust-and-safety" className="text-primary hover:underline">
              Trust &amp; Safety
            </Link>{" "}
            or the full{" "}
            <Link href="/resources" className="text-primary hover:underline">
              Resources
            </Link>{" "}
            directory.
          </p>
        </div>

        <section className="rounded-2xl border border-border bg-muted/30 p-8 shadow-e1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Next steps
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            Related trust and help pages
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            These pages are part of the same public Resources layer. They are
            meant to be read together when you need orientation, conduct
            expectations, or self-serve clarification alongside draft legal
            structure.
          </p>
          <div className="mt-8">
            <ResourceCardGrid items={relatedLinks} compact />
          </div>
        </section>
      </div>
    </section>
  );
}
