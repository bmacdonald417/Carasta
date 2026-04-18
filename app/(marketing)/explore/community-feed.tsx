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
}: {
  tab: string;
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPosts() {
      const res = await fetch(
        `/api/explore/feed?tab=${tab}${currentUserId ? `&userId=${currentUserId}` : ""}`
      );
      if (!res.ok || cancelled) return;
      const data = await res.json();
      if (!cancelled) setPosts(data.posts ?? []);
      setLoading(false);
    }
    setLoading(true);
    fetchPosts();
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
    setPosts((prev) =>
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
    router.refresh();
  }

  function onPostCreated() {
    router.refresh();
    setPosts((prev) => []);
    setLoading(true);
    fetch(`/api/explore/feed?tab=${tab}${currentUserId ? `&userId=${currentUserId}` : ""}`)
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }

  return (
    <div className="mt-8">
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
              posts={posts}
              currentUserId={currentUserId}
              onToggleLike={toggleLike}
            />
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-6">
          {loading ? (
            <FeedSkeletonList count={2} />
          ) : (
            <PostList
              variant="following"
              posts={posts}
              currentUserId={currentUserId}
              onToggleLike={toggleLike}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
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
  const displayName =
    post.author.name?.trim() || `@${post.author.handle}`;
  const metaLine = `@${post.author.handle} · ${formatPostTime(post.createdAt)}`;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
    >
      <Card className="carmunity-feed-card overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/25">
        {/* 1 — Author row */}
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
            <Link
              href={`/u/${post.author.handle}`}
              className="block truncate text-sm font-semibold tracking-tight text-foreground hover:text-primary"
            >
              {displayName}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{metaLine}</p>
          </div>
        </div>

        {/* 2 — Media (image-forward, edge-to-edge in card) */}
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

        {/* 3 — Caption + 4 — metadata (caption only; time is in author row) */}
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

        {/* 5 — Social action row */}
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
            <span className="min-w-[1ch] tabular-nums text-xs font-medium">
              {post._count.likes}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            asChild
          >
            <Link href={`/explore/post/${post.id}`}>
              <MessageCircle className="h-[18px] w-[18px] shrink-0" />
              <span className="min-w-[1ch] tabular-nums text-xs font-medium">
                {post._count.comments}
              </span>
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
