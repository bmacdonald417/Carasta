import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { getCarmunityOnboardingState } from "@/lib/carmunity/onboarding-service";
import {
  listDiscoveryThreadMixForViewer,
  listSuggestedDiscussionUsersForViewer,
} from "@/lib/forums/discussion-recommendations";
import {
  listRecommendedGears,
  listSuggestedDiscussionUsers,
  listThreadsForPreferredGears,
  listTrendingThreadsGlobal,
} from "@/lib/forums/discussions-discovery";
import { listForumSpaces } from "@/lib/forums/forum-service";
import { listFollowedThreadsForViewer } from "@/lib/carmunity/following-feed";
import { getSession } from "@/lib/auth";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discussions",
  description:
    "Browse Carmunity Discussions by Gear and Lower Gear — unified profiles, reactions, and community on Carmunity by Carasta.",
};

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-wide text-primary">{children}</p>
  );
}

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

  const [recommendedGears, followedThreads, onboardingState] = await Promise.all([
    listRecommendedGears({ take: 4 }).catch(() => []),
    listFollowedThreadsForViewer(viewerId, { take: 6 }).catch(() => []),
    viewerId ? getCarmunityOnboardingState(viewerId) : Promise.resolve(null),
  ]);

  const gearSlugs = (onboardingState?.prefs.gearSlugs ?? []).filter(Boolean);

  const [suggestedUsers, interestThreads, trendingPool] = await Promise.all([
    viewerId
      ? listSuggestedDiscussionUsersForViewer({ viewerId, take: 6 }).catch(() => [])
      : listSuggestedDiscussionUsers({ take: 6, excludeUserId: viewerId }).catch(() => []),
    viewerId && gearSlugs.length > 0
      ? listThreadsForPreferredGears({ gearSlugs, take: 6 }).catch(() => [])
      : Promise.resolve([]),
    viewerId
      ? listDiscoveryThreadMixForViewer(viewerId, { take: 8 }).catch(() => [])
      : listTrendingThreadsGlobal({ take: 6 }).catch(() => []),
  ]);

  const interestIds = new Set(interestThreads.map((t) => t.id));
  const trendingThreads =
    viewerId && interestThreads.length > 0
      ? trendingPool.filter((t) => !interestIds.has(t.id))
      : trendingPool;

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
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Discussions
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Reddit-style threads with a premium automotive lens — organized as{" "}
          <span className="font-medium text-foreground">Gears</span> (top-level) and{" "}
          <span className="font-medium text-foreground">Lower Gears</span> (sub-topics). One
          Carmunity identity: every <span className="font-mono text-foreground/90">@handle</span>{" "}
          links to the same <span className="font-mono text-foreground/90">/u/[handle]</span>{" "}
          profile.
        </p>
      </header>

      {followedThreads.length > 0 ? (
        <section className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-e1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <SectionEyebrow>Your graph</SectionEyebrow>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                Threads from people you follow
              </h2>
            </div>
            <Link
              href="/explore?tab=following"
              className={cn(
                "text-xs font-medium text-primary hover:underline",
                shellFocusRing,
                "rounded-md"
              )}
            >
              Following feed
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {followedThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className={cn(
                    "flex flex-col gap-0.5 py-3 text-sm transition-colors",
                    shellFocusRing,
                    "-mx-1 rounded-lg px-1 hover:bg-muted/50"
                  )}
                >
                  <span className="line-clamp-2 font-medium text-foreground">{t.title}</span>
                  <span className="text-[11px] text-muted-foreground">
                    @{t.authorHandle} · {t.gearSlug} / {t.lowerGearSlug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {interestThreads.length > 0 ? (
        <section className="mt-8 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-e1">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <SectionEyebrow>For you</SectionEyebrow>
              <h2 className="mt-1 text-base font-semibold text-foreground">
                Threads in your Gears
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Pulled from the Gears you highlighted in Carmunity onboarding — same identity,
                tighter routing into the threads you signaled you care about.
              </p>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {interestThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className={cn(
                    "block py-3 text-sm transition-colors",
                    shellFocusRing,
                    "-mx-1 rounded-lg px-1 hover:bg-muted/50"
                  )}
                >
                  <span className="line-clamp-2 font-medium text-foreground">{t.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {t.gearSlug} / {t.lowerGearSlug}
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
                  <SectionEyebrow>Discovery</SectionEyebrow>
                  <h2 className="mt-1 text-lg font-semibold text-foreground">Active Gears</h2>
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
                    className={cn(
                      "rounded-2xl border border-border bg-card px-4 py-4 shadow-e1 transition-colors",
                      shellFocusRing,
                      "hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
                      Gear
                    </Badge>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{g.title}</h3>
                    {g.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{g.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      ~{g.activeThreadsApprox} active thread{g.activeThreadsApprox === 1 ? "" : "s"}{" "}
                      · <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground/80">{g.slug}</code>
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {trendingThreads.length > 0 ? (
            <section className="space-y-3">
              <div>
                <SectionEyebrow>Trending</SectionEyebrow>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Trending threads</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {viewerId
                    ? "Your Gears first, blended with global momentum — de-duplicated against “Threads in your Gears” above."
                    : "Reply- and reaction-weighted ranking with recency decay (Phase G style, global)."}
                </p>
              </div>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
                {trendingThreads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                      className={cn(
                        "block px-4 py-3 transition-colors",
                        shellFocusRing,
                        "hover:bg-muted/40"
                      )}
                    >
                      <p className="line-clamp-2 font-medium text-foreground">{t.title}</p>
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
                <SectionEyebrow>People</SectionEyebrow>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Suggested voices</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Handles with the most discussion threads and replies in the last 30 days.
                </p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {suggestedUsers.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/u/${encodeURIComponent(u.handle)}`}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-e1 transition-colors",
                        shellFocusRing,
                        "hover:border-primary/30 hover:bg-muted/30"
                      )}
                    >
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={u.avatarUrl ?? undefined} alt="" />
                        <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">
                          {(u.name ?? u.handle).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">
                          {u.name?.trim() || `@${u.handle}`}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">@{u.handle}</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
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

      <h2 className="mt-12 text-lg font-semibold text-foreground">All Gears</h2>
      <div className="mt-4 space-y-3">
        {loadError ? (
          <p
            className="rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive shadow-e1"
            role="alert"
          >
            {loadError}
          </p>
        ) : spaces.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground shadow-e1">
            No Gears are active yet. Run <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">prisma db seed</code>{" "}
            after <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">db push</code> to load taxonomy.
          </p>
        ) : (
          spaces.map((s) => (
            <Link
              key={s.id}
              href={`/discussions/${s.slug}`}
              className={cn(
                "block rounded-2xl border border-border bg-card px-4 py-4 shadow-e1 transition-colors",
                shellFocusRing,
                "hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
                Gear
              </Badge>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{s.title}</h3>
              {s.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted-foreground">
                {s.categoryCount} Lower Gear{s.categoryCount === 1 ? "" : "s"} · slug{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground/80">{s.slug}</code>
              </p>
            </Link>
          ))
        )}
      </div>

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href="/explore" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}>
          ← Carmunity feed
        </Link>
      </p>
    </div>
  );
}
