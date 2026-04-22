import type { Metadata } from "next";

import { ResourceContentSection } from "@/components/resources/ResourceContentSection";
import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Auction Basics",
  description:
    "A practical public overview of bidding, reserve state, anti-sniping, and auction participation on Carasta.",
};

export default function AuctionBasicsPage() {
  return (
    <ResourcePageLayout
      eyebrow="Auction basics"
      title="How Carasta auctions work at a public, high-confidence level."
      description="This page explains the core auction mechanics without pretending to replace the full terms, listing details, or transaction-specific diligence."
      relatedLinks={pickResourceLinks([
        "/resources/buying-on-carasta",
        "/resources/selling-on-carasta",
        "/how-it-works",
        "/resources/trust-and-safety",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Live bidding",
            body: "Carasta supports live auction participation so buyers can follow active listings and place bids during the auction window.",
          },
          {
            title: "Reserve state",
            body: "Listings can include reserve context so bidders have a clearer read on where the current bid stands relative to the seller's minimum acceptable outcome.",
          },
          {
            title: "Anti-sniping",
            body: "Carasta uses anti-sniping behavior to reduce last-second distortions and give participants a fairer chance to respond late in an auction.",
          },
          {
            title: "Seller context",
            body: "Listings, seller identity, and supporting detail help the marketplace feel more legible than a bare bid stream.",
          },
        ].map((item) => (
          <ResourceContentSection
            key={item.title}
            as="div"
            title={item.title}
            titleAs="h2"
            surface="default"
            padding="md"
          >
            <p className="text-sm leading-6 text-muted-foreground">{item.body}</p>
          </ResourceContentSection>
        ))}
      </div>

      <ResourceContentSection
        title="What bidders and sellers should keep in mind"
        surface="muted"
        padding="lg"
      >
        <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
          <li>Read the listing carefully rather than relying on a short summary alone</li>
          <li>Use the current trust and support pages when you need platform-level guidance</li>
          <li>Do not assume the public overview replaces listing-specific terms or final legal documents</li>
          <li>Use good judgment around payment, inspection, condition review, and communication</li>
        </ul>
      </ResourceContentSection>
    </ResourcePageLayout>
  );
}
