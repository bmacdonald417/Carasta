import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "What Is Carasta?",
  description:
    "Understand Carasta as a social automotive platform that combines Carmunity, Discussions, Messages, profiles, Garage identity, auctions, and seller tools.",
};

export default function WhatIsCarastaPage() {
  return (
    <ResourcePageLayout
      eyebrow="What is Carasta?"
      title="Carasta is a social automotive platform, not just a marketplace."
      description="The public site now explains Carasta as one connected system. This page is the concise reference version of that story."
      relatedLinks={pickResourceLinks([
        "/resources/what-is-carmunity",
        "/resources/discussions-basics",
        "/resources/profiles-and-garage",
        "/resources/auction-basics",
      ])}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Carmunity-first",
            body: "The platform begins with people, participation, identity, and conversation. Carmunity, Discussions, profiles, Garage identity, and Messages are part of the core product model.",
          },
          {
            title: "Marketplace-proven",
            body: "Auctions are a real and important part of Carasta. They validate the product with live listings, bidding, reserve visibility, and seller presence.",
          },
          {
            title: "Seller-intelligent",
            body: "Carasta is building a stronger seller side with clearer workflows and smarter tools, while keeping that layer grounded in the existing product.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold text-neutral-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          The platform in one sentence
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Carasta gives enthusiasts one place to build identity, participate in
          Carmunity, join Discussions, message directly, follow auctions, and
          use seller tools without treating those as disconnected products.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            What Carasta is for
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Helping enthusiasts participate in a real automotive community</li>
            <li>Giving identity and Garage context to public participation</li>
            <li>Supporting live auctions and seller workflows in the same system</li>
            <li>Making the product understandable enough to support later help and assistant layers</li>
          </ul>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            What Carasta is not
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Not only a listing destination</li>
            <li>Not only a social feed without real marketplace substance</li>
            <li>Not a promise that every workflow is fully mature on every platform today</li>
            <li>Not a substitute for final legal or transaction-specific advice</li>
          </ul>
        </section>
      </div>
    </ResourcePageLayout>
  );
}
