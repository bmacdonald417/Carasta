import type { Metadata } from "next";
import Link from "next/link";

import { LegalDraftBanner } from "@/components/legal/LegalDraftBanner";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Current draft privacy structure for Carmunity by Carasta, written to clarify data expectations while formal legal review is pending.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl space-y-10">
        <LegalDraftBanner />

        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Privacy policy
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500">
            Last updated: April 21, 2026 (draft structure)
          </p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed text-neutral-600">
          <p>
            This page is not final legal text, but it now explains the current
            privacy structure more clearly. Carasta needs a public statement of
            what kinds of data exist on the platform and how users should think
            about them while the final policy is still under review.
          </p>

          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              1. What kinds of data exist on Carasta
            </h2>
            <p className="mt-2">
              The platform can include account information, public profile and
              Garage information, community participation, Messages, auction and
              listing activity, and service-related analytics. Final legal text
              will define these categories more formally.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              2. Why that data may be used
            </h2>
            <p>
              Carasta uses platform data to operate the product, support user
              identity and participation, improve safety and moderation, and run
              marketplace workflows. Final policy language will formalize those
              uses and any applicable legal bases.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              3. What users should understand about public and private areas
            </h2>
            <p className="mt-2">
              Some information is intentionally public-facing, such as profile
              identity and certain platform participation. Other areas, such as
              Messages and account-related data, have different expectations.
              Users should not assume that every surface behaves the same way.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              4. Processors, analytics, and infrastructure
            </h2>
            <p className="mt-2">
              Final privacy language will identify service providers and data
              processing relationships in more detail. This draft acknowledges
              that analytics, hosting, communications, and marketplace
              operations may involve supporting providers.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              5. Rights, questions, and future finalization
            </h2>
            <p className="mt-2">
              Final review will add the full rights, retention, cookie, and
              jurisdiction language this page still lacks. Until then, privacy
              questions should be routed through the normal support path.
            </p>
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
