import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import dynamic from "next/dynamic";
import {
  parseAuctionSearchSortParam,
  searchAuctions,
} from "@/lib/search/auction-search-service";
import { AuctionCard } from "./auction-card";
import { AuctionFilters } from "./auction-filters";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { PageHeader } from "@/components/ui/page-header";

const AuctionsMapView = dynamic(
  () =>
    import("@/components/auctions/AuctionsMapView").then(
      (m) => m.AuctionsMapView
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] items-center justify-center rounded-2xl border border-border bg-muted/40 text-sm text-muted-foreground shadow-e1">
        Loading map…
      </div>
    ),
  }
);

type SearchParams =
  | { [key: string]: string | string[] | undefined }
  | Promise<{ [key: string]: string | string[] | undefined }>;

const STATUS_OPTIONS = ["LIVE", "ENDED", "SOLD"] as const;
const SORT_OPTIONS = [
  "ending",
  "newest",
  "highest",
  "price_asc",
  "price_desc",
] as const;
const RADIUS_OPTIONS = [25, 50, 100, 250, 500] as const;

function parsePriceCents(
  val: string | string[] | undefined
): number | undefined {
  const s = typeof val === "string" ? val : undefined;
  if (!s) return undefined;
  const n = Math.round(parseFloat(s) * 100);
  return !isNaN(n) && n >= 0 ? n : undefined;
}

function parseIntSearch(
  val: string | string[] | undefined,
  min: number,
  max: number
): number | undefined {
  const s = typeof val === "string" ? val : undefined;
  if (!s) return undefined;
  const n = parseInt(s, 10);
  if (isNaN(n) || n < min || n > max) return undefined;
  return n;
}

