"use client";

import type { DiscussionReactionKind } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

import { FeedPostInlineComment } from "@/components/carmunity/FeedPostInlineComment";
import { PostReactionPicker } from "@/components/carmunity/PostReactionPicker";
import { CarmunityOnboardingDialog } from "@/components/carmunity/CarmunityOnboardingDialog";
import { DiscussedAuctionsStrip } from "@/components/explore/DiscussedAuctionsStrip";
import { FeedEmptyState } from "@/components/carmunity/FeedEmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShareButtons } from "@/components/ui/share-buttons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import type { OnboardingPack } from "@/lib/carmunity/onboarding-service";
import type { DiscussedLiveAuctionRow } from "@/lib/forums/auction-discussion";
import type { DiscussionReactionTotals } from "@/lib/forums/forum-service";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";
import { CreatePostForm } from "./create-post-form";

type Post = {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
  liked?: boolean;
  reactionSummary: DiscussionReactionTotals;
  viewerReactionKind: DiscussionReactionKind | null;
};

function applyViewerReactionChange(
  summary: DiscussionReactionTotals,
  prevKind: DiscussionReactionKind | null,
  nextKind: DiscussionReactionKind | null
): DiscussionReactionTotals {
  const byKind = { ...summary.byKind } as Partial<Record<DiscussionReactionKind, number>>;
  let total = summary.total;
  if (prevKind) {
    const cur = (byKind[prevKind] ?? 0) - 1;
    if (cur <= 0) delete byKind[prevKind];
    else byKind[prevKind] = cur;
    total -= 1;
  }
  if (nextKind) {
    byKind[nextKind] = (byKind[nextKind] ?? 0) + 1;
    total += 1;
  }
  return { total, byKind };
}

function normalizeFeedPost(raw: Record<string, unknown>): Post {
  const p = raw as unknown as Post;
  const likes = p._count?.likes ?? 0;
  const summary =
    p.reactionSummary ??
    ({
      total: likes,
      byKind: likes > 0 ? { LIKE: likes } : {},
    } satisfies DiscussionReactionTotals);
  const viewerReactionKind =
    p.viewerReactionKind ?? (p.liked ? ("LIKE" as const) : null);
  return {
    ...p,
    reactionSummary: summary,
    viewerReactionKind,
    liked: viewerReactionKind === "LIKE",
  };
}

