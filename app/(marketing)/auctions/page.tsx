import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { AuctionCard } from "./auction-card";
import { AuctionFilters } from "./auction-filters";

type SearchParams = { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const make = typeof params.make === "string" ? params.make : undefined;
  const model = typeof params.model === "string" ? params.model : undefined;
  const yearMinRaw = typeof params.yearMin === "string" ? parseInt(params.yearMin, 10) : undefined;
  const yearMaxRaw = typeof params.yearMax === "string" ? parseInt(params.yearMax, 10) : undefined;
  // Require valid car years (1900-2100) so partial inputs like 199 or 202 are ignored
  const yearMin = yearMinRaw != null && !isNaN(yearMinRaw) && yearMinRaw >= 1900 && yearMinRaw <= 2100 ? yearMinRaw : undefined;
  const yearMax = yearMaxRaw != null && !isNaN(yearMaxRaw) && yearMaxRaw >= 1900 && yearMaxRaw <= 2100 ? yearMaxRaw : undefined;
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

  const session = await getSession();
  const requireAuth = !session?.user;

  let auctions;
  try {
    auctions = await prisma.auction.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        bids: { orderBy: { amountCents: "desc" }, take: 1 },
        seller: { select: { handle: true } },
        _count: { select: { bids: true } },
      },
    });
  } catch (err) {
    console.error("[auctions] DB error:", err);
    throw err;
  }

  return (
    <div className="carasta-container max-w-6xl py-8">
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
          <div className="col-span-full py-12 text-center">
            <p className="text-muted-foreground">No auctions match your filters.</p>
            <a
              href="/auctions"
              className="mt-3 inline-block text-sm font-medium text-[#ff3b5c] hover:underline"
            >
              Clear filters
            </a>
          </div>
        ) : (
          auctions.map((a, i) => (
            <AuctionCard
              key={a.id}
              auction={{
                id: a.id,
                title: a.title,
                year: a.year,
                make: a.make,
                model: a.model,
                endAt: a.endAt.toISOString(),
                status: a.status,
                reservePriceCents: a.reservePriceCents,
                images: a.images,
                seller: a.seller,
              }}
              highBidCents={computeCurrentBidCents(a.bids)}
              bidCount={a._count.bids}
              index={i}
              requireAuth={requireAuth}
            />
          ))
        )}
      </div>
    </div>
  );
}
