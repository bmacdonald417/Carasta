/**
 * Shared auction metrics helpers.
 * Used by: home, /auctions, auction detail, API routes, polling.
 *
 * Data source: bids included via Prisma (orderBy amountCents desc, take 1)
 * and _count.bids. No separate getAuctionHighBid calls.
 */

import { formatCurrency as formatMoneyUtil } from "./utils";

type BidLike = { amountCents: number };

/**
 * Compute current high bid from included bids (orderBy amountCents desc, take 1).
 * Returns 0 only when there are truly no bids.
 */
export function computeCurrentBidCents(bids: BidLike[] | undefined): number {
  const top = bids?.[0];
  return top?.amountCents ?? 0;
}

/**
 * Reserve met percent: min(currentBid/reservePrice, 1.0) * 100.
 * Returns null when reserve is missing or <= 0 (no reserve).
 */
export function computeReserveMetPercent(
  currentBidCents: number,
  reservePriceCents: number | null
): number | null {
  if (reservePriceCents == null || reservePriceCents <= 0) return null;
  const pct = (currentBidCents / reservePriceCents) * 100;
  return Math.min(100, Math.round(pct));
}

/** Format cents as currency. Re-exports lib/utils formatCurrency. */
export function formatMoney(cents: number): string {
  return formatMoneyUtil(cents);
}

/** Format 0-100 as percent string. */
export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
