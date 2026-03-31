/**
 * Central auction discovery layer for web, mobile API, and future search backends.
 *
 * - **Today:** Prisma + PostgreSQL filters (swappable implementation).
 * - **Not included:** fuzzy/full-text index, geo radius (beyond existing zip+bbox), Elastic/Algolia.
 *
 * @see `AUCTION_SEARCH_ARCHITECTURE.md`
 */

import { Prisma, type ConditionGrade } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeCurrentBidCents } from "@/lib/auction-metrics";
import { getZipCoords } from "@/lib/zip-geo";
import { boundingBox } from "@/lib/geo-utils";

const CONDITION_GRADES: Set<string> = new Set([
  "CONCOURS",
  "EXCELLENT",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
]);

/** Max rows scanned when sorting by highest bid (in-memory). */
const HIGHEST_BID_SCAN_CAP = 800;

export type AuctionSearchSort =
  | "ENDING_SOON"
  | "NEWEST"
  | "PRICE_ASC"
  | "PRICE_DESC"
  | "HIGHEST_BID";

export type AuctionSearchInput = {
  /** Full-text-ish match on title / make / model (contains, case-insensitive). */
  query?: string;
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  /** Whole USD dollars → converted to cents in API layer or call sites. */
  priceMinCents?: number;
  priceMaxCents?: number;
  mileageMin?: number;
  mileageMax?: number;
  /**
   * Loose location match: substring on `locationZip`, `title`, or `description`
   * (case-insensitive). Not geo radius.
   */
  location?: string;
  /** `ConditionGrade` string when valid. */
  condition?: string;
  /** Reserved: no `Auction.featured` column yet — accepted for forward compatibility. */
  featuredOnly?: boolean;
  noReserve?: boolean;
  endingSoon?: boolean;
  /** Defaults to LIVE when omitted. */
  status?: string;
  sort?: AuctionSearchSort;
  page?: number;
  pageSize?: number;
  zip?: string;
  /** Miles — paired with `zip` for bounding-box filter (existing behavior). */
  radiusMiles?: number;
};

export type AuctionSearchHit = {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  status: string;
  endAt: string;
  startAt: string;
  createdAt: string;
  reservePriceCents: number | null;
  buyNowPriceCents: number | null;
  mileage: number | null;
  conditionGrade: string | null;
  locationZip: string | null;
  latitude: number | null;
  longitude: number | null;
  highBidCents: number;
  bidCount: number;
  images: { id: string; url: string; sortOrder: number }[];
  seller: { handle: string } | null;
};

export type AuctionSearchResult = {
  results: AuctionSearchHit[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    /** When `HIGHEST_BID` sort and total rows exceed scan cap. */
    highBidSortTruncated?: boolean;
  };
  facets?: Record<string, unknown>;
  meta?: {
    engine: "prisma";
    /** Echo safe subset of applied filters for clients. */
    applied: Record<string, unknown>;
  };
};

const LIST_INCLUDE = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 2 },
  bids: { orderBy: { amountCents: "desc" as const }, take: 1 },
  seller: { select: { handle: true } },
  _count: { select: { bids: true } },
} as const;

function parseCondition(
  raw: string | undefined
): ConditionGrade | undefined {
  if (!raw?.trim()) return undefined;
  const u = raw.trim().toUpperCase();
  return CONDITION_GRADES.has(u) ? (u as ConditionGrade) : undefined;
}

/**
 * Build Prisma `where` from structured input. Pure function for testing and
 * future alternate backends that need the same semantics.
 */
export function buildAuctionSearchWhere(
  input: AuctionSearchInput,
  now: Date = new Date()
): Prisma.AuctionWhereInput {
  const status = input.status?.trim() || "LIVE";
  const where: Prisma.AuctionWhereInput = { status };

  if (input.make?.trim()) {
    where.make = { equals: input.make.trim(), mode: "insensitive" };
  }
  if (input.model?.trim()) {
    where.model = { equals: input.model.trim(), mode: "insensitive" };
  }
  if (input.yearMin != null || input.yearMax != null) {
    where.year = {};
    if (input.yearMin != null) where.year.gte = input.yearMin;
    if (input.yearMax != null) where.year.lte = input.yearMax;
  }

  if (input.mileageMin != null || input.mileageMax != null) {
    where.mileage = {};
    if (input.mileageMin != null) where.mileage.gte = input.mileageMin;
    if (input.mileageMax != null) where.mileage.lte = input.mileageMax;
  }

  const cond = parseCondition(input.condition);
  if (cond) where.conditionGrade = cond;

  if (input.noReserve) where.reservePriceCents = null;
  if (input.endingSoon) {
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    where.endAt = { lte: soon };
  }

  const q = input.query?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { make: { contains: q, mode: "insensitive" } },
      { model: { contains: q, mode: "insensitive" } },
    ];
  }

  const loc = input.location?.trim();
  if (loc) {
    const locOr: Prisma.AuctionWhereInput[] = [
      { locationZip: { contains: loc, mode: "insensitive" } },
      { title: { contains: loc, mode: "insensitive" } },
      { description: { contains: loc, mode: "insensitive" } },
    ];
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), { OR: locOr }];
  }

  let centerLat: number | null = null;
  let centerLng: number | null = null;
  const zip = input.zip?.trim();
  const radius = input.radiusMiles;
  if (zip && radius != null && radius > 0) {
    const coords = getZipCoords(zip);
    if (coords) {
      centerLat = coords.lat;
      centerLng = coords.lng;
      const box = boundingBox(coords.lat, coords.lng, radius);
      const geoAnd: Prisma.AuctionWhereInput[] = [
        { latitude: { not: null } },
        { longitude: { not: null } },
        { latitude: { gte: box.latMin, lte: box.latMax } },
        { longitude: { gte: box.lngMin, lte: box.lngMax } },
      ];
      where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...geoAnd];
    }
  }
  void centerLat;
  void centerLng;

  const priceAnds: Prisma.AuctionWhereInput[] = [];
  if (input.priceMinCents != null && input.priceMinCents >= 0) {
    priceAnds.push({
      OR: [
        {
          AND: [
            { reservePriceCents: { gte: input.priceMinCents } },
            { bids: { none: {} } },
          ],
        },
        { bids: { some: { amountCents: { gte: input.priceMinCents } } } },
      ],
    });
  }
  if (input.priceMaxCents != null && input.priceMaxCents >= 0) {
    priceAnds.push({
      OR: [
        {
          AND: [
            { reservePriceCents: { lte: input.priceMaxCents } },
            { reservePriceCents: { not: null } },
            { bids: { none: {} } },
          ],
        },
        {
          AND: [
            { bids: { some: {} } },
            { bids: { none: { amountCents: { gt: input.priceMaxCents } } } },
          ],
        },
      ],
    });
  }
  if (priceAnds.length > 0) {
    where.AND = [...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []), ...priceAnds];
  }

  // featuredOnly: reserved — no `Auction.featured` column yet; param accepted upstream for future use.
  void input.featuredOnly;

  return where;
}

