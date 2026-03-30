import { NextResponse } from "next/server";
import { requireSellerMarketingCsvAccess } from "@/lib/marketing/marketing-export-auth";
import { buildSellerCampaignsCsv } from "@/lib/marketing/export-seller-campaigns-csv";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ handle: string }> }
) {
  const { handle } = await context.params;
  const auth = await requireSellerMarketingCsvAccess(handle);
  if (!auth.ok) return auth.response;

  const csv = await buildSellerCampaignsCsv(auth.user.id);
  const body = `\uFEFF${csv}`;
  const safe = auth.user.handle.replace(/[^\w.-]+/g, "_");
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="marketing-campaigns-${safe}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
