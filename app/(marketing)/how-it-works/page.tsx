import Link from "next/link";
import { HowItWorksTimeline } from "@/components/how-it-works/HowItWorksTimeline";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How It Works | Carasta",
  description:
    "Discover, bid, and buy collector cars with confidence. Learn how Carasta's auction platform works—from browsing to secure checkout and delivery.",
};

export default function HowItWorksPage() {
  return (
    <section className="min-h-screen px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-100 md:text-4xl lg:text-5xl">
            How It Works
          </h1>
          <p className="mt-4 text-lg text-neutral-400 md:text-xl">
            From discovery to delivery—transparent, secure, and built for collectors.
          </p>
        </div>

        <div className="mt-16 md:mt-24">
          <HowItWorksTimeline />
        </div>

        <div className="mt-16 flex flex-col items-center gap-6 text-center">
          <p className="text-sm text-neutral-500">
            Ready to bid or list your collector car?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
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
