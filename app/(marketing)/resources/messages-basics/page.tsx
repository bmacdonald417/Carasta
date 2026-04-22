import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Messages Basics",
  description:
    "Learn how messaging fits into Carasta's public product story and trust model.",
};

export default function MessagesBasicsPage() {
  return (
    <ResourcePageLayout
      eyebrow="Messages basics"
      title="Messages are the direct conversation layer inside Carasta."
      description="This page explains where messaging fits into the product without overstating what private conversation can guarantee."
      relatedLinks={pickResourceLinks([
        "/resources/discussions-basics",
        "/resources/trust-and-safety",
        "/resources/what-is-carmunity",
        "/contact",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ResourceContentSection title="What Messages are for" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Messages let people continue a conversation directly when a public
            post or Discussion needs a one-to-one follow-up. They are part of
            the same platform identity model as the rest of Carasta.
          </p>
        </ResourceContentSection>
        <ResourceContentSection title="What Messages are not" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Messaging is not a promise of verified deal safety, final payment
            protection, or legal review. It is a communication tool inside the
            platform, not a substitute for normal transaction judgment.
          </p>
        </ResourceContentSection>
      </div>

      <ResourceContentSection
        title="How messaging fits into trust and support"
        surface="muted"
        padding="lg"
      >
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Use it to continue conversations, coordinate details, or ask follow-up questions</li>
          <li>Keep platform rules and Community Guidelines in mind even in direct interaction</li>
          <li>Use public support paths if you need help beyond normal user-to-user communication</li>
          <li>Do not treat private messages as a replacement for clear listing review or policy reading</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
