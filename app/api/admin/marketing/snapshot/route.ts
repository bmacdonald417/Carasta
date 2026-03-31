import { NextRequest, NextResponse } from "next/server";
import { requireAdminMarketingCsvAccess } from "@/lib/marketing/admin-marketing-export-auth";
import { buildAdminMarketingSnapshotJson } from "@/lib/marketing/admin-marketing-snapshot-json";
import {
  ADMIN_MARKETING_SNAPSHOT_CACHE_CONTROL,
  adminMarketingSnapshotIfNoneMatchSatisfied,
  computeAdminMarketingSnapshotEtag,
  stableJsonStringForAdminMarketingSnapshotEtag,
} from "@/lib/marketing/admin-marketing-snapshot-etag";
import { getAdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const snapshotCacheHeaders = {
  "Cache-Control": ADMIN_MARKETING_SNAPSHOT_CACHE_CONTROL,
} as const;

/**
 * Machine-readable marketing platform summary for internal tools / BI.
 * **ADMIN session required** (same gate as CSV exports). **GET** only.
 *
 * **Conditional GET:** **`ETag`** is a SHA-256 of the JSON payload **excluding `generatedAt`**
 * so polling can **`304`** when metrics are unchanged. **`200`** responses always include a fresh **`generatedAt`**.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAdminMarketingCsvAccess();
  if (!auth.ok) return auth.response;

  const generatedAt = new Date();
  const summary = await getAdminMarketingPlatformSummary();
  const body = buildAdminMarketingSnapshotJson(summary, generatedAt);
  const stableJson = stableJsonStringForAdminMarketingSnapshotEtag(body);
  const etag = computeAdminMarketingSnapshotEtag(stableJson);

  const inm = req.headers.get("if-none-match");
  if (adminMarketingSnapshotIfNoneMatchSatisfied(inm, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ...snapshotCacheHeaders,
        ETag: etag,
      },
    });
  }

  const jsonStr = JSON.stringify(body);
  return new NextResponse(jsonStr, {
    status: 200,
    headers: {
      ...snapshotCacheHeaders,
      "Content-Type": "application/json; charset=utf-8",
      ETag: etag,
    },
  });
}
