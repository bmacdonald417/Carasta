import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { Badge } from "@/components/ui/badge";
import {
  getLowerGearBySlugs,
  listThreadsForCategory,
  type DiscussionSortMode,
} from "@/lib/forums/forum-service";
import { getSession } from "@/lib/auth";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ gearSlug: string; lowerGearSlug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

function parseSort(raw: string | undefined): DiscussionSortMode {
  if (raw === "new" || raw === "top") return raw;
  return "trending";
}

function parsePage(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gearSlug, lowerGearSlug } = await params;
  const res = await getLowerGearBySlugs(gearSlug, lowerGearSlug);
  if (!res.ok) return { title: "Discussions" };
  return {
    title: `${res.category.title} — ${res.category.space.title}`,
    description:
      res.category.description ??
      `Threads in ${res.category.title} (${res.category.space.title}).`,
  };
}

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function sortLink(
  gearSlug: string,
  lowerGearSlug: string,
  mode: DiscussionSortMode,
  active: DiscussionSortMode
) {
  const params = new URLSearchParams();
  if (mode !== "trending") params.set("sort", mode);
  const qs = params.toString();
  const suffix = qs ? `?${qs}` : "";
  const isActive = mode === active;
  return (
    <Link
      href={`/discussions/${gearSlug}/${lowerGearSlug}${suffix}`}
      className={cn(
        shellFocusRing,
        isActive
          ? "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
          : "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      {mode === "trending" ? "Trending" : mode === "new" ? "New" : "Top"}
    </Link>
  );
}

export default async function LowerGearPage({ params, searchParams }: Props) {
  const { gearSlug, lowerGearSlug } = await params;
  const sp = await searchParams;
  const sort = parseSort(typeof sp.sort === "string" ? sp.sort : undefined);
  const page = parsePage(typeof sp.page === "string" ? sp.page : undefined);

  const session = await getSession();
  const viewerUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const viewerIsAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const catRes = await getLowerGearBySlugs(gearSlug, lowerGearSlug);
  if (!catRes.ok) notFound();
  const { category } = catRes;

  const threadsRes = await listThreadsForCategory({
    categoryId: category.id,
    page,
    take: 20,
    sort,
    viewerUserId,
    viewerIsAdmin,
  });
  if (!threadsRes.ok) notFound();
  const { threads, hasNextPage, totalCount } = threadsRes;
  const totalPages = Math.max(1, Math.ceil(totalCount / 20));

  return (
    <div className="carasta-container max-w-3xl py-8">
      <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <Link href="/discussions" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}>
          Discussions
        </Link>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <Link
          href={`/discussions/${category.space.slug}`}
          className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}
        >
          {category.space.title}
        </Link>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{category.title}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-e1">
        <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
          Lower Gear
        </Badge>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{category.title}</h1>
        {category.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-1 rounded-full border border-border bg-muted/30 p-1">
          {sortLink(gearSlug, lowerGearSlug, "trending", sort)}
          {sortLink(gearSlug, lowerGearSlug, "new", sort)}
          {sortLink(gearSlug, lowerGearSlug, "top", sort)}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          New = recency · Top = replies + reactions (last 90 days) · Trending = engagement with recency decay. See
          CARMUNITY_PHASE_G_MODERATION_AND_SCALE.md for formulas.
        </p>
      </header>

      <ul className="mt-8 space-y-2">
        {threads.length === 0 ? (
          <li className="rounded-2xl border border-border bg-muted/25 px-4 py-6 text-sm text-muted-foreground shadow-e1">
            No threads in this Lower Gear yet.
          </li>
        ) : (
          threads.map((t) => (
            <li key={t.id}>
              <Link
                href={discussionThreadPath(category.space.slug, category.slug, t.id)}
                className={cn(
                  "block rounded-2xl border border-border bg-card px-4 py-3 shadow-e1 transition-colors",
                  shellFocusRing,
                  "hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{t.title}</span>
                  {t.demoSeed ? (
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold uppercase tracking-wide">
                      Demo
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <AuthorHandleLink handle={t.author.handle} className="text-xs" />
                  <span className="text-muted-foreground/60">·</span>
                  <span>{formatShort(t.lastActivityAt)}</span>
                  <span className="text-muted-foreground/60">·</span>
                  <span>
                    {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}
                  </span>
                  <span className="text-muted-foreground/60">·</span>
                  <DiscussionReactionSummary summary={t.reactionSummary} />
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      {totalPages > 1 || hasNextPage ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-e1">
          <p className="text-xs">
            Page <span className="font-semibold text-primary">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {page > 1 ? (
              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  if (sort !== "trending") p.set("sort", sort);
                  p.set("page", String(page - 1));
                  const qs = p.toString();
                  return `/discussions/${gearSlug}/${lowerGearSlug}${qs ? `?${qs}` : ""}`;
                })()}
                className={cn(
                  "rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-primary transition-colors",
                  shellFocusRing,
                  "hover:border-primary/35 hover:bg-muted/40"
                )}
              >
                Previous
              </Link>
            ) : null}
            {hasNextPage ? (
              <Link
                href={(() => {
                  const p = new URLSearchParams();
                  if (sort !== "trending") p.set("sort", sort);
                  p.set("page", String(page + 1));
                  return `/discussions/${gearSlug}/${lowerGearSlug}?${p.toString()}`;
                })()}
                className={cn(
                  "rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition-colors",
                  shellFocusRing,
                  "hover:bg-primary/15"
                )}
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-10 text-sm text-muted-foreground">
        <Link
          href={`/discussions/${category.space.slug}`}
          className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}
        >
          ← Back to Gear
        </Link>
      </p>
    </div>
  );
}
