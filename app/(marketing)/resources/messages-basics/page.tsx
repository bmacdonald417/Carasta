import type { Metadata } from "next";

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
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">What Messages are for</h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Messages let people continue a conversation directly when a public
            post or Discussion needs a one-to-one follow-up. They are part of
            the same platform identity model as the rest of Carasta.
          </p>
        </section>
        <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-neutral-950">
            What Messages are not
          </h2>
          <p className="mt-4 text-sm leading-6 text-neutral-600">
            Messaging is not a promise of verified deal safety, final payment
            protection, or legal review. It is a communication tool inside the
            platform, not a substitute for normal transaction judgment.
          </p>
        </section>
      </div>

      <section className="rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-950">
          How messaging fits into trust and support
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-neutral-600">
          <li>Use it to continue conversations, coordinate details, or ask follow-up questions</li>
          <li>Keep platform rules and Community Guidelines in mind even in direct interaction</li>
          <li>Use public support paths if you need help beyond normal user-to-user communication</li>
          <li>Do not treat private messages as a replacement for clear listing review or policy reading</li>
        </ul>
      </section>
    </ResourcePageLayout>
  );
}
