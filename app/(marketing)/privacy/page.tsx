import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Draft privacy policy for Carmunity by Carasta.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-background px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-10">
        <LegalDraftBanner />

        <header className="space-y-2">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-neutral-100 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: April 18, 2026 (draft outline)</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            This page is a structured <strong className="text-neutral-200">outline</strong> for
            counsel to replace with binding language. It describes how Carmunity
            by Carasta may collect, use, and protect data across auctions, the
            social feed, and Discussions.
          </p>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">1. Who we are</h2>
            <p>Placeholder: entity name, contact address, and DPO or privacy contact if applicable.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">2. Data we collect</h2>
            <p>
              Placeholder: account data, profile and garage content, messages and
              UGC, device/usage analytics, transaction and payment-related data
              (via processors).
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">3. How we use data</h2>
            <p>Placeholder: provide the service, safety, fraud prevention, legal compliance, product improvement.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">4. Cookies &amp; analytics</h2>
            <p>Placeholder: categories of cookies, opt-out links, retention.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">5. Sharing &amp; processors</h2>
            <p>Placeholder: hosting, email, payments, analytics subprocessors and purposes.</p>
          </section>
          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-neutral-100">6. Your rights</h2>
            <p>Placeholder: jurisdiction-specific rights (access, deletion, portability, objection).</p>
          </section>

          <p>
            For privacy-related questions, contact{" "}
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
