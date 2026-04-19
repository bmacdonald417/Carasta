import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { getForumSpaceBySlug, listRecentThreadsForGear } from "@/lib/forums/forum-service";
import { getSession } from "@/lib/auth";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ gearSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gearSlug } = await params;
  const res = await getForumSpaceBySlug(gearSlug);
  if (!res.ok) {
    return { title: "Discussions" };
  }
  return {
    title: res.space.title,
    description:
      res.space.description ?? `${res.space.title} — Gears and Lower Gears on Carmunity Discussions.`,
  };
}

export default async function GearPage({ params }: Props) {
  const { gearSlug } = await params;
  const res = await getForumSpaceBySlug(gearSlug);
  if (!res.ok) notFound();

  const session = await getSession();
  const viewerUserId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const viewerIsAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const { space } = res;
  const recent = await listRecentThreadsForGear({
    spaceId: space.id,
    take: 12,
    viewerUserId,
    viewerIsAdmin,
  });

  return (
    <div className="carasta-container max-w-3xl py-8">
      <nav className="text-xs text-neutral-500">
        <Link href="/discussions" className="text-primary hover:underline">
          Discussions
        </Link>
        <span className="mx-1.5 text-neutral-600">/</span>
        <span className="text-neutral-300">Gears</span>
        <span className="mx-1.5 text-neutral-600">/</span>
        <span className="text-neutral-300">{space.title}</span>
      </nav>

      <header className="mt-4 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-glass-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">Gear</p>
        <h1 className="mt-1 font-display text-2xl font-bold uppercase tracking-wider text-neutral-100">
          {space.title}
        </h1>
        {space.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{space.description}</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Explore Lower Gears inside this Gear — unified Carmunity identity on every thread.
          </p>
        )}
      </header>

      <section className="mt-8 space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Lower Gears
          </h2>
        </div>
        <ul className="space-y-2">
          {space.categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/discussions/${space.slug}/${c.slug}`}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/50 bg-card/50 px-4 py-3 transition hover:border-primary/35 hover:bg-muted/10"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-100">{c.title}</p>
                  {c.description ? (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.description}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {c.threadCount} thread{c.threadCount === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Recent across this Gear
          </h2>
        </div>
        {recent.ok && recent.threads.length === 0 ? (
          <p className="rounded-2xl border border-border/50 bg-card/40 px-4 py-6 text-sm text-muted-foreground">
            No threads yet — start one from a Lower Gear.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.ok
              ? recent.threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={discussionThreadPath(t.category.gearSlug, t.category.slug, t.id)}
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="text-primary/90">{t.category.slug}</span>
                        <span className="mx-1 text-neutral-600">·</span>
                        <AuthorHandleLink handle={t.author.handle} className="text-xs" />
                        <span className="mx-1 text-neutral-600">·</span>
                        <DiscussionReactionSummary summary={t.reactionSummary} />
                        <span className="mx-1 text-neutral-600">·</span>
                        {t.replyCount} repl{t.replyCount === 1 ? "y" : "ies"}
                      </p>
                    </Link>
                  </li>
                ))
              : null}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        <Link href="/discussions" className="text-primary hover:underline">
          ← All Gears
        </Link>
      </p>
    </div>
  );
}
