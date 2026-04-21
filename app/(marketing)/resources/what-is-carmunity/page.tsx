import type { Metadata } from "next";

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
        "/resources/discussions-basics",
        "/resources/profiles-and-garage",
        "/resources/messages-basics",
        "/resources/what-is-carasta",
      ])}
    >
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          Why the public site leads with Carmunity
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Carmunity explains why Carasta is more than a transactional surface.
          It is the part of the product that makes profiles, Garage identity,
          following, discovery, and ongoing participation matter before and
          after a sale.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">Core behaviors</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>Follow people and their activity across the platform</li>
            <li>Participate publicly around the cars and topics you care about</li>
            <li>Bring profile and Garage context into that participation</li>
            <li>Move into Discussions or Messages when a conversation needs a different format</li>
          </ul>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            Why it matters to the marketplace
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
            <li>It gives listings and auctions more context around the people involved</li>
            <li>It helps the product feel alive, not only transactional</li>
            <li>It supports trust through identity and continuity</li>
            <li>It makes the platform useful even when you are not bidding or selling</li>
          </ul>
        </section>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          What Carmunity is not
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Carmunity is not a separate brand or disconnected product. It is the
          social identity and participation layer inside Carasta, and the public
          site treats it that way so the platform story stays coherent.
        </p>
      </section>
    </ResourcePageLayout>
  );
}
