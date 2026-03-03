import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { getZipCoords } from "@/lib/zip-geo";
import { boundingBox, haversineMiles } from "@/lib/geo-utils";
import dynamic from "next/dynamic";
import { AuctionCard } from "./auction-card";
import { AuctionFilters } from "./auction-filters";

const AuctionsMapView = dynamic(
  () => import("@/components/auctions/AuctionsMapView").then((m) => m.AuctionsMapView),
  { ssr: false, loading: () => <div className="flex h-[500px] items-center justify-center rounded-2xl border border-border/50 bg-muted/30">Loading map…</div> }
);

type SearchParams = { [key: string]: string | string[] | undefined } | Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_OPTIONS = ["LIVE", "ENDED", "SOLD"] as const;
const SORT_OPTIONS = ["ending", "newest", "highest"] as const;
const RADIUS_OPTIONS = [25, 50, 100, 250, 500] as const;

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
  const zip = typeof params.zip === "string" ? params.zip.trim().slice(0, 10) : undefined;
  const radiusRaw = typeof params.radius === "string" ? parseInt(params.radius, 10) : undefined;
  const radius = radiusRaw != null && RADIUS_OPTIONS.includes(radiusRaw as any) ? radiusRaw : undefined;
  const view = typeof params.view === "string" && (params.view === "grid" || params.view === "map") ? params.view : "grid";

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

  let centerLat: number | null = null;
  let centerLng: number | null = null;
  if (zip && radius != null) {
    const coords = getZipCoords(zip);
    if (coords) {
      centerLat = coords.lat;
      centerLng = coords.lng;
      const box = boundingBox(coords.lat, coords.lng, radius);
      where.AND = where.AND ?? [];
      (where.AND as object[]).push(
        { latitude: { not: null } },
        { longitude: { not: null } },
        { latitude: { gte: box.latMin, lte: box.latMax } },
        { longitude: { gte: box.lngMin, lte: box.lngMax } }
      );
    }
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
        zip={zip}
        radius={radius}
        view={view}
      />

      {view === "map" ? (
        <div className="mt-8">
          <AuctionsMapView
            auctions={auctions
              .filter((a) => a.latitude != null && a.longitude != null)
              .map((a) => ({
                id: a.id,
                title: a.title,
                year: a.year,
                make: a.make,
                model: a.model,
                status: a.status,
                reservePriceCents: a.reservePriceCents,
                latitude: a.latitude!,
                longitude: a.longitude!,
                images: a.images,
                seller: a.seller,
                highBidCents: computeCurrentBidCents(a.bids),
                bidCount: a._count.bids,
              }))}
            requireAuth={requireAuth}
          />
          {auctions.filter((a) => a.latitude != null && a.longitude != null).length === 0 && auctions.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No auctions have location data. Add a zip when listing to see them on the map.
            </p>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}
