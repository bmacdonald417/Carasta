import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function AuctionCard({
  auction,
  highBidCents,
}: {
  auction: {
    id: string;
    title: string;
    year: number;
    make: string;
    model: string;
    endAt: Date;
    status: string;
    reservePriceCents: number | null;
    images: { url: string }[];
    seller: { handle: string } | null;
  };
  highBidCents: number;
}) {
  const img = auction.images[0]?.url ?? "https://placehold.co/600x400/1a1a1a/666?text=No+image";
  const end = new Date(auction.endAt);
  const isLive = auction.status === "LIVE";

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={img}
            alt={auction.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {!isLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <span className="rounded-xl bg-muted px-3 py-1 font-display text-sm font-semibold uppercase">
                {auction.status}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            {auction.year} {auction.make} {auction.model}
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold line-clamp-1">
            {auction.title}
          </h2>
          <p className="mt-2 text-sm font-medium text-[hsl(var(--performance-red))]">
            {formatCurrency(highBidCents)}
            <span className="ml-1 text-muted-foreground">high bid</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ends {end.toLocaleDateString()} · @{auction.seller?.handle ?? "seller"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
