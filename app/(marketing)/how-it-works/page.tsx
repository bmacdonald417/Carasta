import Link from "next/link";
import { HowItWorksTimeline } from "@/components/how-it-works/HowItWorksTimeline";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works | Carasta",
  description:
    "Discover, bid, and buy collector cars with confidence. Learn how Carasta's auction platform works—from browsing and bidding to checkout and delivery.",
};

export default function HowItWorksPage() {
  return (
    <section className="min-h-screen px-4 py-12 md:py-20">
      <div className="carasta-container max-w-3xl">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-100 md:text-4xl lg:text-5xl">
            How It Works
          </h1>
          <p className="mt-3 text-base text-neutral-400 md:mt-4 md:text-lg">
            From discovery to delivery—transparent, fair, and built for collectors.
          </p>
        </div>

        <div className="mt-12 md:mt-20">
          <HowItWorksTimeline />
        </div>

        <div className="mt-14 flex flex-col items-center gap-5 text-center md:mt-20">
          <p className="text-sm text-neutral-500">
            Ready to bid or list your collector car?
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" size="lg">
              <Link href="/auctions">Browse Auctions</Link>
            </Button>
            <Button asChild variant="performance" size="lg">
              <Link href="/sell">List Your Car</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
