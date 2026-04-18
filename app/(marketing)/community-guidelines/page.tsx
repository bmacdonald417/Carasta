import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description:
    "Draft community guidelines for Carmunity by Carasta — user-generated content and conduct.",
};

export default function CommunityGuidelinesPage() {
  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-8">
        <LegalDraftBanner />
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-neutral-100 md:text-4xl">
            Community Guidelines
          </h1>
          <p className="text-sm text-muted-foreground">
            Last updated: April 18, 2026 (draft outline)
          </p>
        </header>

        <div className="space-y-8 text-neutral-300">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              1. Be respectful
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Outline for counsel: treat others with respect; disagree without
              harassment; no hate speech or slurs.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              2. Safety &amp; lawful behavior
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Outline: no instructions that encourage illegal street racing or
              unsafe public-road behavior; comply with local laws.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              3. Authenticity &amp; spam
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Outline: no coordinated inauthentic behavior; disclose commercial
              relationships where required.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-neutral-100">
              4. Moderation &amp; appeals
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Outline: enforcement actions, appeals channel, and escalation path
              to be defined with counsel.
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
      </div>
    </section>
  );
}
