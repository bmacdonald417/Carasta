import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function MerchStorePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-12 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-neutral-400" />
        <h1 className="mt-4 font-display text-2xl font-semibold text-neutral-900">
          Merch Store
        </h1>
        <p className="mt-2 text-neutral-600">
          Official Carasta apparel and collectibles coming soon. Stay tuned.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1b238e] px-4 py-2.5 font-medium text-white transition hover:bg-[#151c6e]"
        >
          Back to Showroom
        </Link>
      </div>
    </div>
  );
}
