import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

export type ProfilePostPreviewData = {
  id: string;
  createdAt: Date;
  content: string | null;
  imageUrl: string | null;
  auctionId: string | null;
  _count: { likes: number; comments: number };
};

function formatPostTime(d: Date): string {
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

/**
 * Read-only Carmunity post shell for profile grids — matches explore feed card language
 * (media-forward, caption clamp, stat row). Engagement opens the post detail for actions.
 */
export function ProfilePostPreview({ post }: { post: ProfilePostPreviewData }) {
  const hasImage = Boolean(post.imageUrl?.trim());
  const hasContent = Boolean(post.content?.trim());
  const detailHref = `/explore/post/${post.id}`;

  return (
    <Card className="carmunity-feed-card overflow-hidden border border-border/50 bg-card/70 p-0 shadow-sm backdrop-blur-sm hover:border-primary/25">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          {post.auctionId ? (
            <span className="shrink-0 rounded-md border border-[hsl(var(--performance-red))]/35 bg-[hsl(var(--performance-red))]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--performance-red))]">
              Auction
            </span>
          ) : null}
          <span className="truncate text-xs text-muted-foreground tabular-nums">
            {formatPostTime(post.createdAt)}
          </span>
        </div>
        <Link
          href={detailHref}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          View
        </Link>
      </div>

      {hasImage && (
        <Link href={detailHref} className="relative block aspect-[4/3] w-full bg-muted sm:aspect-video">
          <Image
            src={post.imageUrl!.trim()}
            alt=""
            fill
            className="object-cover transition duration-300 hover:opacity-[0.98]"
            sizes="(max-width: 640px) 100vw, 480px"
          />
        </Link>
      )}

      {(hasContent || !hasImage) && (
        <div className="px-4 pb-2 pt-1">
          {hasContent ? (
            <Link href={detailHref} className="block">
              <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                {post.content}
              </p>
            </Link>
          ) : !hasImage ? (
            <Link href={detailHref} className="text-sm text-muted-foreground hover:text-primary">
              View post
            </Link>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border/40 px-3 py-2 text-muted-foreground">
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium tabular-nums">
          <Heart className="h-[18px] w-[18px] shrink-0" />
          {post._count.likes}
        </span>
        <Link
          href={detailHref}
          className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors hover:bg-muted/50 hover:text-foreground tabular-nums"
        >
          <MessageCircle className="h-[18px] w-[18px] shrink-0" />
          {post._count.comments}
        </Link>
      </div>
    </Card>
  );
}
