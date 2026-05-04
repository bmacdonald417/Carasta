import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, TrendingUp, Clock, ChevronUp } from "lucide-react";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { NewThreadComposer } from "@/components/discussions/NewThreadComposer";
import { PageHeader } from "@/components/ui/page-header";
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

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function SortLink({
  gearSlug,
  lowerGearSlug,
  mode,
  active,
  icon: Icon,
  label,
}: {
  gearSlug: string;
  lowerGearSlug: string;
  mode: DiscussionSortMode;
  active: DiscussionSortMode;
  icon: React.ElementType;
  label: string;
}) {
  const params = new URLSearchParams();
  if (mode !== "trending") params.set("sort", mode);
  const qs = params.toString();
  const href = `/discussions/${gearSlug}/${lowerGearSlug}${qs ? `?${qs}` : ""}`;
  const isActive = mode === active;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
        shellFocusRing,
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border text-muted-foreground hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
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
    take: 25,
    sort,
    viewerUserId,
    viewerIsAdmin,
  });
  if (!threadsRes.ok) notFound();
  const { threads, hasNextPage, totalCount } = threadsRes;
  const totalPages = Math.max(1, Math.ceil(totalCount / 25));

  return (
    <div className="carasta-container max-w-3xl py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <Link href="/discussions" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          Discussions
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/discussions/${category.space.slug}`} className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          {category.space.title}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{category.title}</span>
      </nav>

      {/* Community header card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-e1">
        <div className="bg-gradient-to-r from-primary/10 to-accent/60 px-5 py-4">
          <PageHeader
            eyebrow={`r/${category.slug}`}
            title={category.title}
            subtitle={category.description ?? `Discussions in ${category.title} · ${category.space.title}`}
            border={false}
            className="mb-0"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card/60 px-5 py-2.5">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold tabular-nums text-foreground">{totalCount}</span>{" "}
            thread{totalCount === 1 ? "" : "s"} total
          </p>
          <div className="flex flex-wrap gap-1.5">
            <SortLink gearSlug={gearSlug} lowerGearSlug={lowerGearSlug} mode="trending" active={sort} icon={TrendingUp} label="Hot" />
            <SortLink gearSlug={gearSlug} lowerGearSlug={lowerGearSlug} mode="new" active={sort} icon={Clock} label="New" />
            <SortLink gearSlug={gearSlug} lowerGearSlug={lowerGearSlug} mode="top" active={sort} icon={ChevronUp} label="Top" />
          </div>
        </div>
      </div>

      {/* New thread composer */}
      <NewThreadComposer
        categoryId={category.id}
        gearSlug={gearSlug}
        lowerGearSlug={lowerGearSlug}
        className="mb-5"
      />

      {/* Thread list */}
      <div className="space-y-2">
        {threads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center shadow-e1">
            <p className="text-base font-semibold text-foreground">No threads yet</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Be the first to start a conversation in {category.title}.
            </p>
          </div>
        ) : (
          threads.map((t) => (
            <div
              key={t.id}
              className="flex gap-0 overflow-hidden rounded-xl border border-border bg-card shadow-e1 transition-colors hover:border-primary/25"
            >
              {/* Vote column — placeholder (votes wired client-side on thread detail page) */}
              <div className="flex w-10 shrink-0 flex-col items-center gap-0.5 border-r border-border bg-muted/20 px-1 py-3">
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {t.reactionSummary?.total ?? 0}
                </span>
              </div>

              {/* Main content */}
              <Link
                href={discussionThreadPath(category.space.slug, category.slug, t.id)}
                className={cn("min-w-0 flex-1 px-3 py-2.5 block", shellFocusRing)}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground leading-snug hover:text-primary transition-colors">
                    {t.title}
                  </p>
                  {t.demoSeed && (
                    <span className="shrink-0 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Demo
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                  <span>
                    by <AuthorHandleLink handle={t.author.handle} className="text-[11px] font-medium" />
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span>{timeAgo(t.lastActivityAt)}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {t.replyCount} {t.replyCount === 1 ? "comment" : "comments"}
                  </span>
                  {(t.reactionSummary?.total ?? 0) > 0 && (
                    <>
                      <span className="text-muted-foreground/40">·</span>
                      <DiscussionReactionSummary summary={t.reactionSummary} />
                    </>
                  )}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 || hasNextPage ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-e1">
          <p className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-primary">{page}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {page > 1 && (
              <Link
                href={`/discussions/${gearSlug}/${lowerGearSlug}?${(() => {
                  const p = new URLSearchParams();
                  if (sort !== "trending") p.set("sort", sort);
                  p.set("page", String(page - 1));
                  return p.toString();
                })()}`}
                className={cn("rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-muted/40", shellFocusRing)}
              >
                ← Previous
              </Link>
            )}
            {hasNextPage && (
              <Link
                href={`/discussions/${gearSlug}/${lowerGearSlug}?${(() => {
                  const p = new URLSearchParams();
                  if (sort !== "trending") p.set("sort", sort);
                  p.set("page", String(page + 1));
                  return p.toString();
                })()}`}
                className={cn("rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15", shellFocusRing)}
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      ) : null}

      <p className="mt-8 text-sm">
        <Link href={`/discussions/${category.space.slug}`} className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          ← Back to {category.space.title}
        </Link>
      </p>
    </div>
  );
}
