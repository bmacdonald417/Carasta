import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { DiscussedLiveAuctionRow } from "@/lib/forums/auction-discussion";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export function DiscussedAuctionsStrip({ items }: { items: DiscussedLiveAuctionRow[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-e1 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
            Marketplace pulse
          </Badge>
          <h2 className="mt-2 text-base font-semibold text-foreground">Live listings the community is discussing</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pulled from real Carmunity threads linked to auctions — commerce stays one click away, not the whole
            feed.
          </p>
        </div>
        <Link
          href="/auctions"
          className={cn(
            "text-xs font-medium text-primary hover:underline",
            shellFocusRing,
            "rounded-md"
          )}
        >
          Browse auctions
        </Link>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {items.map((a) => (
          <li key={a.auctionId}>
            <Link
              href={`/auctions/${a.auctionId}`}
              className={cn(
                "flex gap-3 rounded-xl border border-border bg-muted/20 p-3 shadow-e1 transition-colors",
                shellFocusRing,
                "hover:border-primary/30 hover:bg-muted/40"
              )}
            >
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
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
