import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function MerchStorePage() {
  return (
    <div className="carasta-container max-w-4xl py-16">
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-e1">
        <ShoppingBag className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          Merch Store
        </h1>
        <p className="mt-2 text-muted-foreground">
          Official Carasta apparel and collectibles coming soon. Stay tuned.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Back to Showroom
        </Link>
      </div>
    </div>
  );
}
