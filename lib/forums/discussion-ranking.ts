/**
 * Discussions ranking (Phase G) — explainable heuristics for Lower Gear thread lists.
 *
 * ## New
 * Pure recency: `createdAt` descending.
 *
 * ## Top (90-day window)
 * Quality score per thread:
 *   `topScore = replyCount * 4 + threadReactionCount * 1.5`
 * Ordered by `topScore` desc, then `createdAt` desc for stability.
 * Only threads with `createdAt >= now() - 90 days` participate (keeps stale mega-threads from dominating).
 *
 * ## Trending
 * Blends engagement with freshness of **last activity**:
 *   `engagement = replyCount * 3 + threadReactionCount * 1.5 + 1`
 *   `ageHours = max(0, hours since lastActivityAt)`
 *   `trendingScore = engagement / (1 + ageHours / 168)`
 * So recent bursts rank higher; very old lastActivity decays toward zero. Tie-break: `lastActivityAt`, then `id`.
 *
 * Implementation note: ranked lists resolve IDs via SQL (`lib/forums/discussion-ranking-queries.ts`)
 * then hydrate rows in Prisma to attach authors + reaction summaries.
 */

export const TOP_WINDOW_DAYS = 90;

export const RANKING_WEIGHTS = {
  topReply: 4,
  topReaction: 1.5,
  trendingReply: 3,
  trendingReaction: 1.5,
  trendingRecencyHalfLifeHours: 168, // 1 week scale inside denominator
} as const;
