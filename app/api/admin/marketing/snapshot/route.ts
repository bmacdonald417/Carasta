import { NextResponse } from "next/server";
import { requireAdminMarketingCsvAccess } from "@/lib/marketing/admin-marketing-export-auth";
import { buildAdminMarketingSnapshotJson } from "@/lib/marketing/admin-marketing-snapshot-json";
import { getAdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Machine-readable marketing platform summary for internal tools / BI.
 * **ADMIN session required** (same gate as CSV exports). **GET** only, **no-store**.
 */
export async function GET() {
  const auth = await requireAdminMarketingCsvAccess();
  if (!auth.ok) return auth.response;

  const generatedAt = new Date();
  const summary = await getAdminMarketingPlatformSummary();
  const body = buildAdminMarketingSnapshotJson(summary, generatedAt);

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
