import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Draft terms of service for Carmunity by Carasta.",
};

export default function TermsPage() {
  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-10">
        <LegalDraftBanner />

        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-neutral-100 md:text-4xl">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: April 18, 2026 (draft outline)</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            This page is a structured <strong className="text-neutral-200">outline</strong> for
            counsel to replace with binding terms. By using Carmunity by Carasta
            you will be asked to agree to these terms, our Privacy Policy, and
            Community Guidelines at account creation (email/password flow).
          </p>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">1. Introduction &amp; acceptance</h2>
            <p>Placeholder: agreement to terms, eligibility, changes with notice mechanics.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">2. Accounts &amp; conduct</h2>
            <p>Placeholder: account security, prohibited conduct, enforcement.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">3. Carmunity &amp; Discussions (UGC)</h2>
            <p>
              Placeholder: license grant from users for hosting UGC, moderation,
              takedowns, and repeat infringer policy where applicable.
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">4. Auctions &amp; marketplace</h2>
            <p>Placeholder: fees, bids, condition reports, disputes — align with live product policies.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">5. Disclaimers &amp; liability</h2>
            <p>Placeholder: warranties disclaimer, limitation of liability, indemnity (counsel drafted).</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">6. Governing law &amp; disputes</h2>
            <p>Placeholder: venue, arbitration or litigation election.</p>
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
        </div>
      </div>
    </section>
  );
}
