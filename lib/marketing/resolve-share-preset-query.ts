/**
 * Parse `?presetId=` for Share & Promote deep links.
 * `built_in` selects the standard bundle; otherwise id must match a user preset.
 */
export function parseSharePresetQueryParam(
  raw: string | undefined,
  validPresetIds: ReadonlySet<string>
): "built_in" | string | null {
  if (raw == null || raw.trim() === "") return null;
  const v = raw.trim();
  if (v === "built_in") return "built_in";
  if (validPresetIds.has(v)) return v;
  return null;
}

export function firstSearchParamValue(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string
): string | undefined {
  if (!searchParams) return undefined;
  const v = searchParams[key];
  if (typeof v === "string") {
    const t = v.trim();
    return t ? t : undefined;
  }
  if (Array.isArray(v)) {
    const s = v[0];
    if (typeof s !== "string") return undefined;
    const t = s.trim();
    return t ? t : undefined;
  }
  return undefined;
}
