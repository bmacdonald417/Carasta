/**
 * Best-effort per-process rate limiting for API routes (dev + single-node).
 * Not a substitute for distributed rate limits in production.
 */
const buckets = new Map<string, number>();

export function allowAction(key: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const last = buckets.get(key) ?? 0;
  if (now - last < minIntervalMs) return false;
  buckets.set(key, now);
  return true;
}
