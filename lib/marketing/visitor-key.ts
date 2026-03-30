/** Normalize client-provided dedupe keys (trim, max length, minimum entropy). */
export function normalizeMarketingVisitorKey(
  key: string | null | undefined
): string | null {
  if (key == null) return null;
  const t = key.trim().slice(0, 128);
  if (t.length < 8) return null;
  return t;
}
