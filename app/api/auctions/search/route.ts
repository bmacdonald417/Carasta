import { NextRequest, NextResponse } from "next/server";
import {
  parseAuctionSearchSortParam,
  searchAuctions,
  type AuctionSearchInput,
} from "@/lib/search/auction-search-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseIntParam(
  raw: string | null,
  opts?: { min?: number; max?: number }
): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return undefined;
  if (opts?.min != null && n < opts.min) return undefined;
  if (opts?.max != null && n > opts.max) return undefined;
  return n;
}

function parseFloatParam(raw: string | null, min = 0): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n) || n < min) return undefined;
  return n;
}

function parseBool(raw: string | null): boolean | undefined {
  if (raw == null || raw === "") return undefined;
  const l = raw.toLowerCase();
  if (l === "1" || l === "true" || l === "yes") return true;
  if (l === "0" || l === "false" || l === "no") return false;
  return undefined;
}

function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/**
 * `GET /api/auctions/search` — unified auction discovery for web and mobile.
 *
 * Query params map to {@link AuctionSearchInput}. Prices may be sent as **USD dollars**
 * (decimals) via `priceMin` / `priceMax`; they are converted to integer cents server-side.
 *
 * @see `AUCTION_SEARCH_ARCHITECTURE.md`
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams;

  const priceMinDollars = parseFloatParam(q.get("priceMin"), 0);
  const priceMaxDollars = parseFloatParam(q.get("priceMax"), 0);

  const input: AuctionSearchInput = {
    query: q.get("q")?.trim() || q.get("query")?.trim() || undefined,
    make: q.get("make")?.trim() || undefined,
    model: q.get("model")?.trim() || undefined,
    yearMin: parseIntParam(q.get("yearMin"), { min: 1900, max: 2100 }),
    yearMax: parseIntParam(q.get("yearMax"), { min: 1900, max: 2100 }),
    priceMinCents:
      priceMinDollars !== undefined ? dollarsToCents(priceMinDollars) : undefined,
    priceMaxCents:
      priceMaxDollars !== undefined ? dollarsToCents(priceMaxDollars) : undefined,
    mileageMin: parseIntParam(q.get("mileageMin"), { min: 0 }),
    mileageMax: parseIntParam(q.get("mileageMax"), { min: 0 }),
    location: q.get("location")?.trim() || undefined,
    condition: q.get("condition")?.trim() || undefined,
    featuredOnly:
      parseBool(q.get("featuredOnly")) || parseBool(q.get("featured"))
        ? true
        : undefined,
    noReserve: parseBool(q.get("noReserve")) === true || undefined,
    endingSoon: parseBool(q.get("endingSoon")) === true || undefined,
    status: q.get("status")?.trim() || undefined,
    sort: parseAuctionSearchSortParam(q.get("sort") ?? undefined),
    page: parseIntParam(q.get("page"), { min: 1 }) ?? 1,
    pageSize: parseIntParam(q.get("pageSize"), { min: 1, max: 100 }) ?? 24,
    zip: q.get("zip")?.trim()?.slice(0, 10) || undefined,
    radiusMiles: parseIntParam(q.get("radius"), { min: 1 }),
  };

  const { featuredOnly: _f, ...echoSafe } = input;
  void _f;

  try {
    const data = await searchAuctions(input);
    return NextResponse.json({
      ok: true,
      results: data.results,
      pagination: data.pagination,
      meta: {
        ...data.meta,
        applied: { ...data.meta?.applied, ...echoSafe },
      },
    });
  } catch (e) {
    console.error("[auctions/search]", e);
    return NextResponse.json(
      { ok: false, error: "search_failed" },
      { status: 500 }
    );
  }
}
