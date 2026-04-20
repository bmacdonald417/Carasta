import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommentForm } from "./comment-form";
import { getSession } from "@/lib/auth";
import { ReputationBadge } from "@/components/reputation/ReputationBadge";
import { summarizePostReactionsMerged, viewerPostReactionKinds } from "@/lib/carmunity/post-reactions";
import { PostEngagementBar } from "./post-engagement";

function formatPostTime(iso: Date): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 60_000) return "Just now";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

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
        select: { id: true, handle: true, name: true, avatarUrl: true, collectorTier: true },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: {
          author: {
            select: { handle: true, name: true, avatarUrl: true, collectorTier: true },
          },
        },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!post) notFound();

  const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null;
  const merged = await summarizePostReactionsMerged(prisma, [id]);
  const viewerKinds = await viewerPostReactionKinds(prisma, viewerId, [id]);
  const reactionSummary = merged.get(id) ?? { total: 0, byKind: {} };
  const viewerReactionKind = viewerKinds.get(id) ?? null;

  const displayName = post.author.name?.trim() || `@${post.author.handle}`;
  const hasImage = Boolean(post.imageUrl?.trim());
  const hasContent = Boolean(post.content?.trim());

  return (
    <div className="carasta-container max-w-2xl py-8">
      <Link
        href="/explore"
        className="text-sm text-muted-foreground transition hover:text-primary"
      >
        ← Carmunity
      </Link>

      <Card className="carmunity-feed-card mt-6 overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/20">
        {/* Author */}
        <div className="flex items-start gap-3 border-b border-border/40 px-5 pt-5 pb-4">
          <Link href={`/u/${post.author.handle}`} className="shrink-0">
            <Avatar className="h-12 w-12 ring-1 ring-border/60">
              <AvatarImage src={post.author.avatarUrl ?? undefined} alt="" />
              <AvatarFallback>
                {(post.author.name ?? post.author.handle).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/u/${post.author.handle}`}
                className="text-base font-semibold tracking-tight text-foreground hover:text-primary"
              >
                {displayName}
              </Link>
              <ReputationBadge tier={post.author.collectorTier} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              @{post.author.handle} · {formatPostTime(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Media first when present */}
        {hasImage && (
          <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-video">
            <Image
              src={post.imageUrl!.trim()}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
              priority
            />
          </div>
        )}

        {/* Body */}
        {hasContent && (
          <div className="px-5 py-5">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
              {post.content}
            </p>
          </div>
        )}

        <PostEngagementBar
          postId={post.id}
          title={`Post by @${post.author.handle}`}
          description={post.content}
          initialSummary={reactionSummary}
          initialKind={viewerReactionKind}
        />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/40 px-5 py-3 text-xs">
          <Link
            href={`/u/${post.author.handle}`}
            className="font-medium text-primary transition-colors duration-150 hover:underline"
          >
            View profile
          </Link>
          <span className="text-border">·</span>
          <Link
            href={`/u/${post.author.handle}/garage`}
            className="text-muted-foreground transition-colors duration-150 hover:text-foreground hover:underline"
          >
            Garage
          </Link>
        </div>
      </Card>

      <section className="mt-10">
        <h2 className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Comments
        </h2>
        {session?.user && <CommentForm postId={post.id} className="mt-4" />}
        <div className="mt-5 space-y-3">
          {post.comments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 bg-gradient-to-b from-muted/20 to-muted/5 px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">Be the first voice in the thread</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Short reactions welcome — keep it respectful and specific.
              </p>
              {!session?.user ? (
                <Button asChild className="mt-5" size="sm">
                  <Link href="/auth/sign-in">Sign in to comment</Link>
                </Button>
              ) : null}
            </div>
          ) : (
            post.comments.map((c) => (
              <div
                key={c.id}
                className="flex gap-3 rounded-xl border border-border/50 bg-card/40 px-4 py-3"
              >
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/40">
                  <AvatarImage src={c.author.avatarUrl ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(c.author.name ?? c.author.handle).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/u/${c.author.handle}`}
                      className="text-sm font-semibold hover:text-primary"
                    >
                      @{c.author.handle}
                    </Link>
                    <ReputationBadge tier={c.author.collectorTier} />
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">{c.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatPostTime(c.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
