"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
import { discussionThreadPath } from "@/lib/discussions/discussion-paths";
import type { OnboardingPack } from "@/lib/carmunity/onboarding-service";
import { DiscussedAuctionsStrip } from "@/components/explore/DiscussedAuctionsStrip";
import { CarmunityOnboardingDialog } from "@/components/carmunity/CarmunityOnboardingDialog";
import type { DiscussedLiveAuctionRow } from "@/lib/forums/auction-discussion";
import { FeedEmptyState } from "@/components/carmunity/FeedEmptyState";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { likePost, unlikePost } from "./actions";
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
};

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
        setFollowingItems(Array.isArray(data.items) ? data.items : []);
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
      setTrendingPosts(data.posts ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, currentUserId]);

  async function toggleLike(postId: string, currentlyLiked: boolean) {
    if (!currentUserId) {
      router.push("/auth/sign-in");
      return;
    }
    if (currentlyLiked) {
      await unlikePost(postId);
    } else {
      await likePost(postId);
    }
    setTrendingPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              liked: !currentlyLiked,
              _count: {
                ...p._count,
                likes: p._count.likes + (currentlyLiked ? -1 : 1),
              },
            }
          : p
      )
    );
    setFollowingItems((prev) =>
      prev.map((item) => {
        if (item.type !== "post" || item.post.id !== postId) return item;
        return {
          ...item,
          post: {
            ...item.post,
            liked: !currentlyLiked,
            _count: {
              ...item.post._count,
              likes: item.post._count.likes + (currentlyLiked ? -1 : 1),
            },
          },
        };
      })
    );
    router.refresh();
  }

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
        setFollowingItems(Array.isArray(data.items) ? data.items : []);
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
      setTrendingPosts(data.posts ?? []);
      setLoading(false);
    })();
  }

  return (
    <div className="mt-8">
      <DiscussedAuctionsStrip items={discussedAuctions} />
      {trendingDiscussionThreads.length > 0 ? (
        <section className="mb-8 space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-primary">
                From discussions
              </p>
              <h2 className="font-display text-base font-semibold uppercase tracking-wide text-neutral-100">
                Trending threads
              </h2>
            </div>
            <Link
              href="/discussions"
              className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              Browse all
            </Link>
          </div>
          <ul className="divide-y divide-white/5">
            {trendingDiscussionThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={discussionThreadPath(t.gearSlug, t.lowerGearSlug, t.id)}
                  className="block py-2.5 text-sm text-neutral-200 transition hover:text-primary"
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
        <TabsList className="grid w-full grid-cols-2 border-border/50 bg-muted/40 p-1">
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
            <PostList
              variant="trending"
              posts={trendingPosts}
              currentUserId={currentUserId}
              onToggleLike={toggleLike}
            />
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {loading ? (
            <FeedSkeletonList count={2} />
          ) : !currentUserId ? (
            <FeedEmptyState variant="following" currentUserId={null} />
          ) : (
            <FollowingFeedList
              items={followingItems}
              currentUserId={currentUserId}
              onToggleLike={toggleLike}
            />
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
  onToggleLike,
}: {
  items: FollowingFeedItem[];
  currentUserId: string | null;
  onToggleLike: (postId: string, currentlyLiked: boolean) => void;
}) {
  if (items.length === 0) {
    return <FeedEmptyState variant="following" currentUserId={currentUserId} />;
  }
  return (
    <div className="space-y-6">
      {items.map((item) => {
        if (item.type === "post") {
          return (
            <PostCard
              key={`post-${item.post.id}`}
              post={item.post}
              currentUserId={currentUserId}
              onToggleLike={onToggleLike}
            />
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
      <Card className="carmunity-feed-card overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/25">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <Link href={`/u/${thread.author.handle}`} className="shrink-0">
            <Avatar className="h-11 w-11 ring-1 ring-border/60">
              <AvatarImage src={thread.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(thread.author.name ?? thread.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">
              Discussion · new thread
            </p>
            <Link
              href={`/u/${thread.author.handle}`}
              className="mt-0.5 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary"
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
            className="block group"
            onClick={() => {
              if (currentUserId) {
                fireCarmunityClientEvent("thread_open_feed", {
                  threadId: thread.id,
                  surface: "following_thread_card",
                });
              }
            }}
          >
            <h3 className="font-display text-base font-semibold uppercase tracking-wide text-neutral-100 group-hover:text-primary">
              {thread.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/85">{thread.snippet}</p>
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
      <Card className="carmunity-feed-card overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/25">
        <div className="flex items-start gap-3 px-4 pt-4 pb-2">
          <Link href={`/u/${reply.author.handle}`} className="shrink-0">
            <Avatar className="h-11 w-11 ring-1 ring-border/60">
              <AvatarImage src={reply.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(reply.author.name ?? reply.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">
              Discussion · reply
            </p>
            <Link
              href={`/u/${reply.author.handle}`}
              className="mt-0.5 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary"
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Link
            href={reply.href}
            className="block group"
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
              <span className="font-medium text-neutral-200 group-hover:text-primary">
                {reply.threadTitle}
              </span>
            </p>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-foreground/85">{reply.snippet}</p>
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
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card
          key={`feed-skeleton-${i}`}
          className="carmunity-feed-card overflow-hidden border-border/50 bg-card/50 p-0 shadow-sm"
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
          <div className="flex gap-3 border-t border-border/40 px-3 py-3">
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
  onToggleLike,
}: {
  variant: "trending" | "following";
  posts: Post[];
  currentUserId: string | null;
  onToggleLike: (postId: string, currentlyLiked: boolean) => void;
}) {
  if (posts.length === 0) {
    return <FeedEmptyState variant={variant} currentUserId={currentUserId} />;
  }
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onToggleLike={onToggleLike}
        />
      ))}
    </div>
  );
}

function PostCard({
  post,
  currentUserId,
  onToggleLike,
}: {
  post: Post;
  currentUserId: string | null;
  onToggleLike: (postId: string, currentlyLiked: boolean) => void;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const hasImage = Boolean(post.imageUrl?.trim());
  const hasContent = Boolean(post.content?.trim());
  const displayName = post.author.name?.trim() || `@${post.author.handle}`;
  const metaLine = `@${post.author.handle} · ${formatPostTime(post.createdAt)}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
    >
      <Card className="carmunity-feed-card overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/25">
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <Link href={`/u/${post.author.handle}`} className="shrink-0">
            <Avatar className="h-11 w-11 ring-1 ring-border/60">
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-medium">
                {(post.author.name ?? post.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/90">Post</p>
            <Link
              href={`/u/${post.author.handle}`}
              className="mt-0.5 block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary"
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{metaLine}</p>
          </div>
        </div>

        {hasImage && (
          <Link
            href={`/explore/post/${post.id}`}
            className="relative block aspect-[4/3] w-full bg-muted sm:aspect-video"
          >
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
          <div className="px-4 pb-1 pt-2">
            {hasContent ? (
              <Link href={`/explore/post/${post.id}`} className="block">
                <p className="line-clamp-6 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                  {post.content}
                </p>
              </Link>
            ) : !hasImage ? (
              <Link
                href={`/explore/post/${post.id}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                View post
              </Link>
            ) : null}
          </div>
        )}

        <div className="flex items-center gap-1 border-t border-border/40 px-2 py-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              onToggleLike(post.id, !!post.liked);
            }}
          >
            <Heart
              className={`h-[18px] w-[18px] shrink-0 ${post.liked ? "fill-primary text-primary" : ""}`}
            />
            <span className="min-w-[1ch] tabular-nums text-xs font-medium">{post._count.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            asChild
          >
            <Link href={`/explore/post/${post.id}`}>
              <MessageCircle className="h-[18px] w-[18px] shrink-0" />
              <span className="min-w-[1ch] tabular-nums text-xs font-medium">{post._count.comments}</span>
            </Link>
          </Button>
          {!currentUserId && (
            <span className="ml-auto pr-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              Sign in to like
            </span>
          )}
        </div>
      </Card>
    </motion.article>
  );
}
