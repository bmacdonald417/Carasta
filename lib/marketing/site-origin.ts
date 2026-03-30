/**
 * Absolute origin for seller-facing tracked links (server-side).
 * Prefer NEXT_PUBLIC_SITE_URL or NEXTAUTH_URL; Vercel and localhost fallbacks.
 */
export function getPublicSiteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
