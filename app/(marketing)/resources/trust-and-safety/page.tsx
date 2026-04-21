import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Trust and Safety",
  description:
    "A practical overview of platform expectations, moderation, support paths, and the current trust boundaries on Carasta.",
};

export default function TrustAndSafetyPage() {
  return (
    <ResourcePageLayout
      eyebrow="Trust and safety"
      title="A clearer public trust layer for how Carasta works."
      description="This page is designed to reduce ambiguity. It explains the current trust posture, what users should expect, and what the platform does and does not claim."
      relatedLinks={pickResourceLinks([
        "/community-guidelines",
        "/privacy",
        "/terms",
        "/contact",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            What Carasta is responsible for
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Providing the platform surfaces and current public guidance</li>
            <li>Maintaining community and support paths</li>
            <li>Applying moderation and conduct standards through the current policy structure</li>
            <li>Clarifying product concepts so users can participate more confidently</li>
          </ul>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            What Carasta is not claiming
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Not every interaction or private message is guaranteed safe or verified</li>
            <li>Public guides do not replace final legal documents or listing-specific terms</li>
            <li>The platform does not remove the need for user diligence in transactions</li>
            <li>Current legal pages are still drafts pending formal review</li>
          </ul>
        </section>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          Where to go for help
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Resources",
              body: "Use the public guides when you need product explanation, glossary terms, buying basics, or seller context.",
            },
            {
              title: "Trust pages",
              body: "Use the Community Guidelines, Privacy Policy, and Terms pages when you need the current policy structure.",
            },
            {
              title: "Contact",
              body: "Use the contact page when your question goes beyond self-serve information or needs direct team attention.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5"
            >
              <h3 className="text-lg font-semibold text-neutral-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-neutral-600">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          Content design intent
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          These trust pages are being written to be understandable, responsible,
          and later usable as assistant source material. That means avoiding
          vague marketing language, avoiding fake certainty, and stating clearly
          when a page is still a draft structure rather than a final policy.
        </p>
      </section>
    </ResourcePageLayout>
  );
}