type FollowingThreadPayload = {
  id: string;
  title: string;
  snippet: string;
  createdAt: string;
  replyCount: number;
  reactionCount: number;
  gearSlug: string;
  lowerGearSlug: string;
  lowerGearTitle: string;
  gearTitle: string;
  href: string;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

type FollowingReplyPayload = {
  id: string;
  snippet: string;
  createdAt: string;
  threadId: string;
  threadTitle: string;
  gearSlug: string;
  lowerGearSlug: string;
  href: string;
  author: {
    id: string;
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
};

type FollowingFeedItem =
  | { type: "post"; sortAt: string; post: Post }
  | { type: "thread"; sortAt: string; thread: FollowingThreadPayload }
  | { type: "reply"; sortAt: string; reply: FollowingReplyPayload };

function fireCarmunityClientEvent(type: string, meta?: Record<string, unknown>) {
  void fetch("/api/carmunity/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, meta }),
    keepalive: true,
  });
}

export type TrendingDiscussionThreadLite = {
  id: string;
  title: string;
  gearSlug: string;
  lowerGearSlug: string;
};

function formatPostTime(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60_000) return "Just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function CommunityFeed({
  tab: initialTab,
  currentUserId,
  trendingDiscussionThreads = [],
  discussedAuctions = [],
  needsCarmunityOnboarding = false,
  onboardingPack = null,
}: {
  tab: string;
  currentUserId: string | null;
  /** Shown above the feed tabs — reuses Phase I discovery on the server. */
  trendingDiscussionThreads?: TrendingDiscussionThreadLite[];
  /** Phase M: LIVE auctions with linked discussion (real counts). */
  discussedAuctions?: DiscussedLiveAuctionRow[];
  needsCarmunityOnboarding?: boolean;
  onboardingPack?: OnboardingPack | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [followingItems, setFollowingItems] = useState<FollowingFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingOpen, setOnboardingOpen] = useState(
    Boolean(needsCarmunityOnboarding && onboardingPack)
  );

  useEffect(() => {
    setOnboardingOpen(Boolean(needsCarmunityOnboarding && onboardingPack));
  }, [needsCarmunityOnboarding, onboardingPack]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      if (tab === "following") {
        if (!currentUserId) {
          if (!cancelled) {
            setFollowingItems([]);
            setLoading(false);
          }
          return;
        }
        const res = await fetch("/api/carmunity/feed?mode=following");
        if (cancelled) return;
        if (!res.ok) {
          setFollowingItems([]);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { items?: FollowingFeedItem[] };
        const rawItems = Array.isArray(data.items) ? data.items : [];
        setFollowingItems(
          rawItems.map((it) =>
            it.type === "post"
              ? {
                  ...it,
                  post: normalizeFeedPost(it.post as unknown as Record<string, unknown>),
                }
              : it
          )
        );
        setLoading(false);
        return;
      }

      const res = await fetch(
        `/api/explore/feed?tab=${tab}${currentUserId ? `&userId=${currentUserId}` : ""}`
      );
      if (cancelled) return;
      if (!res.ok) {
        setTrendingPosts([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const rawPosts = (data.posts ?? []) as Record<string, unknown>[];
      setTrendingPosts(rawPosts.map((p) => normalizeFeedPost(p)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, currentUserId]);

  const patchPost = useCallback((postId: string, fn: (p: Post) => Post) => {
    setTrendingPosts((prev) => prev.map((p) => (p.id === postId ? fn(p) : p)));
    setFollowingItems((prev) =>
      prev.map((item) => {
        if (item.type !== "post" || item.post.id !== postId) return item;
        const asPost = item.post as unknown as Post;
        return { ...item, post: fn(asPost) as (typeof item)["post"] };
      })
    );
  }, []);

  function onPostCreated() {
    router.refresh();
    setLoading(true);
    void (async () => {
      if (tab === "following" && currentUserId) {
        const res = await fetch("/api/carmunity/feed?mode=following");
        if (!res.ok) {
          setFollowingItems([]);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as { items?: FollowingFeedItem[] };
        const rawItems = Array.isArray(data.items) ? data.items : [];
        setFollowingItems(
          rawItems.map((it) =>
            it.type === "post"
              ? {
                  ...it,
                  post: normalizeFeedPost(it.post as unknown as Record<string, unknown>),
                }
              : it
          )
        );
        setLoading(false);
        return;
      }
      const res = await fetch(
        `/api/explore/feed?tab=${tab}${currentUserId ? `&userId=${currentUserId}` : ""}`
      );
      if (!res.ok) {
        setTrendingPosts([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      const rawPosts = (data.posts ?? []) as Record<string, unknown>[];
      setTrendingPosts(rawPosts.map((p) => normalizeFeedPost(p)));
      setLoading(false);
    })();
  }

  return (
    <div className="mt-8">
      <DiscussedAuctionsStrip items={discussedAuctions} />
      {trendingDiscussionThreads.length > 0 ? (
        <section className="mb-8 space-y-3 rounded-2xl border border-border bg-card p-4 shadow-e1 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-primary">From discussions</p>
              <h2 className="mt-1 text-base font-semibold text-foreground">Trending threads</h2>
            </div>
            <Link
              href="/discussions"
              className={cn("text-xs font-medium text-primary hover:underline", shellFocusRing, "rounded-md")}
            >
              Browse all
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {trendingDiscussionThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className={cn(
                    "block py-3 text-sm text-foreground transition-colors",
                    shellFocusRing,
                    "-mx-1 rounded-lg px-1 hover:bg-muted/50 hover:text-primary"
                  )}
                  onClick={() => {
                    if (currentUserId) {
                      fireCarmunityClientEvent("thread_open_feed", {
                        threadId: t.id,
                        surface: "explore_trending_strip",
                      });
                    }
                  }}
                >
                  <span className="line-clamp-2 font-medium">{t.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {t.gearSlug} / {t.lowerGearSlug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {currentUserId && (
        <CreatePostForm onCreated={onPostCreated} className="mb-8" />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2 border border-border bg-muted/30 p-1 shadow-e1">
          <TabsTrigger
            value="trending"
            className="rounded-xl text-muted-foreground transition-colors duration-150 ease-out data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Trending
          </TabsTrigger>
          <TabsTrigger
            value="following"
            className="rounded-xl text-muted-foreground transition-colors duration-150 ease-out data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            Following
          </TabsTrigger>
        </TabsList>
        <TabsContent value="trending" className="mt-6">
          {loading ? (
            <FeedSkeletonList />
          ) : (
            <PostList variant="trending" posts={trendingPosts} currentUserId={currentUserId} patchPost={patchPost} />
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {loading ? (
            <FeedSkeletonList count={2} />
          ) : !currentUserId ? (
            <FeedEmptyState variant="following" currentUserId={null} />
          ) : (
            <FollowingFeedList items={followingItems} currentUserId={currentUserId} patchPost={patchPost} />
          )}
        </TabsContent>
      </Tabs>

      <CarmunityOnboardingDialog
        pack={onboardingPack}
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
      />
    </div>
  );
}

function FollowingFeedList({
  items,
  currentUserId,
  patchPost,
}: {
  items: FollowingFeedItem[];
  currentUserId: string | null;
  patchPost: (postId: string, fn: (p: Post) => Post) => void;
}) {
  if (items.length === 0) {
    return <FeedEmptyState variant="following" currentUserId={currentUserId} />;
  }
  return (
    <div className="space-y-5">
      {items.map((item) => {
        if (item.type === "post") {
          return (
            <PostCard key={`post-${item.post.id}`} post={item.post as unknown as Post} patchPost={patchPost} />
          );
        }
        if (item.type === "thread") {
          return (
            <FollowingThreadCard
              key={`thread-${item.thread.id}`}
              thread={item.thread}
              currentUserId={currentUserId}
            />
          );
        }
        return (
          <FollowingReplyCard
            key={`reply-${item.reply.id}`}
            reply={item.reply}
            currentUserId={currentUserId}
          />
        );
      })}
    </div>
  );
}

function FollowingThreadCard({
  thread,
  currentUserId,
}: {
  thread: FollowingThreadPayload;
  currentUserId: string | null;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const displayName = thread.author.name?.trim() || `@${thread.author.handle}`;
  const meta = `@${thread.author.handle} · ${formatPostTime(thread.createdAt)}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
    >
      <Card className="carmunity-feed-card overflow-hidden border border-border bg-card p-0 shadow-e1 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-e2">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <Link href={`/u/${thread.author.handle}`} className={cn("shrink-0", shellFocusRing, "rounded-full")}>
            <Avatar className="h-11 w-11 border border-border">
              <AvatarImage src={thread.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(thread.author.name ?? thread.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
                Discussion
              </Badge>
              <span className="text-[11px] font-medium text-muted-foreground">New thread</span>
            </div>
            <Link
              href={`/u/${thread.author.handle}`}
              className={cn(
                "mt-1 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary",
                shellFocusRing,
                "rounded-sm"
              )}
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {thread.gearTitle} · {thread.lowerGearTitle}
            </p>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Link
            href={thread.href}
            className={cn("block group", shellFocusRing, "rounded-lg")}
            onClick={() => {
              if (currentUserId) {
                fireCarmunityClientEvent("thread_open_feed", {
                  threadId: thread.id,
                  surface: "following_thread_card",
                });
              }
            }}
          >
            <h3 className="text-base font-semibold text-foreground group-hover:text-primary">{thread.title}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{thread.snippet}</p>
          </Link>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {thread.replyCount} {thread.replyCount === 1 ? "reply" : "replies"}
            </span>
            <span>{thread.reactionCount} reactions</span>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}

function FollowingReplyCard({
  reply,
  currentUserId,
}: {
  reply: FollowingReplyPayload;
  currentUserId: string | null;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const displayName = reply.author.name?.trim() || `@${reply.author.handle}`;
  const meta = `@${reply.author.handle} · ${formatPostTime(reply.createdAt)}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
    >
      <Card className="carmunity-feed-card overflow-hidden border border-border bg-card p-0 shadow-e1 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-e2">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <Link href={`/u/${reply.author.handle}`} className={cn("shrink-0", shellFocusRing, "rounded-full")}>
            <Avatar className="h-11 w-11 border border-border">
              <AvatarImage src={reply.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(reply.author.name ?? reply.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
                Discussion
              </Badge>
              <span className="text-[11px] font-medium text-muted-foreground">Reply</span>
            </div>
            <Link
              href={`/u/${reply.author.handle}`}
              className={cn(
                "mt-1 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary",
                shellFocusRing,
                "rounded-sm"
              )}
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Link
            href={reply.href}
            className={cn("block group", shellFocusRing, "rounded-lg")}
            onClick={() => {
              if (currentUserId) {
                fireCarmunityClientEvent("thread_open_feed", {
                  threadId: reply.threadId,
                  surface: "following_reply_card",
                });
              }
            }}
          >
            <p className="text-sm text-muted-foreground">
              Replied in{" "}
              <span className="font-medium text-foreground group-hover:text-primary">{reply.threadTitle}</span>
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">{reply.snippet}</p>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {reply.gearSlug} / {reply.lowerGearSlug}
            </p>
          </Link>
        </div>
      </Card>
    </motion.article>
  );
}

function FeedSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div
      className="space-y-5"
      role="status"
      aria-busy="true"
      aria-label="Loading Carmunity feed"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={`feed-skeleton-${i}`}
          className="carmunity-feed-card overflow-hidden border border-border bg-muted/20 p-0 shadow-e1"
        >
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <div className="carmunity-skeleton-pulse h-11 w-11 shrink-0 rounded-full bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="carmunity-skeleton-pulse h-3.5 w-1/3 rounded bg-muted" />
              <div className="carmunity-skeleton-pulse h-3 w-1/4 rounded bg-muted" />
            </div>
          </div>
          <div className="carmunity-skeleton-pulse aspect-[4/3] w-full bg-muted/80 sm:aspect-video" />
          <div className="space-y-2 px-4 py-4">
            <div className="carmunity-skeleton-pulse h-3 w-full rounded bg-muted" />
            <div className="carmunity-skeleton-pulse h-3 w-5/6 rounded bg-muted" />
          </div>
          <div className="flex gap-3 border-t border-border px-3 py-3">
            <div className="carmunity-skeleton-pulse h-8 w-16 rounded-full bg-muted" />
            <div className="carmunity-skeleton-pulse h-8 w-16 rounded-full bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function PostList({
  variant,
  posts,
  currentUserId,
  patchPost,
}: {
  variant: "trending" | "following";
  posts: Post[];
  currentUserId: string | null;
  patchPost: (postId: string, fn: (p: Post) => Post) => void;
}) {
  if (posts.length === 0) {
    return <FeedEmptyState variant={variant} currentUserId={currentUserId} />;
  }
  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} patchPost={patchPost} />
      ))}
    </div>
  );
}

function PostCard({
  post,
  patchPost,
}: {
  post: Post;
  patchPost: (postId: string, fn: (p: Post) => Post) => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const hasImage = Boolean(post.imageUrl?.trim());
  const hasContent = Boolean(post.content?.trim());
  const displayName = post.author.name?.trim() || `@${post.author.handle}`;
  const metaLine = `@${post.author.handle} · ${formatPostTime(post.createdAt)}`;
  const sharePath = `/explore/post/${post.id}`;
  const shareDescription = (post.content ?? "").replace(/\s+/g, " ").trim().slice(0, 160);

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
    >
      <Card className="carmunity-feed-card overflow-hidden border border-border bg-card p-0 shadow-e1 transition-[border-color,box-shadow] duration-200 hover:border-primary/30 hover:shadow-e2">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <Link href={`/u/${post.author.handle}`} className={cn("shrink-0", shellFocusRing, "rounded-full")}>
            <Avatar className="h-11 w-11 border border-border">
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(post.author.name ?? post.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
              Post
            </Badge>
            <Link
              href={`/u/${post.author.handle}`}
              className={cn(
                "mt-1 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary",
                shellFocusRing,
                "rounded-sm"
              )}
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{metaLine}</p>
          </div>
        </div>

        {hasImage && (
          <Link href={sharePath} className="relative block aspect-[4/3] w-full bg-muted sm:aspect-video">
            <Image
              src={post.imageUrl!.trim()}
              alt=""
              fill
              className="object-cover transition duration-300 hover:opacity-[0.98]"
              sizes="(max-width: 640px) 100vw, 640px"
            />
          </Link>
        )}

        {(hasContent || !hasImage) && (
          <div className="px-4 pb-2 pt-1">
            {hasContent ? (
              <Link href={sharePath} className={cn("block", shellFocusRing, "rounded-md")}>
                <p className="line-clamp-6 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {post.content}
                </p>
              </Link>
            ) : !hasImage ? (
              <Link
                href={sharePath}
                className={cn("text-sm text-muted-foreground hover:text-primary", shellFocusRing, "rounded-md")}
              >
                View post
              </Link>
            ) : null}
          </div>
        )}

        <div className="space-y-2 border-t border-border px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <PostReactionPicker
              postId={post.id}
              summary={post.reactionSummary}
              initialKind={post.viewerReactionKind}
              onReactionApplied={({ postId, prevKind, nextKind }) => {
                patchPost(postId, (p) => ({
                  ...p,
                  viewerReactionKind: nextKind,
                  liked: nextKind === "LIKE",
                  reactionSummary: applyViewerReactionChange(p.reactionSummary, prevKind, nextKind),
                }));
              }}
            />
            <FeedPostInlineComment
              postId={post.id}
              initialCount={post._count.comments}
              onCommented={(nextCount) => {
                patchPost(post.id, (p) => ({
                  ...p,
                  _count: { ...p._count, comments: nextCount },
                }));
              }}
            />
            <ShareButtons
              url={sharePath}
              title={displayName}
              description={shareDescription || "Carmunity post"}
              triggerClassName="h-9 rounded-full border-border bg-muted/40 px-3 text-xs text-foreground hover:bg-muted/60"
              carmunityShareMeta={{ surface: "explore_feed", postId: post.id }}
            />
            <Button variant="ghost" size="sm" className="h-9 rounded-full px-3 text-xs text-muted-foreground" asChild>
              <Link href={sharePath}>
                <MessageCircle className="mr-1 inline h-4 w-4" />
                Thread
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
