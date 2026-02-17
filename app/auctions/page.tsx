import { prisma } from "@/lib/db";
import { AuctionCard } from "./auction-card";
import { AuctionFilters } from "./auction-filters";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const make = typeof params.make === "string" ? params.make : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const yearMin = typeof params.yearMin === "string" ? parseInt(params.yearMin, 10) : undefined;
  const yearMax = typeof params.yearMax === "string" ? parseInt(params.yearMax, 10) : undefined;
  const noReserve = params.noReserve === "1";
  const endingSoon = params.endingSoon === "1";
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const q = typeof params.q === "string" ? params.q.trim() : undefined;

  const now = new Date();
  const where: any = { status: "LIVE" };
  if (make) where.make = { contains: make, mode: "insensitive" };
  if (model) where.model = { contains: model, mode: "insensitive" };
  if (yearMin != null && !isNaN(yearMin)) where.year = { ...where.year, gte: yearMin };
  if (yearMax != null && !isNaN(yearMax)) where.year = { ...where.year, lte: yearMax };
  if (noReserve) where.reservePriceCents = null;
  if (endingSoon) {
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    where.endAt = { lte: soon };
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy: any =
    sort === "ending"
      ? { endAt: "asc" as const }
      : sort === "newest"
        ? { createdAt: "desc" as const }
        : { endAt: "asc" as const };

  const auctions = await prisma.auction.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      bids: { orderBy: { amountCents: "desc" }, take: 1 },
      seller: { select: { handle: true } },
    },
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Live Auctions
      </h1>
      <p className="mt-1 text-muted-foreground">
        Bid on collector cars. Reserve meter, auto-bid, buy now.
      </p>

      <AuctionFilters
        make={make}
        model={model}
        yearMin={yearMin}
        yearMax={yearMax}
        noReserve={noReserve}
        endingSoon={endingSoon}
        sort={sort}
        q={q}
      />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {auctions.length === 0 ? (
          <p className="col-span-full py-12 text-center text-muted-foreground">
            No auctions match your filters.
          </p>
        ) : (
          auctions.map((a) => (
            <AuctionCard
              key={a.id}
              auction={a}
              highBidCents={a.bids[0]?.amountCents ?? 0}
            />
          ))
        )}
      </div>
    </div>
  );
}
