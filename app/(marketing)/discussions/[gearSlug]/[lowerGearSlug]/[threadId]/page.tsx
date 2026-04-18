import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DemoDiscussionsBanner } from "@/components/discussions/DemoDiscussionsBanner";
import { DiscussionAuthorBadges } from "@/components/discussions/DiscussionAuthorBadges";
import { DiscussionReactionSummary } from "@/components/discussions/DiscussionReactionSummary";
import { DiscussionThreadReplyComposer } from "@/components/discussions/DiscussionThreadReplyComposer";
import { getForumThreadDetail } from "@/lib/forums/forum-service";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ gearSlug: string; lowerGearSlug: string; threadId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threadId } = await params;
  const detail = await getForumThreadDetail(threadId);
  if (!detail?.ok) return { title: "Thread" };
  return {
    title: detail.thread.title,
    description: detail.thread.body.slice(0, 160),
  };
}

function formatLong(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function ThreadPage({ params }: Props) {
  const { gearSlug, lowerGearSlug, threadId } = await params;
  const detail = await getForumThreadDetail(threadId);
  if (!detail?.ok) notFound();

  const { thread } = detail;
  if (
    thread.category.space.slug !== gearSlug ||
    thread.category.slug !== lowerGearSlug
  ) {
    notFound();
  }

  return (
    <div className="carasta-container max-w-3xl py-8">
      <nav className="text-xs text-neutral-500">
        <Link href="/discussions" className="text-primary hover:underline">
          Discussions
        </Link>
        <span className="mx-1.5 text-neutral-600">/</span>
        <Link
          href={`/discussions/${thread.category.space.slug}`}
          className="text-primary hover:underline"
        >
          {thread.category.space.title}
        </Link>
        <span className="mx-1.5 text-neutral-600">/</span>
        <Link
          href={`/discussions/${thread.category.space.slug}/${thread.category.slug}`}
          className="text-primary hover:underline"
        >
          {thread.category.title}
        </Link>
      </nav>

      {thread.demoSeed ? <DemoDiscussionsBanner className="mt-4" /> : null}

      <article className="mt-6 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-glass-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-bold uppercase tracking-wide text-neutral-100 md:text-2xl">
              {thread.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <AuthorHandleLink handle={thread.author.handle} className="text-sm" />
              {thread.author.name ? (
                <span className="text-neutral-500">· {thread.author.name}</span>
              ) : null}
              <span className="text-neutral-500">· {formatLong(thread.createdAt)}</span>
            </div>
            <DiscussionAuthorBadges badges={thread.author.badges} className="mt-2" />
          </div>
          <div className="shrink-0 text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Reactions</p>
            <DiscussionReactionSummary summary={thread.reactionSummary} compact={false} />
          </div>
        </div>
        <div className="mt-5 whitespace-pre-wrap border-t border-border/40 pt-5 text-sm leading-relaxed text-foreground/90">
          {thread.body}
        </div>
      </article>

      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Replies ({thread.replyCount})
          </h2>
        </div>
        <ul className="space-y-3">
          {thread.replies.length === 0 ? (
            <li className="text-sm text-muted-foreground">No replies yet.</li>
          ) : (
            thread.replies.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-border/50 bg-card/45 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    <AuthorHandleLink handle={r.author.handle} className="text-xs" />
                    {r.author.name ? (
                      <span className="text-neutral-500"> · {r.author.name}</span>
                    ) : null}
                    <span className="text-neutral-500"> · {formatLong(r.createdAt)}</span>
                    {r.demoSeed ? (
                      <span className="ml-2 rounded border border-amber-500/35 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-200">
                        Demo
                      </span>
                    ) : null}
                  </p>
                  <DiscussionReactionSummary summary={r.reactionSummary} />
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {r.body}
                </p>
              </li>
            ))
          )}
        </ul>

        <DiscussionThreadReplyComposer threadId={thread.id} locked={thread.locked} />
      </section>

      <p className="mt-10 text-sm text-muted-foreground">
        <Link
          href={`/discussions/${thread.category.space.slug}/${thread.category.slug}`}
          className="text-primary hover:underline"
        >
          ← Back to {thread.category.title}
        </Link>
      </p>
    </div>
  );
}
