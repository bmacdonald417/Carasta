"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type AuctionThumb = {
  id: string;
  title: string;
  images: { url: string }[];
};

export function AuctionImageStrip({
  auctions,
  requireAuth = false,
}: {
  auctions: AuctionThumb[];
  requireAuth?: boolean;
}) {
  if (auctions.length === 0) return null;

  const duplicated = [...auctions, ...auctions];

  return (
    <section className="border-b border-border bg-muted/30 py-5 md:py-6">
      <div className="flex items-center gap-3 overflow-hidden">
        <Badge
          variant="default"
          className="ml-4 shrink-0 gap-1.5 uppercase tracking-wide shadow-sm"
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/90 motion-reduce:animate-none animate-pulse"
            aria-hidden
          />
          Live
        </Badge>
        <div className="relative flex min-w-0 flex-1 overflow-hidden">
          <div className="flex animate-auction-strip gap-3 pr-4 md:gap-4">
            {duplicated.map((a, i) => {
              const href = requireAuth
                ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${a.id}`)}`
                : `/auctions/${a.id}`;
              const img =
                a.images[0]?.url ??
                "https://placehold.co/200x120/e2e8f0/64748b?text=No+image";
              return (
                <Link
                  key={`${a.id}-${i}`}
                  href={href}
                  className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[border-color,box-shadow] hover:border-primary/35 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Image
                    src={img}
                    alt={a.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
                    sizes="160px"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute bottom-1.5 left-2 right-2 truncate text-[11px] font-medium text-white drop-shadow-md">
                    {a.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
