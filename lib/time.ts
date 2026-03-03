/**
 * Shared time utilities for countdowns and urgency.
 * Use for consistent formatting in RSC and client contexts.
 */

export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** >24h: normal, 24h–1h: subtle, <1h: elevated, <=0: ended */
export const URGENCY_24H_MS = MS_PER_DAY;
export const URGENCY_1H_MS = MS_PER_HOUR;

export type UrgencyLevel = "normal" | "subtle" | "elevated" | "ended";

export function getUrgencyLevel(diffMs: number): UrgencyLevel {
  if (diffMs <= 0) return "ended";
  if (diffMs < URGENCY_1H_MS) return "elevated";
  if (diffMs < URGENCY_24H_MS) return "subtle";
  return "normal";
}

export function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatTimeLeft(diffMs: number): string {
  if (diffMs <= 0) return "Ended";

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const mins = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);
  const secs = Math.floor((diffMs % MS_PER_MINUTE) / MS_PER_SECOND);

  if (days > 0) {
    return `${days}d ${pad(hours)}h ${pad(mins)}m left`;
  }
  return `${pad(hours)}:${pad(mins)}:${pad(secs)} left`;
}

/** For detail-style display (no "left" suffix, includes seconds when <24h) */
export function formatTimeRemaining(diffMs: number): string {
  if (diffMs <= 0) return "Ended";

  const days = Math.floor(diffMs / MS_PER_DAY);
  const hours = Math.floor((diffMs % MS_PER_DAY) / MS_PER_HOUR);
  const mins = Math.floor((diffMs % MS_PER_HOUR) / MS_PER_MINUTE);
  const secs = Math.floor((diffMs % MS_PER_MINUTE) / MS_PER_SECOND);

  if (days > 0) {
    return `${days}d ${hours}h ${mins}m ${secs}s`;
  }
  return `${hours}h ${pad(mins)}m ${pad(secs)}s`;
}
