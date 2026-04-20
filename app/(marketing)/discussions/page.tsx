import type { Metadata } from "next";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import {
  listRecommendedGears,
  listSuggestedDiscussionUsers,
  listTrendingThreadsGlobal,
} from "@/lib/forums/discussions-discovery";
import { listForumSpaces } from "@/lib/forums/forum-service";
import { listFollowedThreadsForViewer } from "@/lib/carmunity/following-feed";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discussions",
  description:
    "Browse Carmunity Discussions by Gear and Lower Gear — unified profiles, reactions, and community on Carmunity by Carasta.",
};

export default async function DiscussionsPage() {
  const session = await getSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;

  let spaces: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    sortOrder: number;
    categoryCount: number;
  }> = [];
  let loadError: string | null = null;

  const [recommendedGears, trendingThreads, suggestedUsers, followedThreads] = await Promise.all([
    listRecommendedGears({ take: 4 }).catch(() => []),
    listTrendingThreadsGlobal({ take: 6 }).catch(() => []),
    listSuggestedDiscussionUsers({ take: 6, excludeUserId: viewerId }).catch(() => []),
    listFollowedThreadsForViewer(viewerId, { take: 6 }).catch(() => []),
  ]);

  try {
    const result = await listForumSpaces();
    if (result.ok) {
      spaces = result.spaces;
    }
  } catch {
    loadError =
      "We couldn’t load discussions right now. Please try again later.";
  }

  return (
    <div className="carasta-container max-w-3xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
        Discussions
      </h1>
      <p className="mt-1 text-neutral-400">
        Reddit-style threads with a premium automotive lens — organized as{" "}
        <span className="text-primary">Gears</span> (top-level) and{" "}
        <span className="text-primary">Lower Gears</span> (sub-topics). One
        Carmunity identity: every <span className="text-neutral-200">@handle</span>{" "}
        links to the same <span className="text-neutral-200">/u/[handle]</span>{" "}
        profile.
      </p>

      {followedThreads.length > 0 ? (
        <section className="mt-8 space-y-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Your graph
              </p>
              <h2 className="font-display text-base font-semibold uppercase tracking-wide text-neutral-100">
                Threads from people you follow
              </h2>
            </div>
            <Link
              href="/explore?tab=following"
              className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Following feed
            </Link>
          </div>
          <ul className="divide-y divide-white/10">
            {followedThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className="flex flex-col gap-0.5 py-2.5 text-sm text-neutral-200 transition hover:text-primary"
                >
                  <span className="line-clamp-2 font-medium text-neutral-100">{t.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    @{t.authorHandle} · {t.gearSlug} / {t.lowerGearSlug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {(recommendedGears.length > 0 || trendingThreads.length > 0 || suggestedUsers.length > 0) && (
        <div className="mt-10 space-y-10">
          {recommendedGears.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                    Discovery
                  </p>
                  <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                    Active Gears
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gears with the most thread activity in the last 14 days.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendedGears.map((g) => (
                  <Link
                    key={g.id}
                    href={`/discussions/${g.slug}`}
                    className="rounded-2xl border border-border/50 bg-card/50 px-4 py-4 shadow-glass-sm transition hover:border-primary/35 hover:bg-muted/10"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                      Gear
                    </p>
                    <h3 className="mt-1 font-display text-base font-semibold uppercase tracking-wide text-neutral-100">
                      {g.title}
                    </h3>
                    {g.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      ~{g.activeThreadsApprox} active thread{g.activeThreadsApprox === 1 ? "" : "s"}{" "}
                      · <code className="text-neutral-400">{g.slug}</code>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {trendingThreads.length > 0 ? (
            <section className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                  Trending
                </p>
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                  Trending threads
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reply- and reaction-weighted ranking with recency decay (Phase G style, global).
                </p>
              </div>
              <ul className="divide-y divide-white/5 rounded-2xl border border-border/50 bg-card/40">
                {trendingThreads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                      className="block px-4 py-3 transition hover:bg-muted/15"
                    >
                      <p className="font-medium text-neutral-100 line-clamp-2">{t.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.gearSlug} / {t.lowerGearSlug} · {t.replyCount}{" "}
                        {t.replyCount === 1 ? "reply" : "replies"} ·{" "}
                        {t.lastActivityAt.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {suggestedUsers.length > 0 ? (
            <section className="space-y-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                  People
                </p>
                <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                  Suggested voices
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Handles with the most discussion threads and replies in the last 30 days.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {suggestedUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/u/${encodeURIComponent(u.handle)}`}
                      className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/40 px-3 py-3 transition hover:border-primary/35 hover:bg-muted/10"
                    >
                      <Avatar className="h-10 w-10 border border-white/10">
                        <AvatarImage src={u.avatarUrl ?? undefined} alt="" />
                        <AvatarFallback className="text-xs">
                          {(u.name ?? u.handle).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-neutral-100">
                          {u.name?.trim() || `@${u.handle}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">@{u.handle}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                          {u.activityScore} posts in window
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <h2 className="mt-12 font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
        All Gears
      </h2>
      <div className="mt-4 space-y-3">
        {loadError ? (
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-300">
            {loadError}
          </p>
        ) : spaces.length === 0 ? (
          <p className="rounded-xl border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
            No Gears are active yet. Run <code className="text-primary/90">prisma db seed</code>{" "}
            after <code className="text-primary/90">db push</code> to load taxonomy.
          </p>
        ) : (
          spaces.map((s) => (
            <Link
              key={s.id}
              href={`/discussions/${s.slug}`}
              className="block rounded-2xl border border-border/50 bg-card/50 px-4 py-4 shadow-glass-sm transition hover:border-primary/35 hover:bg-muted/10"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                Gear
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-neutral-100">
                {s.title}
              </h3>
              {s.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {s.categoryCount} Lower Gear{s.categoryCount === 1 ? "" : "s"} · slug{" "}
                <code className="text-neutral-300">{s.slug}</code>
              </p>
            </Link>
          ))
        )}
      </div>

      <p className="mt-10 text-sm text-neutral-500">
        <Link href="/explore" className="text-primary hover:underline">
          ← Carmunity feed
        </Link>
      </p>
    </div>
  );
}
