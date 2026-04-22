import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
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
        "/community-guidelines",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ResourceContentSection title="What Discussions are" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            Discussions are the platform&apos;s thread-based conversation areas. They
            organize talk around specific topics, categories, and enthusiast
            interests while still connecting back to the same user identity used
            across Carasta.
          </p>
        </ResourceContentSection>
        <ResourceContentSection title="Why the term matters" surface="default" padding="md">
          <p className="text-sm leading-6 text-muted-foreground">
            The public site standardizes on <strong>Discussions</strong> to
            avoid drift and make the knowledge layer easier to understand and
            retrieve later. It is the term visitors should see consistently.
          </p>
        </ResourceContentSection>
      </div>

      <ResourceContentSection
        title="How Discussions fit into the larger product"
        surface="default"
        padding="lg"
      >
        <div className="grid gap-4 md:grid-cols-3">
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
            <ResourceContentSection
              key={item.title}
              as="div"
              title={item.title}
              titleAs="h3"
              surface="inset"
              padding="md"
            >
              <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
            </ResourceContentSection>
          ))}
        </div>
      </ResourceContentSection>

      <ResourceContentSection title="What users should expect" surface="muted" padding="lg">
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Topic-based conversation with visible community context</li>
          <li>Moderation standards shaped by the Community Guidelines</li>
          <li>Connection to the same platform identity model used elsewhere</li>
          <li>No promise that every discussion outcome is verified or authoritative</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
