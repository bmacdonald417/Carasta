"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle } from "lucide-react";
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
    <div className="mt-6">
      {currentUserId && (
        <CreatePostForm onCreated={onPostCreated} className="mb-6" />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>
        <TabsContent value="trending" className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-20 animate-pulse rounded bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  No posts yet.
                </p>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onToggleLike={toggleLike}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="following" className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="p-6">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground">
                  Follow people to see their posts here.
                </p>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUserId}
                    onToggleLike={toggleLike}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
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
  return (
    <Card>
      <CardContent className="p-4">
        <Link
          href={`/u/${post.author.handle}`}
          className="flex items-center gap-3"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatarUrl ?? undefined} />
            <AvatarFallback>
              {(post.author.name ?? post.author.handle).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">@{post.author.handle}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </Link>
        {post.content && (
          <p className="mt-3 whitespace-pre-wrap text-sm">{post.content}</p>
        )}
        {post.imageUrl && (
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <Image
              src={post.imageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 600px"
            />
          </div>
        )}
        <div className="mt-3 flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1"
            onClick={() => onToggleLike(post.id, !!post.liked)}
          >
            <Heart
              className={`h-4 w-4 ${post.liked ? "fill-[hsl(var(--performance-red))] text-[hsl(var(--performance-red))]" : ""}`}
            />
            {post._count.likes}
          </Button>
          <Link href={`/explore/post/${post.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageCircle className="h-4 w-4" />
              {post._count.comments}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
