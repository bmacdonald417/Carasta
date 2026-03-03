import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { AuctionCard } from "./auction-card";
import { AuctionFilters } from "./auction-filters";

type SearchParams = { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_OPTIONS = ["LIVE", "ENDED", "SOLD"] as const;
const SORT_OPTIONS = ["ending", "newest", "highest"] as const;

function parsePriceCents(
  val: string | string[] | undefined
): number | undefined {
  const s = typeof val === "string" ? val : undefined;
  if (!s) return undefined;
  const n = Math.round(parseFloat(s) * 100);
  return !isNaN(n) && n >= 0 ? n : undefined;
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const make = typeof params.make === "string" ? params.make.trim() || undefined : undefined;
  const model = typeof params.model === "string" ? params.model.trim() || undefined : undefined;
  const yearMinRaw = typeof params.yearMin === "string" ? parseInt(params.yearMin, 10) : undefined;
  const yearMaxRaw = typeof params.yearMax === "string" ? parseInt(params.yearMax, 10) : undefined;
  const yearMin = yearMinRaw != null && !isNaN(yearMinRaw) && yearMinRaw >= 1900 && yearMinRaw <= 2100 ? yearMinRaw : undefined;
  const yearMax = yearMaxRaw != null && !isNaN(yearMaxRaw) && yearMaxRaw >= 1900 && yearMaxRaw <= 2100 ? yearMaxRaw : undefined;
  const priceMinCents = parsePriceCents(params.priceMin);
  const priceMaxCents = parsePriceCents(params.priceMax);
  const noReserve = params.noReserve === "1";
  const endingSoon = params.endingSoon === "1";
  const sort = typeof params.sort === "string" && SORT_OPTIONS.includes(params.sort as any) ? params.sort : "ending";
  const status = typeof params.status === "string" && STATUS_OPTIONS.includes(params.status as any) ? params.status : "LIVE";
  const q = typeof params.q === "string" ? params.q.trim() : undefined;

  const now = new Date();
  const where: Record<string, unknown> = { status };

  if (make) where.make = { equals: make, mode: "insensitive" };
  if (model) where.model = { equals: model, mode: "insensitive" };
  if (yearMin != null || yearMax != null) {
    where.year = {};
    if (yearMin != null) (where.year as Record<string, number>).gte = yearMin;
    if (yearMax != null) (where.year as Record<string, number>).lte = yearMax;
  }
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

  const priceAnds: Record<string, unknown>[] = [];
  if (priceMinCents != null) {
    priceAnds.push({
      OR: [
        {
          AND: [
            { reservePriceCents: { gte: priceMinCents } },
            { bids: { none: {} } },
          ],
        },
        { bids: { some: { amountCents: { gte: priceMinCents } } } },
      ],
    });
  }
  if (priceMaxCents != null) {
    priceAnds.push({
      OR: [
        {
          AND: [
            { reservePriceCents: { lte: priceMaxCents } },
            { reservePriceCents: { not: null } },
            { bids: { none: {} } },
          ],
        },
        {
          AND: [
            { bids: { some: {} } },
            { bids: { none: { amountCents: { gt: priceMaxCents } } } },
          ],
        },
      ],
    });
  }
  if (priceAnds.length > 0) {
    where.AND = [...((where.AND as object[]) || []), ...priceAnds];
  }

  const orderBy: Record<string, "asc" | "desc"> =
    sort === "ending"
      ? { endAt: "asc" }
      : sort === "newest"
        ? { createdAt: "desc" }
        : { endAt: "asc" };

  const session = await getSession();
  const requireAuth = !session?.user;

  const [makesResult, modelsResult, auctionsResult] = await Promise.all([
    prisma.auction.groupBy({
      by: ["make"],
      where: { status },
    }),
    make
      ? prisma.auction.groupBy({
          by: ["model"],
          where: { status, make: { equals: make, mode: "insensitive" } },
        })
      : Promise.resolve([]),
    prisma.auction.findMany({
      where,
      orderBy,
      take: 50,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        bids: { orderBy: { amountCents: "desc" }, take: 1 },
        seller: { select: { handle: true } },
        _count: { select: { bids: true } },
      },
    }),
  ]);

  const makes = makesResult.map((r) => r.make).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const models = modelsResult.map((r) => r.model).filter(Boolean).sort((a, b) => a.localeCompare(b));

  let auctions = auctionsResult;
  if (sort === "highest") {
    auctions = [...auctions].sort((a, b) => {
      const aHigh = computeCurrentBidCents(a.bids);
      const bHigh = computeCurrentBidCents(b.bids);
      return bHigh - aHigh;
    });
  }

  return (
    <div className="carasta-container max-w-6xl py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        {status === "LIVE" ? "Live" : status === "ENDED" ? "Ended" : "Sold"} Auctions
      </h1>
      <p className="mt-1 text-muted-foreground">
        Bid on collector cars. Reserve meter, auto-bid, buy now.
      </p>

      <AuctionFilters
        makes={makes}
        models={models}
        make={make}
        model={model}
        yearMin={yearMin}
        yearMax={yearMax}
        priceMin={priceMinCents != null ? priceMinCents / 100 : undefined}
        priceMax={priceMaxCents != null ? priceMaxCents / 100 : undefined}
        noReserve={noReserve}
        endingSoon={endingSoon}
        status={status}
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
