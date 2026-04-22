import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Profiles and Garage",
  description:
    "Learn how profiles and Garage identity fit into Carasta's social and marketplace model.",
};

export default function ProfilesAndGaragePage() {
  return (
    <ResourcePageLayout
      eyebrow="Profiles and Garage"
      title="Profiles and Garage are part of Carasta's identity system."
      description="They help the platform feel like a place where enthusiasts show context, not just transact anonymously."
      relatedLinks={pickResourceLinks([
        "/resources/what-is-carmunity",
        "/resources/what-is-carasta",
        "/resources/selling-on-carasta",
        "/resources/buying-on-carasta",
        "/resources/glossary",
      ])}
    >
      <ResourceContentSection title="Why identity matters here" surface="default" padding="lg">
        <p className="text-base leading-7 text-muted-foreground">
          Carasta treats identity as a product feature. Profiles and Garage give
          people a way to show who they are, what they own, and what they care
          about, which makes public participation and marketplace activity feel
          more grounded.
        </p>
      </ResourceContentSection>

      <div className="grid gap-4 md:grid-cols-2">
        <ResourceContentSection title="Profiles" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Profiles connect activity across the platform. The same identity can
            show up in Carmunity, Discussions, auctions, Messages, and seller
            surfaces instead of living in separate silos.
          </p>
        </ResourceContentSection>
        <ResourceContentSection title="Garage" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Garage gives users a place to express ownership, projects, and dream
            cars. It is not only a visual extra. It supports the broader
            enthusiast identity model the platform is built around.
          </p>
        </ResourceContentSection>
      </div>

      <ResourceContentSection title="How this supports trust" surface="muted" padding="lg">
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>It gives public participation more continuity and context</li>
          <li>It helps users understand who they are interacting with on the platform</li>
          <li>It supports the product story that community and marketplace belong together</li>
          <li>It does not replace normal user judgment or transaction-specific diligence</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
