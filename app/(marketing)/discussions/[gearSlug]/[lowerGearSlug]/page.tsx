import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import {
  getLowerGearBySlugs,
  listThreadsForCategory,
  type DiscussionSortMode,
} from "@/lib/forums/forum-service";
import { getSession } from "@/lib/auth";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";

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
      className={
        isActive
          ? "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
          : "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground hover:text-primary"
      }
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
      <nav className="text-xs text-neutral-500">
        <Link href="/discussions" className="text-primary hover:underline">
          Discussions
        </Link>
        <span className="mx-1.5 text-neutral-600">/</span>
        <Link href={`/discussions/${category.space.slug}`} className="text-primary hover:underline">
          {category.space.title}
        </Link>
        <span className="mx-1.5 text-neutral-600">/</span>
        <span className="text-neutral-300">{category.title}</span>
      </nav>

      <header className="mt-4 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-glass-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Lower Gear</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
          {category.title}
        </h1>
        {category.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2 rounded-full border border-border/40 bg-background/40 p-1">
          {sortLink(gearSlug, lowerGearSlug, "trending", sort)}
          {sortLink(gearSlug, lowerGearSlug, "new", sort)}
          {sortLink(gearSlug, lowerGearSlug, "top", sort)}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          New = recency · Top = replies + reactions (last 90 days) · Trending = engagement with recency decay. See
          CARMUNITY_PHASE_G_MODERATION_AND_SCALE.md for formulas.
        </p>
      </header>

      <ul className="mt-8 space-y-2">
        {threads.length === 0 ? (
          <li className="rounded-2xl border border-border/50 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
            No threads in this Lower Gear yet.
          </li>
        ) : (
          threads.map((t) => (
            <li key={t.id}>
              <Link
                href={discussionThreadPath(category.space.slug, category.slug, t.id)}
                className="block rounded-2xl border border-border/50 bg-card/40 px-4 py-3 transition hover:border-primary/35 hover:bg-muted/10"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-neutral-100">{t.title}</span>
                  {t.demoSeed ? (
                    <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      Demo
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <AuthorHandleLink handle={t.author.handle} className="text-xs" />
                  <span className="text-neutral-600">·</span>
                  <span>{formatShort(t.lastActivityAt)}</span>
                  <span className="text-neutral-600">·</span>
                  <span>
                    {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}
                  </span>
                  <span className="text-neutral-600">·</span>
                  <DiscussionReactionSummary summary={t.reactionSummary} />
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      {totalPages > 1 || hasNextPage ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-card/35 px-4 py-3 text-sm text-muted-foreground">
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
                className="rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:border-primary/40"
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
                className="rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/15"
              >
                Next
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href={`/discussions/${category.space.slug}`} className="text-primary hover:underline">
          ← Back to Gear
        </Link>
      </p>
    </div>
  );
}
