import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentForm } from "./comment-form";
import { getSession } from "@/lib/auth";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, handle: true, name: true, avatarUrl: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { handle: true, name: true, avatarUrl: true },
          },
        },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) notFound();

  let liked = false;
  if (session?.user?.id) {
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: { userId: (session.user as any).id, postId: id },
      },
    });
    liked = !!like;
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/explore"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Community
      </Link>

      <Card className="mt-4">
        <CardContent className="p-4">
          <Link
            href={`/u/${post.author.handle}`}
            className="flex items-center gap-3"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatarUrl ?? undefined} />
              <AvatarFallback>
                {(post.author.name ?? post.author.handle)
                  .slice(0, 2)
                  .toUpperCase()}
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
            <p className="mt-3 whitespace-pre-wrap">{post.content}</p>
          )}
          {post.imageUrl && (
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.imageUrl}
                alt=""
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {post._count.likes} like{post._count.likes !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <h2 className="font-display font-semibold">Comments</h2>
        {session?.user && (
          <CommentForm postId={post.id} className="mt-2" />
        )}
        <div className="mt-4 space-y-3">
          {post.comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            post.comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-xl border border-border/50 p-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={c.author.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(c.author.name ?? c.author.handle).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/u/${c.author.handle}`}
                    className="text-sm font-medium hover:underline"
                  >
                    @{c.author.handle}
                  </Link>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
