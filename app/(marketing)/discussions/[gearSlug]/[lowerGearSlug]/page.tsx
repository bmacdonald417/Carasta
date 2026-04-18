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
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ gearSlug: string; lowerGearSlug: string }>;
  searchParams: Promise<{ sort?: string }>;
};

function parseSort(raw: string | undefined): DiscussionSortMode {
  if (raw === "new" || raw === "top") return raw;
  return "trending";
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
  const qs = mode === "trending" ? "" : `?sort=${mode}`;
  const isActive = mode === active;
  return (
    <Link
      href={`/discussions/${gearSlug}/${lowerGearSlug}${qs}`}
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

  const catRes = await getLowerGearBySlugs(gearSlug, lowerGearSlug);
  if (!catRes.ok) notFound();
  const { category } = catRes;

  const threadsRes = await listThreadsForCategory({
    categoryId: category.id,
    take: 30,
    sort,
  });
  if (!threadsRes.ok) notFound();
  const { threads } = threadsRes;

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
          Trending = recent activity · New = created date · Top = reply count (placeholder ranking).
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

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href={`/discussions/${category.space.slug}`} className="text-primary hover:underline">
          ← Back to Gear
        </Link>
      </p>
    </div>
  );
}
