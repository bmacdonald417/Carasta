/**
 * Canonical /u/{handle} URLs (handles are stored lowercase; session token may not be).
 */

export function normalizePublicHandle(handle: string | null | undefined): string | undefined {
  const h = typeof handle === "string" ? handle.trim().toLowerCase() : "";
  return h.length > 0 ? h : undefined;
}

/** Signed-in users without a public handle yet — settings until handle exists. */
export function profileNavHref(handle: string | null | undefined): string {
  const h = normalizePublicHandle(handle);
  if (!h) return "/settings";
  return `/u/${encodeURIComponent(h)}`;
}

export function garageNavHref(handle: string | null | undefined): string {
  const h = normalizePublicHandle(handle);
  if (!h) return "/settings";
  return `/u/${encodeURIComponent(h)}/garage`;
}

export function listingsNavHref(handle: string | null | undefined): string | null {
  const h = normalizePublicHandle(handle);
  if (!h) return null;
  return `/u/${encodeURIComponent(h)}/listings`;
}

export function marketingNavHref(handle: string | null | undefined): string | null {
  const h = normalizePublicHandle(handle);
  if (!h) return null;
  return `/u/${encodeURIComponent(h)}/marketing`;
}

export function campaignsNavHref(handle: string | null | undefined): string | null {
  const h = normalizePublicHandle(handle);
  if (!h) return null;
  return `/u/${encodeURIComponent(h)}/marketing/campaigns`;
}

/** Active state: profile tab or /settings when user has no handle yet. */
export function profileNavActive(pathname: string, handle: string | null | undefined): boolean {
  if (!normalizePublicHandle(handle)) {
    return pathname === "/settings" || pathname.startsWith("/settings/");
  }
  const base = profileNavHref(handle);
  if (pathname === base) return true;
  const followers = `${base}/followers`;
  const following = `${base}/following`;
  return pathname.startsWith(followers) || pathname.startsWith(following);
}
