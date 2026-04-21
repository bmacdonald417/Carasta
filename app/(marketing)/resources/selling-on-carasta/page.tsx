import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Selling on Carasta",
  description:
    "A public guide to what sellers can do on Carasta and how seller tools fit into the current product.",
};

export default function SellingOnCarastaPage() {
  return (
    <ResourcePageLayout
      eyebrow="Selling on Carasta"
      title="Carasta's seller side is more than a listing form."
      description="This guide explains the current seller story at a trustworthy public level: listings, visibility, auction participation, and the direction of seller-intelligent tools."
      relatedLinks={pickResourceLinks([
        "/resources/auction-basics",
        "/resources/trust-and-safety",
        "/resources/what-is-carasta",
        "/contact",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">Current seller value</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Sellers benefit from a platform that already connects identity,
            marketplace activity, and audience. The product story includes
            listing visibility, auction mechanics, and the broader Carmunity
            context that surrounds a sale.
          </p>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            Seller tools direction
          </h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Carasta is moving toward stronger seller marketing support,
            analytics, and AI-assisted workflows. This guide describes that
            direction carefully without implying a completed workspace redesign.
          </p>
        </section>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          What sellers should focus on
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
          <li>Present the vehicle clearly and accurately</li>
          <li>Understand how auction visibility and buyer trust connect</li>
          <li>Use current seller tools and support paths where they exist</li>
          <li>Recognize that public guidance does not replace final operational or legal specifics</li>
        </ul>
      </section>
    </ResourcePageLayout>
  );
}
