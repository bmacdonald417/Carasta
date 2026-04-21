import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Platform Glossary",
  description:
    "Definitions for the core Carasta product terms used across the public site and future support content.",
};

const terms = [
  {
    term: "Carasta",
    definition:
      "The overall platform that combines Carmunity, Discussions, Messages, profiles, Garage identity, auctions, and seller tools.",
  },
  {
    term: "Carmunity",
    definition:
      "Carasta's community layer for public participation, identity, following, and ongoing enthusiast connection.",
  },
  {
    term: "Discussions",
    definition:
      "The canonical public term for Carasta's thread-based conversation areas.",
  },
  {
    term: "Messages",
    definition:
      "The direct one-to-one communication layer inside the platform.",
  },
  {
    term: "Profile",
    definition:
      "A user's platform identity surface that carries across social, community, and marketplace participation.",
  },
  {
    term: "Garage",
    definition:
      "The part of the identity model that expresses ownership, projects, and dream-car context.",
  },
  {
    term: "Auction",
    definition:
      "A live marketplace listing where bids, reserve context, and timing mechanics shape the sale flow.",
  },
  {
    term: "Reserve state",
    definition:
      "The public indication of how the current bidding relates to the seller's reserve threshold, where supported.",
  },
  {
    term: "Anti-sniping",
    definition:
      "Auction behavior that extends timing late in a listing to reduce last-second distortion and keep bidding fairer.",
  },
  {
    term: "Seller tools",
    definition:
      "The seller-facing workflows and support surfaces that help present, market, and manage listings on Carasta.",
  },
];

export default function GlossaryPage() {
  return (
    <ResourcePageLayout
      eyebrow="Platform glossary"
      title="Core product terms in one place."
      description="This glossary is written to keep public language consistent, reduce ambiguity, and prepare the content system for future assistant retrieval."
      relatedLinks={pickResourceLinks([
        "/resources/what-is-carasta",
        "/resources/what-is-carmunity",
        "/resources/discussions-basics",
        "/resources/auction-basics",
      ])}
    >
      <div className="space-y-4">
        {terms.map((item) => (
          <section
            key={item.term}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-neutral-950">{item.term}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              {item.definition}
            </p>
          </section>
        ))}
      </div>
    </ResourcePageLayout>
  );
}
