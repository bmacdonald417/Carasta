import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, TrendingUp, Users, Compass, ChevronRight, Hash, Flame } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { SignedOutPreviewNotice } from "@/components/guest-preview/SignedOutPreviewNotice";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discussions",
  description:
    "Browse Carmunity Discussions — gear-organized forums, trending threads, and the most active voices in the collector car community.",
};

function timeAgo(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.floor(h / 24);
  if (day < 7) return `${day}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// ── Gear card ──────────────────────────────────────────────────────────────

function GearCard({
  title,
  description,
  slug,
  threadCount,
  icon,
}: {
  title: string;
  description: string | null;
  slug: string;
  threadCount: number;
  icon?: string;
}) {
  return (
    <Link
      href={`/discussions/${slug}`}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-e1 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-e2",
        shellFocusRing
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/8 text-xl">
          {icon ?? "🔧"}
        </div>
        <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          Gear
        </Badge>
      </div>
      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{title}</h3>
      {description && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <MessageSquare className="h-3 w-3" />
        <span>{threadCount} active thread{threadCount === 1 ? "" : "s"}</span>
        <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/50 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ── Thread row ──────────────────────────────────────────────────────────────

function ThreadRow({
  title,
  gearSlug,
  lowerGearSlug,
  threadId,
  authorHandle,
  replyCount,
  lastActivityAt,
  rank,
}: {
  title: string;
  gearSlug: string;
  lowerGearSlug: string;
  threadId: string;
  authorHandle?: string;
  replyCount: number;
  lastActivityAt: Date;
  rank?: number;
}) {
  return (
    <Link
      href={discussionThreadPath(gearSlug, lowerGearSlug, threadId)}
      className={cn(
        "group flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40",
        shellFocusRing
      )}
    >
      {rank !== undefined && (
        <span className="mt-0.5 w-5 shrink-0 text-center text-xs font-bold tabular-nums text-muted-foreground/50">
          {rank}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          {authorHandle && <span>@{authorHandle}</span>}
          <span className="text-muted-foreground/40">·</span>
          <span className="font-mono text-muted-foreground/60">{gearSlug}/{lowerGearSlug}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="inline-flex items-center gap-0.5">
            <MessageSquare className="h-2.5 w-2.5" />
            {replyCount}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{timeAgo(lastActivityAt)}</span>
        </p>
      </div>
      <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground/30 transition group-hover:translate-x-0.5 group-hover:text-primary/50" />
    </Link>
  );
}

// ── GEAR icon map ────────────────────────────────────────────────────────────

const GEAR_ICONS: Record<string, string> = {
  "mechanics-corner": "🔧",
  "gear-interests": "⌚",
  "listings-auctions": "🔨",
  "jdm": "🇯🇵",
  "classics": "🏛️",
  "muscle": "💪",
  "european": "🇪🇺",
  "track-and-performance": "🏁",
  "electric": "⚡",
  "off-road": "🏔️",
  "buy-sell-trade": "💰",
  "events": "📅",
};

export default async function DiscussionsPage() {
  const session = await getSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;

  const [
    recommendedGears,
    followedThreads,
    onboardingState,
  ] = await Promise.all([
    listRecommendedGears({ take: 6 }).catch(() => []),
    listFollowedThreadsForViewer(viewerId, { take: 8 }).catch(() => []),
    viewerId ? getCarmunityOnboardingState(viewerId) : Promise.resolve(null),
  ]);

  const gearSlugs = (onboardingState?.prefs.gearSlugs ?? []).filter(Boolean);

  const [suggestedUsers, interestThreads, trendingPool] = await Promise.all([
    viewerId
      ? listSuggestedDiscussionUsersForViewer({ viewerId, take: 8 }).catch(() => [])
      : listSuggestedDiscussionUsers({ take: 8, excludeUserId: viewerId }).catch(() => []),
    viewerId && gearSlugs.length > 0
      ? listThreadsForPreferredGears({ gearSlugs, take: 8 }).catch(() => [])
      : Promise.resolve([]),
    viewerId
      ? listDiscoveryThreadMixForViewer(viewerId, { take: 12 }).catch(() => [])
      : listTrendingThreadsGlobal({ take: 10 }).catch(() => []),
  ]);

  const interestIds = new Set(interestThreads.map((t) => t.id));
  const trendingThreads =
    viewerId && interestThreads.length > 0
      ? trendingPool.filter((t) => !interestIds.has(t.id))
      : trendingPool;

  let spaces: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    categoryCount: number;
  }> = [];
  try {
    const result = await listForumSpaces();
    if (result.ok) spaces = result.spaces;
  } catch { /* skip */ }

  const joinHref = "/auth/sign-up?callbackUrl=%2Fdiscussions";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[hsl(var(--navy))] py-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 60%, hsl(var(--primary)/0.22) 0%, transparent 50%), radial-gradient(ellipse at 85% 20%, hsl(var(--primary)/0.14) 0%, transparent 45%)",
          }}
        />
        <div className="carasta-container relative max-w-4xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary/80">
                Carmunity
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Discussions
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/65">
                Gear-organized forums built around collector cars. Real owners, real expertise — one
                Carmunity identity across every thread.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {!viewerId && (
                  <Link
                    href={joinHref}
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    Join to post
                  </Link>
                )}
                <Link
                  href="/discussions/listings-auctions"
                  className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/8"
                >
                  Browse all gears
                </Link>
              </div>
            </div>
            {/* Stats strip */}
            <div className="flex flex-wrap gap-6 sm:flex-col sm:items-end sm:gap-2 sm:text-right">
              {[
                { label: "Active Gears", value: spaces.length || "—" },
                { label: "Trending threads", value: trendingThreads.length || "—" },
                { label: "Community voices", value: suggestedUsers.length > 0 ? `${suggestedUsers.length}+` : "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white tabular-nums">{value}</p>
                  <p className="text-[11px] uppercase tracking-wide text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="carasta-container max-w-4xl py-8">
        {!viewerId && (
          <SignedOutPreviewNotice
            nextUrl="/discussions"
            className="mb-8"
            description="You're previewing Discussions. Join free to reply, react, save threads, and follow voices."
          />
        )}

        {/* ── 2-column layout on desktop ─────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">

          {/* ── Left: main content ─────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-10">

            {/* Followed threads */}
            {followedThreads.length > 0 && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground">From people you follow</h2>
                  </div>
                  <Link href="/explore?tab=following" className={cn("text-xs font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
                    See all
                  </Link>
                </div>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
                  {followedThreads.map((t) => (
                    <ThreadRow
                      key={t.id}
                      title={t.title}
                      gearSlug={t.gearSlug}
                      lowerGearSlug={t.lowerGearSlug}
                      threadId={t.id}
                      authorHandle={t.authorHandle}
                      replyCount={0}
                      lastActivityAt={new Date()}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Interest threads */}
            {interestThreads.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">In your Gears</h2>
                </div>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
                  {interestThreads.map((t) => (
                    <ThreadRow
                      key={t.id}
                      title={t.title}
                      gearSlug={t.gearSlug}
                      lowerGearSlug={t.lowerGearSlug}
                      threadId={t.id}
                      replyCount={0}
                      lastActivityAt={new Date()}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Trending threads */}
            {trendingThreads.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <h2 className="text-base font-bold text-foreground">Trending</h2>
                </div>
                <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-e1">
                  {trendingThreads.map((t, i) => (
                    <ThreadRow
                      key={t.id}
                      title={t.title}
                      gearSlug={t.gearSlug}
                      lowerGearSlug={t.lowerGearSlug}
                      threadId={t.id}
                      replyCount={t.replyCount}
                      lastActivityAt={t.lastActivityAt}
                      rank={i + 1}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* All Gears */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                <h2 className="text-base font-bold text-foreground">All Gears</h2>
              </div>
              {spaces.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-8 text-center">
                  <p className="text-sm font-semibold text-foreground">No Gears loaded yet</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Run <code className="rounded bg-muted px-1 py-0.5 font-mono">prisma db seed</code> to populate the taxonomy.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {spaces.map((s) => (
                    <GearCard
                      key={s.id}
                      title={s.title}
                      description={s.description}
                      slug={s.slug}
                      threadCount={s.categoryCount}
                      icon={GEAR_ICONS[s.slug]}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Active gears discovery */}
            {recommendedGears.length > 0 && (
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-bold text-foreground">Most active right now</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {recommendedGears.map((g) => (
                    <GearCard
                      key={g.id}
                      title={g.title}
                      description={g.description ?? null}
                      slug={g.slug}
                      threadCount={g.activeThreadsApprox}
                      icon={GEAR_ICONS[g.slug]}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right: sidebar ─────────────────────────────── */}
          <div className="w-full shrink-0 space-y-6 lg:w-72 xl:w-80">

            {/* Join CTA (guests) */}
            {!viewerId && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-e1">
                <h3 className="text-sm font-bold text-foreground">Join the community</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Reply to threads, react to posts, save discussions, and follow voices you care about — all free.
                </p>
                <Link
                  href={joinHref}
                  className="mt-4 block rounded-full bg-primary px-4 py-2.5 text-center text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Join Carmunity free
                </Link>
                <Link href="/auth/sign-in" className="mt-2 block text-center text-xs font-medium text-muted-foreground hover:text-primary">
                  Already a member? Sign in
                </Link>
              </div>
            )}

            {/* Suggested voices */}
            {suggestedUsers.length > 0 && (
              <div className="rounded-2xl border border-border bg-card shadow-e1">
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-bold text-foreground">Active voices</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Most active in the last 30 days</p>
                </div>
                <ul className="divide-y divide-border/50">
                  {suggestedUsers.slice(0, 6).map((u) => (
                    <li key={u.id}>
                      <Link
                        href={`/u/${encodeURIComponent(u.handle)}`}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                          shellFocusRing
                        )}
                      >
                        <Avatar className="h-9 w-9 shrink-0 border border-border/60">
                          <AvatarImage src={u.avatarUrl ?? undefined} />
                          <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                            {(u.name ?? u.handle).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {u.name?.trim() || `@${u.handle}`}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">@{u.handle}</p>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold tabular-nums text-primary/70">
                          {u.activityScore}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {viewerId && (
                  <div className="border-t border-border/50 px-4 py-3">
                    <Link href="/explore" className={cn("text-xs font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
                      Find more people →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-card shadow-e1">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Quick links</h3>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { href: "/explore", label: "Carmunity feed", icon: "🌊" },
                  { href: "/auctions", label: "Live auctions", icon: "🔨" },
                  { href: "/resources/community-guidelines", href2: "/community-guidelines", label: "Community guidelines", icon: "📋" },
                  { href: "/resources/faq", label: "FAQ & help", icon: "❓" },
                ].map(({ href, label, icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground",
                      shellFocusRing
                    )}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/40" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Rules snippet */}
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground mb-2">Community rules</p>
              <ul className="space-y-1.5">
                {[
                  "Be respectful — same Carmunity identity everywhere",
                  "Stay on-topic for the Gear you're posting in",
                  "No spam, no self-promotion without context",
                  "Report threads that break community guidelines",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-primary">·</span>
                    {r}
                  </li>
                ))}
              </ul>
              <Link href="/community-guidelines" className="mt-3 block font-medium text-primary hover:underline">
                Full guidelines →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
