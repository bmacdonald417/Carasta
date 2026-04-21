import type { Metadata } from "next";

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
          <section
            key={item.title}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-neutral-950">{item.title}</h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600">{item.body}</p>
          </section>
        ))}
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          What bidders and sellers should keep in mind
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
          <li>Read the listing carefully rather than relying on a short summary alone</li>
          <li>Use the current trust and support pages when you need platform-level guidance</li>
          <li>Do not assume the public overview replaces listing-specific terms or final legal documents</li>
          <li>Use good judgment around payment, inspection, condition review, and communication</li>
        </ul>
      </section>
    </ResourcePageLayout>
  );
}
