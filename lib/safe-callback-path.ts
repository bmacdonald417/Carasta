/**
 * Only allow in-app relative paths (blocks `//host` open redirects and absolute URLs).
 */
export function safeCallbackPath(raw: string | null | undefined, fallback: string = "/"): string {
  if (raw == null || raw === "") return fallback;
  const p = raw.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return fallback;
  return p;
}

/** Returns `undefined` when missing or unsafe (caller may omit query param). */
export function safeCallbackPathOptional(
  raw: string | null | undefined
): string | undefined {
  if (raw == null || raw === "") return undefined;
  const p = raw.trim();
  if (!p.startsWith("/") || p.startsWith("//")) return undefined;
  return p;
}
