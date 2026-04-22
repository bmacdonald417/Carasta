import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "What Is Carmunity?",
  description:
    "Understand Carmunity as Carasta's community layer for social participation, identity, and ongoing enthusiast connection.",
};

export default function WhatIsCarmunityPage() {
  return (
    <ResourcePageLayout
      eyebrow="What is Carmunity?"
      title="Carmunity is Carasta's community layer."
      description="It covers the social side of the platform: who you follow, what you post, how your identity shows up, and how participation continues outside any single listing."
      relatedLinks={pickResourceLinks([
        "/why-carasta",
        "/how-it-works",
        "/resources/discussions-basics",
        "/resources/profiles-and-garage",
        "/resources/messages-basics",
      ])}
    >
      <ResourceContentSection
        title="Why the public site leads with Carmunity"
        surface="default"
        padding="lg"
      >
        <p className="text-base leading-7 text-muted-foreground">
          Carmunity explains why Carasta is more than a transactional surface.
          It is the part of the product that makes profiles, Garage identity,
          following, discovery, and ongoing participation matter before and
          after a sale.
        </p>
      </ResourceContentSection>

      <div className="grid gap-4 md:grid-cols-2">
        <ResourceContentSection title="Core behaviors" surface="default" padding="md">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>Follow people and their activity across the platform</li>
            <li>Participate publicly around the cars and topics you care about</li>
            <li>Bring profile and Garage context into that participation</li>
            <li>Move into Discussions or Messages when a conversation needs a different format</li>
          </ul>
        </ResourceContentSection>
        <ResourceContentSection title="Why it matters to the marketplace" surface="default" padding="md">
          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            <li>It gives listings and auctions more context around the people involved</li>
            <li>It helps the product feel alive, not only transactional</li>
            <li>It supports trust through identity and continuity</li>
            <li>It makes the platform useful even when you are not bidding or selling</li>
          </ul>
        </ResourceContentSection>
      </div>

      <ResourceContentSection title="What Carmunity is not" surface="muted" padding="lg">
        <p className="text-base leading-7 text-muted-foreground">
          Carmunity is not a separate brand or disconnected product. It is the
          social identity and participation layer inside Carasta, and the public
          site treats it that way so the platform story stays coherent.
        </p>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
