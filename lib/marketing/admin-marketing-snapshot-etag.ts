import { createHash } from "crypto";
import type { AdminMarketingSnapshotJson } from "@/lib/marketing/admin-marketing-snapshot-json";

export const ADMIN_MARKETING_SNAPSHOT_CACHE_CONTROL = "private, max-age=15";

/**
 * JSON used for ETag only. Omits **`generatedAt`** so the tag reflects data changes, not clock.
 * Full 200 responses still include a fresh **`generatedAt`**.
 */
export function stableJsonStringForAdminMarketingSnapshotEtag(
  body: AdminMarketingSnapshotJson
): string {
  const { generatedAt: _generatedAt, ...rest } = body;
  return JSON.stringify(rest);
}

/** Strong ETag (quoted opaque token, SHA-256 base64url). */
export function computeAdminMarketingSnapshotEtag(stableJsonUtf8: string): string {
  const digest = createHash("sha256")
    .update(stableJsonUtf8, "utf8")
    .digest("base64url");
  return `"${digest}"`;
}

/**
 * True if **`If-None-Match`** lists our ETag (strong or weak), or **`*`**.
 */
export function adminMarketingSnapshotIfNoneMatchSatisfied(
  ifNoneMatchHeader: string | null,
  etagQuoted: string
): boolean {
  if (!ifNoneMatchHeader?.trim()) return false;
  const ours = etagQuoted.startsWith('"')
    ? etagQuoted.slice(1, -1)
    : etagQuoted;
  for (const part of ifNoneMatchHeader.split(",")) {
    let p = part.trim();
    if (!p) continue;
    if (p === "*") return true;
    if (p.toUpperCase().startsWith("W/")) {
      p = p.slice(2).trim();
    }
    const token = p.startsWith('"') && p.endsWith('"') ? p.slice(1, -1) : p;
    if (token === ours) return true;
  }
  return false;
}
