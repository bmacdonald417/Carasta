import type { Metadata } from "next";

import { ResourceCardGrid } from "@/components/resources/ResourceCardGrid";
import { resourceSections } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Public resources for understanding Carasta, including FAQs, trust pages, platform guidance, and support paths.",
};

export default function ResourcesPage() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Resources
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            A real public knowledge layer for how Carasta works.
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
            Use these guides to understand the platform, learn the product
            vocabulary, find support, and see where trust, moderation, privacy,
            and auction basics fit into the current public experience.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {resourceSections.map((section) => (
            <section key={section.title}>
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                  {section.title}
                </p>
                <p className="mt-3 text-base leading-7 text-neutral-600">
                  {section.description}
                </p>
              </div>
              <div className="mt-6">
                <ResourceCardGrid items={section.items} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
