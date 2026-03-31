import type { AdminMarketingPlatformSummary } from "@/lib/marketing/get-admin-marketing-platform-summary";

/**
 * JSON-serializable admin marketing snapshot for GET /api/admin/marketing/snapshot.
 * Dates are ISO strings; otherwise mirrors getAdminMarketingPlatformSummary().
 *
 * Auth: same as other admin marketing API routes (requireAdminMarketingCsvAccess).
 * Not a public API; shape may evolve without semver.
 * ETag for conditional GET excludes generatedAt; see admin-marketing-snapshot-etag.ts.
 */
export type AdminMarketingSnapshotJson = {
  ok: true;
  generatedAt: string;
  note: string;
  marketingEnabled: boolean;
  totals: AdminMarketingPlatformSummary["totals"];
  recentActivity: AdminMarketingPlatformSummary["recentActivity"];
  topAuctions: AdminMarketingPlatformSummary["topAuctions"];
  topSellers: AdminMarketingPlatformSummary["topSellers"];
  topAuctionsLast7Days: AdminMarketingPlatformSummary["topAuctionsLast7Days"];
  topSellersLast7Days: AdminMarketingPlatformSummary["topSellersLast7Days"];
  recentCampaigns: Array<
    Omit<AdminMarketingPlatformSummary["recentCampaigns"][number], "updatedAt"> & {
      updatedAt: string;
    }
  >;
};

export function buildAdminMarketingSnapshotJson(
  summary: AdminMarketingPlatformSummary,
  generatedAt: Date
): AdminMarketingSnapshotJson {
  return {
    ok: true,
    generatedAt: generatedAt.toISOString(),
    note: "Internal Carasta admin marketing snapshot. For ADMIN-authenticated use only; field names and structure may change without a public API contract.",
    marketingEnabled: summary.marketingFeatureEnabled,
    totals: summary.totals,
    recentActivity: summary.recentActivity,
    topAuctions: summary.topAuctions,
    topSellers: summary.topSellers,
    topAuctionsLast7Days: summary.topAuctionsLast7Days,
    topSellersLast7Days: summary.topSellersLast7Days,
    recentCampaigns: summary.recentCampaigns.map((c) => ({
      ...c,
      updatedAt: c.updatedAt.toISOString(),
    })),
  };
}
