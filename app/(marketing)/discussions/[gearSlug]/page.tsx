import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { Badge } from "@/components/ui/badge";
import { getForumSpaceBySlug, listRecentThreadsForGear } from "@/lib/forums/forum-service";
import { getSession } from "@/lib/auth";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

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
      <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <Link href="/discussions" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}>
          Discussions
        </Link>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <span className="text-muted-foreground/80">Gears</span>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{space.title}</span>
      </nav>

      <header className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-e1">
        <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
          Gear
        </Badge>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{space.title}</h1>
        {space.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{space.description}</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Explore Lower Gears inside this Gear — unified Carmunity identity on every thread.
          </p>
        )}
      </header>

      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Lower Gears</h2>
        <ul className="space-y-2">
          {space.categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/discussions/${space.slug}/${c.slug}`}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 shadow-e1 transition-colors",
                  shellFocusRing,
                  "hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{c.title}</p>
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
        <h2 className="text-sm font-semibold text-foreground">Recent across this Gear</h2>
        {recent.ok && recent.threads.length === 0 ? (
          <p className="rounded-2xl border border-border bg-muted/25 px-4 py-6 text-sm text-muted-foreground shadow-e1">
            No threads yet — start one from a Lower Gear.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.ok
              ? recent.threads.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={discussionThreadPath(t.category.gearSlug, t.category.slug, t.id)}
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
                        <span className="font-medium text-primary/90">{t.category.slug}</span>
                        <span className="text-muted-foreground/60">·</span>
                        <AuthorHandleLink handle={t.author.handle} className="text-xs" />
                        <span className="text-muted-foreground/60">·</span>
                        <DiscussionReactionSummary summary={t.reactionSummary} />
                        <span className="text-muted-foreground/60">·</span>
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
        <Link href="/discussions" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}>
          ← All Gears
        </Link>
      </p>
    </div>
  );
}
