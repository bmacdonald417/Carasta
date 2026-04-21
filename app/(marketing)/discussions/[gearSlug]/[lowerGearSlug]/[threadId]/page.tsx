import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorHandleLink } from "@/components/discussions/AuthorHandleLink";
import { DemoDiscussionsBanner } from "@/components/discussions/DemoDiscussionsBanner";
import { DiscussionAuthorBadges } from "@/components/discussions/DiscussionAuthorBadges";
import { DiscussionReactionPicker } from "@/components/discussions/DiscussionReactionPicker";
import { FollowButton } from "@/app/(app)/u/[handle]/follow-button";
import { DiscussionPeerSafetyMenu } from "@/components/discussions/DiscussionPeerSafetyMenu";
import { DiscussionThreadSaveButton } from "@/components/discussions/DiscussionThreadSaveButton";
import { DiscussionReportDialog } from "@/components/discussions/DiscussionReportDialog";
import { DiscussionRichText } from "@/components/discussions/DiscussionRichText";
import { DiscussionThreadRepliesPanel } from "@/components/discussions/DiscussionThreadRepliesPanel";
import { ShareButtons } from "@/components/ui/share-buttons";
import { DiscussionAuctionContextCard } from "@/components/discussions/DiscussionAuctionContextCard";
import { getSession } from "@/lib/auth";
import { extractMentionHandles } from "@/lib/discussions/mentions";
import { prisma } from "@/lib/db";
import { getForumThreadDetail } from "@/lib/forums/forum-service";
import { touchForumThreadSubscriptionViewed } from "@/lib/forums/thread-subscriptions";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ gearSlug: string; lowerGearSlug: string; threadId: string }>;
};

