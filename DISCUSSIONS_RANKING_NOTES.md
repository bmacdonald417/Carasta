# Discussions ranking notes (Phase G)

Formulas are implemented in SQL via `lib/forums/discussion-ranking-queries.ts` and documented in `lib/forums/discussion-ranking.ts`.

## New

- Order: `createdAt DESC`, tie-break `id DESC`.
- Window: all threads in the Lower Gear.

## Top (90-day window)

Only threads with `createdAt >= now() - 90 days`.

Score (higher is better):

\[
\text{topScore} = replyCount \cdot 4 + threadReactionCount \cdot 1.5
\]

Order: `topScore DESC`, then `createdAt DESC`, then `id DESC`.

## Trending

All threads in the Lower Gear participate.

Let:

- `engagement = replyCount * 3 + threadReactionCount * 1.5 + 1`
- `ageHours = max(0, hours since lastActivityAt)`

Score:

\[
\text{trendingScore} = \frac{engagement}{1 + \frac{ageHours}{168}}
\]

`168` is a **half-life scale** (hours) in the denominator: older `lastActivityAt` decays influence so stale threads do not dominate.

Order: `trendingScore DESC`, then `lastActivityAt DESC`, then `id DESC`.
