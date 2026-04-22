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
    "/why-carasta",
    "/resources/what-is-carasta",
    "/resources/what-is-carmunity",
    "/resources/auction-basics",
    "/resources/faq",
    "/resources/trust-and-safety",
  ]);

  return (
    <section className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Public product guide
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            How It Works
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
            Carasta works best when the social side of car culture and the
            marketplace side of ownership stay connected. This is the short
            version of how profiles, Garage identity, Carmunity, Discussions,
            auctions, and seller support fit together.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <p className="text-sm font-semibold text-foreground">
              Carmunity-first
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Profiles, Garage identity, and conversation are part of the
              platform from the start, not bolted on later.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <p className="text-sm font-semibold text-foreground">
              Marketplace-proven
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Live auctions, bidding tools, reserve visibility, and listing
              context give the marketplace real weight.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <p className="text-sm font-semibold text-foreground">
              Seller-intelligent
            </p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Sellers are supported by clearer workflows and a path toward
              stronger marketing and AI-assisted tooling.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-e1 md:mt-16 md:p-8">
          <HowItWorksTimeline />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-2xl font-semibold text-foreground">
              How the social side fits in
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Carasta is designed so public identity, Carmunity, Discussions,
              and Garage context help explain who is participating on the
              platform. That makes the experience more legible than a purely
              transactional site.
            </p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <h2 className="text-2xl font-semibold text-foreground">
              How the marketplace side fits in
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Auctions, bidding, reserve visibility, and seller tools validate
              that the marketplace is real. The public content system explains
              those mechanics at a trustworthy high level, not as a substitute
              for listing-specific detail.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-2xl border border-border bg-muted/30 p-8 shadow-e1">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Related guides
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Follow the parts of the product you need next.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            These pages deepen the same system from different angles so users
            can move from overview to specifics without hitting weak or
            placeholder-level content.
          </p>
          <div className="mt-8">
            <ResourceCardGrid items={relatedLinks} compact />
          </div>
        </section>

        <div className="mt-14 flex flex-col items-center gap-5 text-center md:mt-20">
          <p className="text-sm text-muted-foreground">
            Ready to explore the platform from the community side or the marketplace side?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/explore">Explore Carmunity</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auctions">Browse Auctions</Link>
            </Button>
            <Button asChild variant="default" size="lg">
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
