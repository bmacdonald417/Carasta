import Link from "next/link";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

export function SellerCtaStrip({ inline = false }: { inline?: boolean }) {
  if (inline) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary to-[hsl(var(--primary-hover))] p-4 shadow-e1 text-center">
        <div className="mb-2 flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-white/15">
          <Car className="h-5 w-5 text-white" aria-hidden />
        </div>
        <p className="text-sm font-semibold text-white">Have a car to sell?</p>
        <p className="mt-1 text-[11px] text-white/75 leading-snug mb-3">
          List in front of thousands of enthusiasts worldwide.
        </p>
        <Link
          href="/sell"
          className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-primary shadow-e1 transition hover:bg-white/90"
        >
          List Your Vehicle
        </Link>
      </div>
    );
  }

  return (
    <section className="border-b border-border bg-[hsl(var(--seller-cta-bg))] py-3 md:py-4">
      <div className="carasta-container">
        <div className="flex flex-row flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/18 bg-card/90 px-4 py-3 shadow-e1 backdrop-blur-sm md:gap-6 md:px-6 md:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-inset ring-primary/18">
              <Car className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground md:text-base">Have a car to sell?</p>
              <p className="mt-0.5 max-w-2xl text-xs leading-snug text-muted-foreground md:text-sm">
                List on Carmunity — auctions, profiles, and messaging together.
              </p>
            </div>
          </div>
          <Link
            href="/sell"
            className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))] sm:w-auto"
          >
            List your vehicle
          </Link>
        </div>
      </div>
    </section>
  );
}
