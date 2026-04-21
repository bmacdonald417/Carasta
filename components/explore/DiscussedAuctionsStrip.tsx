import Image from "next/image";
import Link from "next/link";

import type { DiscussedLiveAuctionRow } from "@/lib/forums/auction-discussion";

export function DiscussedAuctionsStrip({ items }: { items: DiscussedLiveAuctionRow[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8 space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
            Marketplace pulse
          </p>
          <h2 className="font-display text-base font-semibold uppercase tracking-wide text-foreground">
            Live listings the community is discussing
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Pulled from real Carmunity threads linked to auctions — commerce stays one click away, not
            the whole feed.
          </p>
        </div>
        <Link
          href="/auctions"
          className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
        >
          Browse auctions
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((a) => (
          <li key={a.auctionId}>
            <Link
              href={`/auctions/${a.auctionId}`}
              className="flex gap-3 rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-primary/35 hover:bg-muted/10"
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {a.imageUrl ? (
                  <Image src={a.imageUrl} alt="" fill unoptimized className="object-cover" sizes="80px" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground">{a.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {a.threadCount} thread{a.threadCount === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
