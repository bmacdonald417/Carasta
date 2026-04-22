import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Gavel, ShieldCheck, Sparkles, Users } from "lucide-react";

import { ResourceCardGrid } from "@/components/resources/ResourceCardGrid";
import { pickResourceLinks } from "@/components/resources/resource-links";

export const metadata: Metadata = {
  title: "Why Carasta",
  description:
    "See how Carasta combines Carmunity, Discussions, transparent auctions, and seller-intelligent tools into one enthusiast platform.",
};

const reasons = [
  {
    title: "Built by enthusiasts",
    description:
      "Carasta is designed around the way enthusiasts actually use a platform: identity, conversation, discovery, and transaction all reinforce each other.",
    icon: BadgeCheck,
  },
  {
    title: "Community beyond the transaction",
    description:
      "Carmunity, Discussions, Messages, profiles, and Garage identity make the platform useful when you are not actively buying or selling.",
    icon: Users,
  },
  {
    title: "Transparent marketplace mechanics",
    description:
      "Live bidding, reserve visibility, and clearer auction behavior help reduce the ambiguity that makes many automotive marketplaces feel opaque.",
    icon: ShieldCheck,
  },
  {
    title: "Seller-intelligent direction",
    description:
      "Seller support is moving toward stronger marketing and AI-assisted workflows rather than stopping at a listing form.",
    icon: Sparkles,
  },
];

export default function WhyCarastaPage() {
  const relatedLinks = pickResourceLinks([
    "/resources/what-is-carasta",
    "/resources/what-is-carmunity",
    "/resources/profiles-and-garage",
    "/resources/trust-and-safety",
  ]);

  return (
    <section className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Why Carasta
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            A stronger enthusiast platform starts with identity, not just inventory.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
            Carasta is intentionally evolving into a product that reads
            Carmunity-first, marketplace-proven, and seller-intelligent. The
            point is not to hide the auctions. It is to make the full platform
            feel coherent from the first visit.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {reasons.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-e1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-foreground">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-foreground p-8 text-background shadow-e1 md:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
                Marketplace-proven
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                The auction layer matters more when it supports a broader product.
              </h2>
              <p className="mt-4 text-base leading-7 text-background/75">
                Live auctions, bids, reserve context, and seller identity are a
                real proof layer. They validate the platform after Carasta has
                already explained what it is.
              </p>
            </div>
            <div className="rounded-2xl border border-background/15 bg-background/10 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-background/15 text-primary">
                  <Gavel className="h-5 w-5" />
                </div>
                <p className="text-sm leading-6 text-background/80">
                  The marketplace is still central to the product. It just no
                  longer needs to dominate the first impression to prove it is
                  real.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-muted/30 p-8 shadow-e1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Learn the system
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            The public content layer now explains the product in operational terms, not only marketing terms.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            If this page explains the positioning, the guides below explain the
            mechanics, concepts, and trust model that support it.
          </p>
          <div className="mt-8">
            <ResourceCardGrid items={relatedLinks} compact />
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Back to homepage
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/25 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Visit resources
          </Link>
        </div>
      </div>
    </section>
  );
}
