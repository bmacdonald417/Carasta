import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Buying on Carasta",
  description:
    "A public guide to what buyers should expect before, during, and after participating in auctions on Carasta.",
};

export default function BuyingOnCarastaPage() {
  return (
    <ResourcePageLayout
      eyebrow="Buying on Carasta"
      title="What buyers should expect from the platform."
      description="This guide is meant to reduce ambiguity for prospective bidders and buyers. It explains the current high-level flow without overstating guarantees or replacing listing-specific details."
      relatedLinks={pickResourceLinks([
        "/resources/auction-basics",
        "/resources/trust-and-safety",
        "/resources/faq",
        "/how-it-works",
        "/contact",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Before bidding",
            body: "Review the listing, seller context, reserve state where shown, and the current auction details so you understand what you are participating in.",
          },
          {
            title: "During the auction",
            body: "Follow the live auction closely, pay attention to timing, and understand that auction mechanics such as anti-sniping are intended to keep bidding more legible and fair.",
          },
          {
            title: "After the close",
            body: "Use the platform's guidance and communication paths to understand next steps, while recognizing that the exact transaction flow can still depend on the listing and parties involved.",
          },
        ].map((step) => (
          <ResourceContentSection
            key={step.title}
            as="div"
            title={step.title}
            titleAs="h2"
            surface="default"
            padding="md"
          >
            <p className="text-sm leading-6 text-muted-foreground">{step.body}</p>
          </ResourceContentSection>
        ))}
      </div>

      <ResourceContentSection title="A responsible buyer baseline" surface="default" padding="lg">
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Read listing details carefully and do not rely only on summaries</li>
          <li>Use judgment around condition, fit, shipping, payment, and timing</li>
          <li>Ask questions when you need clarification</li>
          <li>Use trust/support pages when you need platform-level guidance</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