function toHit(row: {
  id: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  status: string;
  endAt: Date;
  startAt: Date;
  createdAt: Date;
  reservePriceCents: number | null;
  buyNowPriceCents: number | null;
  mileage: number | null;
  conditionGrade: string | null;
  locationZip: string | null;
  latitude: number | null;
  longitude: number | null;
  images: { id: string; url: string; sortOrder: number }[];
  bids: { amountCents: number }[];
  seller: { handle: string } | null;
  _count: { bids: number };
}): AuctionSearchHit {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    make: row.make,
    model: row.model,
    trim: row.trim,
    status: row.status,
    endAt: row.endAt.toISOString(),
    startAt: row.startAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    reservePriceCents: row.reservePriceCents,
    buyNowPriceCents: row.buyNowPriceCents,
    mileage: row.mileage,
    conditionGrade: row.conditionGrade,
    locationZip: row.locationZip,
    latitude: row.latitude,
    longitude: row.longitude,
    highBidCents: computeCurrentBidCents(row.bids),
    bidCount: row._count.bids,
    images: row.images,
    seller: row.seller,
  };
}

export async function searchAuctions(
  input: AuctionSearchInput
): Promise<AuctionSearchResult> {
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 24));
  const sort: AuctionSearchSort = input.sort ?? "ENDING_SOON";
  const now = new Date();
  const where = buildAuctionSearchWhere(input, now);

  const applied: Record<string, unknown> = {
    status: input.status?.trim() || "LIVE",
    sort,
    page,
    pageSize,
  };

  const total = await prisma.auction.count({ where });

  if (sort === "HIGHEST_BID") {
    const fetchCap = Math.min(HIGHEST_BID_SCAN_CAP, Math.max(total, 1));
    const candidates = await prisma.auction.findMany({
      where,
      include: LIST_INCLUDE,
      take: fetchCap,
      orderBy: { endAt: "asc" },
    });
    candidates.sort(
      (a, b) =>
        computeCurrentBidCents(b.bids) - computeCurrentBidCents(a.bids)
    );
    const start = (page - 1) * pageSize;
    const slice = candidates.slice(start, start + pageSize).map(toHit);
    return {
      results: slice,
      pagination: {
        page,
        pageSize,
        total,
        highBidSortTruncated: total > fetchCap,
      },
      meta: { engine: "prisma", applied },
    };
  }

  let orderBy: Prisma.AuctionOrderByWithRelationInput[] = [];
  switch (sort) {
    case "NEWEST":
      orderBy = [{ createdAt: "desc" }];
      break;
    case "PRICE_ASC":
      orderBy = [
        { reservePriceCents: { sort: "asc", nulls: "last" } },
        { buyNowPriceCents: { sort: "asc", nulls: "last" } },
        { endAt: "asc" },
      ];
      break;
    case "PRICE_DESC":
      orderBy = [
        { reservePriceCents: { sort: "desc", nulls: "last" } },
        { buyNowPriceCents: { sort: "desc", nulls: "last" } },
        { endAt: "asc" },
      ];
      break;
    case "ENDING_SOON":
    default:
      orderBy = [{ endAt: "asc" }];
      break;
  }

  const rows = await prisma.auction.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: LIST_INCLUDE,
  });

  return {
    results: rows.map(toHit),
    pagination: { page, pageSize, total },
    meta: { engine: "prisma", applied },
  };
}

/** Map legacy `/auctions` URL sort params to canonical enum. */
export function parseAuctionSearchSortParam(
  raw: string | undefined
): AuctionSearchSort {
  if (!raw) return "ENDING_SOON";
  const u = raw.toUpperCase();
  if (u === "ENDING_SOON" || raw === "ending") return "ENDING_SOON";
  if (u === "NEWEST" || raw === "newest") return "NEWEST";
  if (u === "HIGHEST_BID" || raw === "highest") return "HIGHEST_BID";
  if (u === "PRICE_ASC" || raw === "price_asc" || raw === "priceAsc")
    return "PRICE_ASC";
  if (u === "PRICE_DESC" || raw === "price_desc" || raw === "priceDesc")
    return "PRICE_DESC";
  return "ENDING_SOON";
}
