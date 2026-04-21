import type { Metadata } from "next";

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
        "/resources/glossary",
      ])}
    >
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-8 shadow-sm">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          Why identity matters here
        </h2>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          Carasta treats identity as a product feature. Profiles and Garage give
          people a way to show who they are, what they own, and what they care
          about, which makes public participation and marketplace activity feel
          more grounded.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">Profiles</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Profiles connect activity across the platform. The same identity can
            show up in Carmunity, Discussions, auctions, Messages, and seller
            surfaces instead of living in separate silos.
          </p>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">Garage</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Garage gives users a place to express ownership, projects, and dream
            cars. It is not only a visual extra. It supports the broader
            enthusiast identity model the platform is built around.
          </p>
        </section>
      </div>

      <section className="rounded-3xl border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          How this supports trust
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
          <li>It gives public participation more continuity and context</li>
          <li>It helps users understand who they are interacting with on the platform</li>
          <li>It supports the product story that community and marketplace belong together</li>
          <li>It does not replace normal user judgment or transaction-specific diligence</li>
        </ul>
      </section>
    </ResourcePageLayout>
  );
}