/** Preserve current filters in pagination links (server-safe). */
function buildAuctionsListQuery(parts: {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMinCents?: number;
  priceMaxCents?: number;
  mileageMin?: number;
  mileageMax?: number;
  location?: string;
  condition?: string;
  featured?: boolean;
  noReserve?: boolean;
  endingSoon?: boolean;
  status: string;
  sort: string;
  q?: string;
  zip?: string;
  radius?: number;
  view?: string;
  page: number;
}): string {
  const p = new URLSearchParams();
  if (parts.make) p.set("make", parts.make);
  if (parts.model) p.set("model", parts.model);
  if (parts.yearMin != null) p.set("yearMin", String(parts.yearMin));
  if (parts.yearMax != null) p.set("yearMax", String(parts.yearMax));
  if (parts.priceMinCents != null)
    p.set("priceMin", String(parts.priceMinCents / 100));
  if (parts.priceMaxCents != null)
    p.set("priceMax", String(parts.priceMaxCents / 100));
  if (parts.mileageMin != null) p.set("mileageMin", String(parts.mileageMin));
  if (parts.mileageMax != null) p.set("mileageMax", String(parts.mileageMax));
  if (parts.location) p.set("location", parts.location);
  if (parts.condition) p.set("condition", parts.condition);
  if (parts.featured) p.set("featured", "1");
  if (parts.noReserve) p.set("noReserve", "1");
  if (parts.endingSoon) p.set("endingSoon", "1");
  if (parts.status && parts.status !== "LIVE") p.set("status", parts.status);
  if (parts.sort && parts.sort !== "ending") p.set("sort", parts.sort);
  if (parts.q) p.set("q", parts.q);
  if (parts.zip) p.set("zip", parts.zip);
  if (parts.radius != null) p.set("radius", String(parts.radius));
  if (parts.view && parts.view !== "grid") p.set("view", parts.view);
  if (parts.page > 1) p.set("page", String(parts.page));
  return p.toString();
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  const make =
    typeof params.make === "string" ? params.make.trim() || undefined : undefined;
  const model =
    typeof params.model === "string" ? params.model.trim() || undefined : undefined;
  const yearMinRaw =
    typeof params.yearMin === "string" ? parseInt(params.yearMin, 10) : undefined;
  const yearMaxRaw =
    typeof params.yearMax === "string" ? parseInt(params.yearMax, 10) : undefined;
  const yearMin =
    yearMinRaw != null && !isNaN(yearMinRaw) && yearMinRaw >= 1900 && yearMinRaw <= 2100
      ? yearMinRaw
      : undefined;
  const yearMax =
    yearMaxRaw != null && !isNaN(yearMaxRaw) && yearMaxRaw >= 1900 && yearMaxRaw <= 2100
      ? yearMaxRaw
      : undefined;
  const priceMinCents = parsePriceCents(params.priceMin);
  const priceMaxCents = parsePriceCents(params.priceMax);
  const mileageMin = parseIntSearch(params.mileageMin, 0, 10_000_000);
  const mileageMax = parseIntSearch(params.mileageMax, 0, 10_000_000);
  const location =
    typeof params.location === "string" ? params.location.trim() || undefined : undefined;
  const condition =
    typeof params.condition === "string" ? params.condition.trim() || undefined : undefined;
  const featured = params.featured === "1";
  const noReserve = params.noReserve === "1";
  const endingSoon = params.endingSoon === "1";
  const sort =
    typeof params.sort === "string" && SORT_OPTIONS.includes(params.sort as (typeof SORT_OPTIONS)[number])
      ? params.sort
      : "ending";
  const status =
    typeof params.status === "string" && STATUS_OPTIONS.includes(params.status as (typeof STATUS_OPTIONS)[number])
      ? params.status
      : "LIVE";
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const zip = typeof params.zip === "string" ? params.zip.trim().slice(0, 10) : undefined;
  const radiusRaw =
    typeof params.radius === "string" ? parseInt(params.radius, 10) : undefined;
  const radius =
    radiusRaw != null && RADIUS_OPTIONS.includes(radiusRaw as (typeof RADIUS_OPTIONS)[number])
      ? radiusRaw
      : undefined;
  const view =
    typeof params.view === "string" && (params.view === "grid" || params.view === "map")
      ? params.view
      : "grid";
  const pageRaw = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const page = !isNaN(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const pageSize = 50;

  const session = await getSession();
  const requireAuth = !session?.user;

  const searchResult = await searchAuctions({
    query: q,
    make,
    model,
    yearMin,
    yearMax,
    priceMinCents,
    priceMaxCents,
    mileageMin,
    mileageMax,
    location,
    condition,
    featuredOnly: featured,
    noReserve,
    endingSoon,
    status,
    sort: parseAuctionSearchSortParam(sort),
    page,
    pageSize,
    zip,
    radiusMiles: radius,
  });

  const { results: auctions, pagination } = searchResult;

  const [makesResult, modelsResult] = await Promise.all([
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
  ]);

  const makes = makesResult.map((r) => r.make).filter(Boolean).sort((a, b) => a.localeCompare(b));
  const models = modelsResult.map((r) => r.model).filter(Boolean).sort((a, b) => a.localeCompare(b));

  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));

  return (
    <div className="carasta-container max-w-6xl py-8">
      <PageHeader
        eyebrow="Marketplace"
        title={`${status === "LIVE" ? "Live" : status === "ENDED" ? "Ended" : "Sold"} Auctions`}
        subtitle="Browse verified listings. Reserve progress, auto-bid, and buy-now when available."
      />

      <ContextualHelpCard context="market.auctions" className="mt-5" />

      <AuctionFilters
        makes={makes}
        models={models}
        make={make}
        model={model}
        yearMin={yearMin}
        yearMax={yearMax}
        priceMin={priceMinCents != null ? priceMinCents / 100 : undefined}
        priceMax={priceMaxCents != null ? priceMaxCents / 100 : undefined}
        mileageMin={mileageMin}
        mileageMax={mileageMax}
        location={location}
        condition={condition}
        featured={featured}
        noReserve={noReserve}
        endingSoon={endingSoon}
        status={status}
        sort={sort}
        q={q}
        zip={zip}
        radius={radius}
        view={view}
        page={page}
        total={pagination.total}
        pageSize={pageSize}
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
                highBidCents: a.highBidCents,
                bidCount: a.bidCount,
              }))}
            requireAuth={requireAuth}
          />
          {auctions.filter((a) => a.latitude != null && a.longitude != null).length === 0 &&
            auctions.length > 0 && (
              <p className="mt-4 rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-sm text-muted-foreground">
                No listings in this result set include map coordinates. Sellers can add location when listing to appear here.
              </p>
            )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {auctions.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center shadow-e1">
              <p className="text-sm font-medium text-foreground">No listings match these filters</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try widening year or price, clearing location, or switching status.
              </p>
              <a
                href="/auctions"
                className="mt-5 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  endAt: a.endAt,
                  status: a.status,
                  reservePriceCents: a.reservePriceCents,
                  conditionGrade: a.conditionGrade,
                  images: a.images,
                  seller: a.seller,
                }}
                highBidCents={a.highBidCents}
                bidCount={a.bidCount}
                index={i}
                requireAuth={requireAuth}
              />
            ))
          )}
        </div>
      )}

      {view === "grid" && auctions.length > 0 && totalPages > 1 && (
        <nav
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          aria-label="Auction results pages"
        >
          {page > 1 ? (
            <a
              href={`/auctions?${buildAuctionsListQuery({
                make,
                model,
                yearMin,
                yearMax,
                priceMinCents,
                priceMaxCents,
                mileageMin,
                mileageMax,
                location,
                condition,
                featured,
                noReserve,
                endingSoon,
                status,
                sort,
                q,
                zip,
                radius,
                view,
                page: page - 1,
              })}`}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-e1 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Previous
            </a>
          ) : (
            <span className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-muted-foreground">
              Previous
            </span>
          )}
          <span className="text-sm tabular-nums text-muted-foreground">
            Page {page} of {totalPages} ({pagination.total} listings
            {pagination.highBidSortTruncated ? "; highest-bid sort uses a capped sample" : ""})
          </span>
          {page < totalPages ? (
            <a
              href={`/auctions?${buildAuctionsListQuery({
                make,
                model,
                yearMin,
                yearMax,
                priceMinCents,
                priceMaxCents,
                mileageMin,
                mileageMax,
                location,
                condition,
                featured,
                noReserve,
                endingSoon,
                status,
                sort,
                q,
                zip,
                radius,
                view,
                page: page + 1,
              })}`}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground shadow-e1 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Next
            </a>
          ) : (
            <span className="rounded-lg border border-transparent px-3 py-1.5 text-sm text-muted-foreground">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
