import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatCompactNumber(n: number): string {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

export const BID_INCREMENT_CENTS = 25000; // $250

export function nextMinBidCents(currentHighCents: number): number {
  return currentHighCents + BID_INCREMENT_CENTS;
}

export const ANTI_SNIPE_EXTEND_SECONDS = 120;
export const BUY_NOW_WINDOW_HOURS = 24;
