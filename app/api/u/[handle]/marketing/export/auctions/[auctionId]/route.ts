import { NextResponse } from "next/server";
import { requireSellerMarketingCsvAccess } from "@/lib/marketing/marketing-export-auth";
import { buildSellerAuctionMarketingCsv } from "@/lib/marketing/export-seller-auction-marketing-csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ handle: string; auctionId: string }> }
) {
  const { handle, auctionId } = await context.params;
  const auth = await requireSellerMarketingCsvAccess(handle);
  if (!auth.ok) return auth.response;

  const csv = await buildSellerAuctionMarketingCsv(auth.user.id, auctionId);
  if (!csv) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const body = `\uFEFF${csv}`;
  const safeHandle = auth.user.handle.replace(/[^\w.-]+/g, "_");
  const safeAuction = auctionId.replace(/[^\w-]+/g, "_").slice(0, 80);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="marketing-auction-${safeAuction}-${safeHandle}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