function threadDescriptionSnippet(body: string, max = 180) {
  const plain = body.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { threadId } = await params;
  const detail = await getForumThreadDetail(threadId, { viewerIsAdmin: false });
  if (!detail?.ok) return { title: "Thread" };
  const { thread } = detail;
  const origin = getPublicSiteOrigin();
  const path = `/discussions/${thread.category.space.slug}/${thread.category.slug}/${thread.id}`;
  const url = `${origin}${path}`;
  const description = threadDescriptionSnippet(thread.body);
  const title = thread.title;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Carmunity by Carasta",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
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

async function resolveValidMentionHandlesForThread(args: {
  opBody: string;
  replyBodies: string[];
}): Promise<string[]> {
  const handles = new Set<string>();
  extractMentionHandles(args.opBody).forEach((h) => handles.add(h));
  for (const b of args.replyBodies) {
    extractMentionHandles(b).forEach((h) => handles.add(h));
  }
  if (handles.size === 0) return [];
  const rows = await prisma.user.findMany({
    where: { handle: { in: Array.from(handles), mode: "insensitive" } },
    select: { handle: true },
  });
  return rows.map((r) => r.handle.toLowerCase());
}

export default async function ThreadPage({ params }: Props) {
  const { gearSlug, lowerGearSlug, threadId } = await params;
  const session = await getSession();
  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const viewerIsAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const detail = await getForumThreadDetail(threadId, {
    viewerUserId: viewerId,
    viewerIsAdmin,
  });
  if (!detail?.ok) notFound();

  const { thread } = detail;
  const threadSharePath = `/discussions/${thread.category.space.slug}/${thread.category.slug}/${thread.id}`;
  if (
    thread.category.space.slug !== gearSlug ||
    thread.category.slug !== lowerGearSlug
  ) {
    notFound();
  }

  const validMentionHandles = await resolveValidMentionHandlesForThread({
    opBody: thread.body,
    replyBodies: thread.replies.map((r) => r.body),
  });

  const peerSafety =
    viewerId && viewerId !== thread.author.id
      ? await Promise.all([
          prisma.userBlock.findUnique({
            where: {
              blockerId_blockedId: { blockerId: viewerId, blockedId: thread.author.id },
            },
            select: { id: true },
          }),
          prisma.userMute.findUnique({
            where: {
              userId_mutedUserId: { userId: viewerId, mutedUserId: thread.author.id },
            },
            select: { id: true },
          }),
        ])
      : null;

  const subscriptionRow =
    viewerId
      ? await prisma.forumThreadSubscription.findUnique({
          where: {
            userId_threadId: { userId: viewerId, threadId: thread.id },
          },
          select: { createdAt: true, lastViewedAt: true },
        })
      : null;
  const threadSaved = Boolean(subscriptionRow);
  const lastActivityMs = new Date(thread.lastActivityAt).getTime();
  const savedThreadHasNew =
    subscriptionRow != null &&
    lastActivityMs > (subscriptionRow.lastViewedAt ?? subscriptionRow.createdAt).getTime();

  if (subscriptionRow && viewerId) {
    await touchForumThreadSubscriptionViewed({
      prisma,
      userId: viewerId,
      threadId: thread.id,
    });
  }

  const viewerFollowsAuthor =
    viewerId && viewerId !== thread.author.id
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: {
                followerId: viewerId,
                followingId: thread.author.id,
              },
            },
            select: { id: true },
          })
        )
      : false;

  const serializedReplies = thread.replies.map((r) => ({
    id: r.id,
    authorId: r.authorId,
    body: r.body,
    createdAt: r.createdAt,
    demoSeed: r.demoSeed,
    contentWithdrawn: r.contentWithdrawn,
    reactionSummary: r.reactionSummary,
    viewerReactionKind: r.viewerReactionKind,
    author: { handle: r.author.handle, name: r.author.name },
  }));

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

      {thread.auction ? (
        <div className="mt-4">
          <DiscussionAuctionContextCard auction={thread.auction} />
        </div>
      ) : null}

      <article className="mt-6 rounded-2xl border border-border/50 bg-card/60 p-5 shadow-glass-sm">
        <header className="space-y-4">
          <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground md:text-2xl">
            {thread.title}
          </h1>

          <div className="flex flex-col gap-3 border-b border-border/40 pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <AuthorHandleLink handle={thread.author.handle} className="text-sm" />
                {thread.author.name ? (
                  <span className="text-neutral-500">· {thread.author.name}</span>
                ) : null}
                <span className="text-neutral-500">· {formatLong(thread.createdAt)}</span>
                {viewerId && viewerId !== thread.author.id ? (
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className="text-neutral-600">·</span>
                    <FollowButton
                      targetUserId={thread.author.id}
                      initialFollowing={viewerFollowsAuthor}
                      className="h-7 border-primary/35 bg-primary/5 px-2 text-[10px] font-semibold uppercase tracking-wide text-primary hover:bg-primary/10"
                    />
                  </span>
                ) : null}
              </div>
              <DiscussionAuthorBadges badges={thread.author.badges} className="flex flex-wrap gap-2" />
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[280px]">
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {viewerId ? (
                  <DiscussionThreadSaveButton
                    threadId={thread.id}
                    initialSaved={threadSaved}
                    showNewActivityDot={savedThreadHasNew}
                  />
                ) : null}
                <ShareButtons
                  url={threadSharePath}
                  title={thread.title}
                  description={`${thread.category.space.title} · ${thread.category.title}`}
                  triggerClassName="border-primary/35 bg-primary/5 text-xs text-primary hover:bg-primary/10"
                  carmunityShareMeta={
                    viewerId ? { surface: "discussion_thread", threadId: thread.id } : undefined
                  }
                />
                {viewerId && viewerId !== thread.author.id ? (
                  <>
                    <DiscussionReportDialog
                      target="thread"
                      threadId={thread.id}
                      contentLabel={`Reporting “${thread.title.slice(0, 120)}${thread.title.length > 120 ? "…" : ""}”`}
                      variant="outline"
                      className="border-border/60"
                    />
                    {peerSafety ? (
                      <DiscussionPeerSafetyMenu
                        targetUserId={thread.author.id}
                        targetHandle={thread.author.handle}
                        initialBlocked={Boolean(peerSafety[0])}
                        initialMuted={Boolean(peerSafety[1])}
                      />
                    ) : null}
                  </>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-border/40 bg-muted/5 p-3 lg:items-end">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Reactions</p>
                <DiscussionReactionPicker
                  target="thread"
                  targetId={thread.id}
                  summary={thread.reactionSummary}
                  initialKind={thread.viewerReactionKind}
                  className="w-full justify-between lg:justify-end"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="mt-5 text-sm leading-relaxed text-foreground/90">
          <DiscussionRichText text={thread.body} validHandles={validMentionHandles} />
        </div>
      </article>

      <DiscussionThreadRepliesPanel
        threadId={thread.id}
        viewerUserId={viewerId}
        locked={thread.locked}
        replyCount={thread.replyCount}
        initialReplies={serializedReplies}
        initialNextCursor={thread.repliesNextCursor}
        validMentionHandles={validMentionHandles}
      />

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
