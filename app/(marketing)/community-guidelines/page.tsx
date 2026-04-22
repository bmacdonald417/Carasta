import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "Current community guidelines for Carmunity by Carasta, written to clarify conduct expectations and moderation paths.",
};

export default function CommunityGuidelinesPage() {
  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-8">
        <LegalDraftBanner />
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Community Guidelines
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Community Guidelines
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: April 21, 2026 (draft structure)
          </p>
        </header>

        <div className="space-y-8 text-muted-foreground">
          <p>
            Carasta needs community standards that are understandable now, even
            while the final legal and policy drafting is still evolving. These
            guidelines explain the current direction for conduct across
            Carmunity, Discussions, and direct user interaction.
          </p>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              1. Be respectful
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Car culture can involve strong opinions. Carasta still expects
              users to disagree without harassment, hate speech, intimidation,
              or targeted abuse.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              2. Safety &amp; lawful behavior
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Do not use the platform to promote illegal or unsafe activity. The
              site can host enthusiast conversation without becoming a place for
              encouraging dangerous conduct.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              3. Authenticity &amp; spam
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Users should participate honestly. Avoid spam, coordinated
              inauthentic behavior, misleading promotion, or undisclosed
              commercial behavior where disclosure is appropriate.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              4. Marketplace and direct interaction
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Listings, auction participation, and Messages should be handled in
              good faith. Platform communication tools do not remove the need
              for honesty, clarity, and user judgment.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-lg font-semibold text-foreground">
              5. Moderation &amp; appeals
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Carasta may take moderation action when behavior undermines safety,
              trust, or platform quality. Final policy drafting will define
              appeal mechanics more precisely, but users should expect
              enforcement to exist.
            </p>
          </section>
        </div>

        <p className="text-sm text-muted-foreground">
          Questions?{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact us
          </Link>
          .
        </p>
        <p className="text-sm text-muted-foreground">
          For the broader trust layer, visit{" "}
          <Link href="/resources/trust-and-safety" className="text-primary hover:underline">
            Trust &amp; Safety
          </Link>{" "}
          or browse the full{" "}
          <Link href="/resources" className="text-primary hover:underline">
            Resources
          </Link>{" "}
          directory.
        </p>
      </div>
    </section>
  );
}
