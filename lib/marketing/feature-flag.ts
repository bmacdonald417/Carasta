/**
 * Seller Marketing feature gate (server-side).
 * Enable in .env with MARKETING_ENABLED=true
 */
export function isMarketingEnabled(): boolean {
  return process.env.MARKETING_ENABLED === "true";
}
