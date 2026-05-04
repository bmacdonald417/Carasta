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
import { ThreadVoteButton } from "@/components/discussions/ThreadVoteButton";
import { ShareButtons } from "@/components/ui/share-buttons";
import { DiscussionAuctionContextCard } from "@/components/discussions/DiscussionAuctionContextCard";
import { getSession } from "@/lib/auth";
import { extractMentionHandles } from "@/lib/discussions/mentions";
import { prisma } from "@/lib/db";
import { getForumThreadDetail } from "@/lib/forums/forum-service";
import { touchForumThreadSubscriptionViewed } from "@/lib/forums/thread-subscriptions";
import { getPublicSiteOrigin } from "@/lib/marketing/site-origin";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { SignedOutPreviewNotice } from "@/components/guest-preview/SignedOutPreviewNotice";
import { PreviewMeter } from "@/components/guest-preview/PreviewMeter";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ gearSlug: string; lowerGearSlug: string; threadId: string }>;
};

function threadDescriptionSnippet(body: string, max = 180) {
  const plain = body.replace(/\s+/g, " ").trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1)}\u2026`;
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
    openGraph: { title, description, url, siteName: "Carmunity by Carasta", type: "article" },
    twitter: { card: "summary_large_image", title, description },
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
  for (const b of args.replyBodies) extractMentionHandles(b).forEach((h) => handles.add(h));
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

  const detail = await getForumThreadDetail(threadId, { viewerUserId: viewerId, viewerIsAdmin });
  if (!detail?.ok) notFound();
  const { thread } = detail;

  const threadSharePath = `/discussions/${thread.category.space.slug}/${thread.category.slug}/${thread.id}`;
  if (thread.category.space.slug !== gearSlug || thread.category.slug !== lowerGearSlug) notFound();

  const validMentionHandles = await resolveValidMentionHandlesForThread({
    opBody: thread.body,
    replyBodies: thread.replies.map((r) => r.body),
  });

  const peerSafety =
    viewerId && viewerId !== thread.author.id
      ? await Promise.all([
          prisma.userBlock.findUnique({
            where: { blockerId_blockedId: { blockerId: viewerId, blockedId: thread.author.id } },
            select: { id: true },
          }),
          prisma.userMute.findUnique({
            where: { userId_mutedUserId: { userId: viewerId, mutedUserId: thread.author.id } },
            select: { id: true },
          }),
        ])
      : null;

  const subscriptionRow = viewerId
    ? await prisma.forumThreadSubscription.findUnique({
        where: { userId_threadId: { userId: viewerId, threadId: thread.id } },
        select: { createdAt: true, lastViewedAt: true },
      })
    : null;

  const threadSaved = Boolean(subscriptionRow);
  const lastActivityMs = new Date(thread.lastActivityAt).getTime();
  const savedThreadHasNew =
    subscriptionRow != null &&
    lastActivityMs > (subscriptionRow.lastViewedAt ?? subscriptionRow.createdAt).getTime();

  if (subscriptionRow && viewerId) {
    await touchForumThreadSubscriptionViewed({ prisma, userId: viewerId, threadId: thread.id });
  }

  const viewerFollowsAuthor =
    viewerId && viewerId !== thread.author.id
      ? Boolean(
          await prisma.follow.findUnique({
            where: {
              followerId_followingId: { followerId: viewerId, followingId: thread.author.id },
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

  const upCount = thread.reactionSummary?.byKind?.LIKE ?? 0;
  const downCount = thread.reactionSummary?.byKind?.DISLIKE ?? 0;

  return (
    <div className="carasta-container max-w-3xl py-8">
      {!viewerId ? (
        <>
          <SignedOutPreviewNotice
            nextUrl={threadSharePath}
            description="You're viewing a read-only preview. Join free to react, reply, save threads, and follow voices."
          />
          <PreviewMeter surface="thread_detail" />
        </>
      ) : null}

      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
        <Link href="/discussions" className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          Discussions
        </Link>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <Link href={`/discussions/${thread.category.space.slug}`} className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          {thread.category.space.title}
        </Link>
        <span aria-hidden className="text-muted-foreground/40">/</span>
        <Link href={`/discussions/${thread.category.space.slug}/${thread.category.slug}`} className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}>
          {thread.category.title}
        </Link>
      </nav>

      {thread.demoSeed ? <DemoDiscussionsBanner className="mt-4" /> : null}

      {thread.auction ? (
        <div className="mt-4">
          <DiscussionAuctionContextCard auction={thread.auction} />
        </div>
      ) : null}

      {/* Main thread article — Reddit layout */}
      <article className="mt-5 rounded-2xl border border-border bg-card shadow-e1 overflow-hidden">
        <div className="flex">
          {/* Desktop vote column */}
          <div className="hidden sm:flex w-12 shrink-0 flex-col items-center border-r border-border bg-muted/20 px-1 py-5">
            <ThreadVoteButton threadId={thread.id} initialUpCount={upCount} initialDownCount={downCount} />
          </div>

          {/* Thread content */}
          <div className="min-w-0 flex-1 p-5">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mb-3">
              <span className="font-medium text-primary/80 text-[11px] uppercase tracking-wide">
                {thread.category.slug}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span>Posted by <AuthorHandleLink handle={thread.author.handle} className="text-xs" /></span>
              <span className="text-muted-foreground/40">·</span>
              <span>{formatLong(thread.createdAt)}</span>
              {viewerId !== thread.author.id ? (
                <FollowButton
                  targetUserId={thread.author.id}
                  initialFollowing={viewerFollowsAuthor}
                  className="h-6 border-border bg-muted/40 px-2 text-[10px] font-semibold uppercase tracking-wide text-foreground hover:bg-muted/60"
                />
              ) : null}
              <DiscussionAuthorBadges badges={thread.author.badges} className="flex flex-wrap gap-1.5 ml-0.5" />
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl mb-4">
              {thread.title}
            </h1>

            {/* Body */}
            <div className="text-sm leading-relaxed text-foreground">
              <DiscussionRichText text={thread.body} validHandles={validMentionHandles} />
            </div>

            {/* Bottom action bar */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-3">
              {/* Mobile vote */}
              <div className="flex sm:hidden">
                <ThreadVoteButton threadId={thread.id} initialUpCount={upCount} initialDownCount={downCount} compact />
              </div>

              <DiscussionReactionPicker
                target="thread"
                targetId={thread.id}
                summary={thread.reactionSummary}
                initialKind={thread.viewerReactionKind}
              />

              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                <DiscussionThreadSaveButton
                  threadId={thread.id}
                  initialSaved={threadSaved}
                  showNewActivityDot={savedThreadHasNew}
                />
                <ShareButtons
                  url={threadSharePath}
                  title={thread.title}
                  description={`${thread.category.space.title} \u00b7 ${thread.category.title}`}
                  triggerClassName="border-border bg-muted/40 text-xs text-foreground hover:bg-muted/60"
                  carmunityShareMeta={viewerId ? { surface: "discussion_thread", threadId: thread.id } : undefined}
                />
                {viewerId && viewerId !== thread.author.id ? (
                  <>
                    <DiscussionReportDialog
                      target="thread"
                      threadId={thread.id}
                      contentLabel={`Reporting "${thread.title.slice(0, 120)}${thread.title.length > 120 ? "\u2026" : ""}"`}
                      variant="outline"
                      className="border-border"
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
            </div>
          </div>
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

      <p className="mt-10 text-sm">
        <Link
          href={`/discussions/${thread.category.space.slug}/${thread.category.slug}`}
          className={cn("font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}
        >
          {"\u2190"} Back to {thread.category.title}
        </Link>
      </p>
    </div>
  );
}
