import { NextResponse } from "next/server";
import { requireAdminMarketingCsvAccess } from "@/lib/marketing/admin-marketing-export-auth";
import { buildAdminMarketingSummaryCsv } from "@/lib/marketing/export-admin-marketing-summary-csv";
import { getAdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function filenameStamp(d: Date): string {
  const iso = d.toISOString().slice(0, 16).replace(/[-:T]/g, "");
  return `admin-marketing-summary-${iso}Z.csv`;
}

export async function GET() {
  const auth = await requireAdminMarketingCsvAccess();
  if (!auth.ok) return auth.response;

  const exportedAt = new Date();
  const summary = await getAdminMarketingPlatformSummary();
  const csv = buildAdminMarketingSummaryCsv(summary, exportedAt);
  const body = `\uFEFF${csv}`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenameStamp(exportedAt)}"`,
      "Cache-Control": "no-store",
    },
  });
}
