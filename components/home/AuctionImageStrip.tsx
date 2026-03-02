"use client";

import Link from "next/link";
import Image from "next/image";

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
    <section className="overflow-hidden border-b border-white/10 bg-black/30 py-6">
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="shrink-0 pl-4 font-display text-sm font-semibold uppercase tracking-widest text-[#ff3b5c]">
          Live Now
        </span>
        <div className="relative flex w-full overflow-hidden">
          <div className="flex animate-auction-strip gap-4">
            {duplicated.map((a, i) => {
              const href = requireAuth
                ? `/auth/sign-up?callbackUrl=${encodeURIComponent(`/auctions/${a.id}`)}`
                : `/auctions/${a.id}`;
              const img =
                a.images[0]?.url ??
                "https://placehold.co/200x120/1a1a1a/666?text=No+image";
              return (
                <Link
                  key={`${a.id}-${i}`}
                  href={href}
                  className="group relative h-24 w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 transition hover:border-[#ff3b5c]/50"
                >
                  <Image
                    src={img}
                    alt={a.title}
                    fill
                    unoptimized
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="160px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <span className="absolute bottom-1 left-1 right-1 truncate text-xs font-medium text-white drop-shadow-lg">
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
