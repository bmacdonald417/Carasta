import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Current draft terms structure for Carmunity by Carasta, written to clarify platform expectations while final legal review is pending.",
};

export default function TermsPage() {
  return (
    <section className="bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-10">
        <LegalDraftBanner />

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Terms and conditions
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-neutral-500">
            Last updated: April 21, 2026 (draft structure)
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-neutral-600">
          <p>
            These terms are still being finalized, but the platform already
            needs a clearer public explanation of the current rules structure.
            By using Carasta, users should expect the service to operate under
            terms, privacy, and community standards even while formal legal
            drafting is still in progress.
          </p>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              1. Scope and current status
            </h2>
            <p className="mt-2">
              This page is a draft structure, not final binding legal language.
              It explains the current product areas these terms are expected to
              cover: Carmunity, Discussions, Messages, profiles, Garage
              identity, auctions, selling flows, and related support surfaces.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
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
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
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
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
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
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              5. Messaging, direct interaction, and platform boundaries
            </h2>
            <p className="mt-2">
              Messages help users communicate directly, but they do not remove
              the need for normal judgment or convert every private interaction
              into a platform guarantee. Final terms will clarify these
              boundaries more formally.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
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
      </div>
    </section>
  );
}
