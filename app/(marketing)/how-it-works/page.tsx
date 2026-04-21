import Link from "next/link";
import { HowItWorksTimeline } from "@/components/how-it-works/HowItWorksTimeline";
import { ResourceCardGrid } from "@/components/resources/ResourceCardGrid";
import { pickResourceLinks } from "@/components/resources/resource-links";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works | Carasta",
  description:
    "Learn how Carasta connects Carmunity, Discussions, profiles, Garage identity, auctions, and seller tools into one enthusiast platform.",
};

export default function HowItWorksPage() {
  const relatedLinks = pickResourceLinks([
    "/resources/what-is-carasta",
    "/resources/what-is-carmunity",
    "/resources/auction-basics",
    "/resources/trust-and-safety",
  ]);

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Public product guide
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl lg:text-5xl">
            How It Works
          </h1>
          <p className="mt-4 text-base leading-7 text-neutral-600 md:text-lg">
            Carasta works best when the social side of car culture and the
            marketplace side of ownership stay connected. This is the short
            version of how profiles, Garage identity, Carmunity, Discussions,
            auctions, and seller support fit together.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Carmunity-first
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Profiles, Garage identity, and conversation are part of the
              platform from the start, not bolted on later.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Marketplace-proven
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Live auctions, bidding tools, reserve visibility, and listing
              context give the marketplace real weight.
            </p>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Seller-intelligent
            </p>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Sellers are supported by clearer workflows and a path toward
              stronger marketing and AI-assisted tooling.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm md:mt-16 md:p-8">
          <HowItWorksTimeline />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-950">
              How the social side fits in
            </h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Carasta is designed so public identity, Carmunity, Discussions,
              and Garage context help explain who is participating on the
              platform. That makes the experience more legible than a purely
              transactional site.
            </p>
          </section>
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-neutral-950">
              How the marketplace side fits in
            </h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600">
              Auctions, bidding, reserve visibility, and seller tools validate
              that the marketplace is real. The public content system explains
              those mechanics at a trustworthy high level, not as a substitute
              for listing-specific detail.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Related guides
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950">
            Follow the parts of the product you need next.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            These pages deepen the same system from different angles so users
            can move from overview to specifics without hitting weak or
            placeholder-level content.
          </p>
          <div className="mt-8">
            <ResourceCardGrid items={relatedLinks} compact />
          </div>
        </section>

        <div className="mt-14 flex flex-col items-center gap-5 text-center md:mt-20">
          <p className="text-sm text-neutral-500">
            Ready to explore the platform from the community side or the marketplace side?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/explore">Explore Carmunity</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auctions">Browse Auctions</Link>
            </Button>
            <Button asChild variant="performance" size="lg">
              <Link href="/sell">Sell on Carasta</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/resources">Visit Resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
