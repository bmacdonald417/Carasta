import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Gavel, ShieldCheck, Sparkles, Users } from "lucide-react";

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
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Why Carasta
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            A stronger enthusiast platform starts with identity, not just inventory.
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
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
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-neutral-950">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-neutral-200 bg-neutral-950 p-8 text-white shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                Marketplace-proven
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">
                The auction layer matters more when it supports a broader product.
              </h2>
              <p className="mt-4 text-base leading-7 text-neutral-300">
                Live auctions, bids, reserve context, and seller identity are a
                real proof layer. They validate the platform after Carasta has
                already explained what it is.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-primary">
                  <Gavel className="h-5 w-5" />
                </div>
                <p className="text-sm leading-6 text-neutral-200">
                  The marketplace is still central to the product. It just no
                  longer needs to dominate the first impression to prove it is
                  real.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-2xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Back to homepage
          </Link>
          <Link
            href="/resources"
            className="inline-flex items-center rounded-2xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Visit resources
          </Link>
        </div>
      </div>
    </section>
  );
}
