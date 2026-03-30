const ALLOWED_KEYS = [
  "path",
  "referrer",
  "shareTarget",
  "currentUrl",
  "visitorKey",
] as const;

const MAX_STRING = 2000;

/** Keep only small, non-sensitive string fields for storage. */
export function sanitizeMarketingMetadata(
  meta: Record<string, unknown> | undefined
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const out: Record<string, unknown> = {};
  for (const key of ALLOWED_KEYS) {
    const v = meta[key];
    if (typeof v === "string" && v.length <= MAX_STRING) {
      out[key] = v;
    }
  }
  return Object.keys(out).length ? out : undefined;
}
