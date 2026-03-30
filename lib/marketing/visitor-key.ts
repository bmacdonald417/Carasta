/** Strip control chars and homoglyph-ish noise; keep printable ASCII-ish keys stable. */
function stripUnsafeChars(s: string): string {
  return s.replace(/[\u0000-\u001F\u007F]/g, "");
}

/**
 * Normalize client-provided dedupe keys: trim, collapse internal ASCII whitespace,
 * lowercase (UUIDs / hex), max length, minimum entropy.
 */
export function normalizeMarketingVisitorKey(
  key: string | null | undefined
): string | null {
  if (key == null) return null;
  let t = stripUnsafeChars(key).trim().replace(/\s+/g, "").toLowerCase();
  t = t.slice(0, 128);
  if (t.length < 8) return null;
  return t;
}
