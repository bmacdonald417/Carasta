import Link from "next/link";
import { Car } from "lucide-react";

export function SellerCtaStrip() {
  return (
    <section className="border-b border-border bg-[hsl(var(--seller-cta-bg))] py-5 md:py-6">
      <div className="carasta-container">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-primary/20 bg-card/80 px-5 py-5 shadow-e1 backdrop-blur-sm md:flex-row md:items-center md:gap-8 md:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
              <Car className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="text-base font-semibold text-foreground md:text-lg">
                Have a car to sell?
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                List your vehicle in front of thousands of enthusiasts — auctions, identity, and messaging in one platform.
              </p>
            </div>
          </div>
          <Link
            href="/sell"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))] md:w-auto"
          >
            List your vehicle
          </Link>
        </div>
      </div>
    </section>
  );
}
