import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
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
        "/resources/faq",
        "/contact",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ResourceContentSection title="Current seller value" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Sellers benefit from a platform that already connects identity,
            marketplace activity, and audience. The product story includes
            listing visibility, auction mechanics, and the broader Carmunity
            context that surrounds a sale.
          </p>
        </ResourceContentSection>
        <ResourceContentSection title="Seller tools direction" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Carasta is moving toward stronger seller marketing support,
            analytics, and AI-assisted workflows. This guide describes that
            direction carefully without implying a completed workspace redesign.
          </p>
        </ResourceContentSection>
      </div>

      <ResourceContentSection title="What sellers should focus on" surface="muted" padding="lg">
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Present the vehicle clearly and accurately</li>
          <li>Understand how auction visibility and buyer trust connect</li>
          <li>Use current seller tools and support paths where they exist</li>
          <li>Recognize that public guidance does not replace final operational or legal specifics</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
