import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Discussions Basics",
  description:
    "Learn how Discussions work on Carasta and how they fit into the broader Carmunity and platform identity.",
};

export default function DiscussionsBasicsPage() {
  return (
    <ResourcePageLayout
      eyebrow="Discussions basics"
      title="Discussions are Carasta's canonical public term for thread-based conversation."
      description="This page explains what Discussions are, how they differ from other surfaces, and why the term is standardized in the public content system."
      relatedLinks={pickResourceLinks([
        "/resources/what-is-carmunity",
        "/resources/messages-basics",
        "/resources/trust-and-safety",
        "/resources/glossary",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">What Discussions are</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Discussions are the platform&apos;s thread-based conversation areas. They
            organize talk around specific topics, categories, and enthusiast
            interests while still connecting back to the same user identity used
            across Carasta.
          </p>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            Why the term matters
          </h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            The public site standardizes on <strong>Discussions</strong> to
            avoid drift and make the knowledge layer easier to understand and
            retrieve later. It is the term visitors should see consistently.
          </p>
        </section>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          How Discussions fit into the larger product
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Public context",
              body: "Discussions help people ask questions, compare opinions, and talk through automotive topics in a structured way.",
            },
            {
              title: "Shared identity",
              body: "The people in Discussions are the same people you see in Carmunity, profiles, and Garage-linked participation elsewhere on the site.",
            },
            {
              title: "Path to direct contact",
              body: "When a public thread needs to become a one-to-one conversation, Messages provide the private layer.",
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
          What users should expect
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
          <li>Topic-based conversation with visible community context</li>
          <li>Moderation standards shaped by the Community Guidelines</li>
          <li>Connection to the same platform identity model used elsewhere</li>
          <li>No promise that every discussion outcome is verified or authoritative</li>
        </ul>
      </section>
    </ResourcePageLayout>
  );
}
