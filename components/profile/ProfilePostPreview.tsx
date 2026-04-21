import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

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
 * Read-only Carmunity post shell for profile grids — aligned with Explore feed card language.
 */
export function ProfilePostPreview({ post }: { post: ProfilePostPreviewData }) {
  const hasImage = Boolean(post.imageUrl?.trim());
  const hasContent = Boolean(post.content?.trim());
  const detailHref = `/explore/post/${post.id}`;

  return (
    <Card className="carmunity-feed-card overflow-hidden p-0 transition-colors hover:border-primary/35">
      <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          {post.auctionId ? (
            <Badge variant="outline" className="shrink-0 border-primary/30 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Listing
            </Badge>
          ) : null}
          <span className="truncate text-xs tabular-nums text-muted-foreground">{formatPostTime(post.createdAt)}</span>
        </div>
        <Link
          href={detailHref}
          className={cn(
            "shrink-0 text-xs font-medium text-primary hover:underline",
            shellFocusRing,
            "rounded-sm"
          )}
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
            <Link href={detailHref} className={cn("block", shellFocusRing, "rounded-md")}>
              <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                {post.content}
              </p>
            </Link>
          ) : !hasImage ? (
            <Link
              href={detailHref}
              className={cn("text-sm text-muted-foreground hover:text-primary", shellFocusRing, "rounded-md")}
            >
              View post
            </Link>
          ) : null}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-border px-3 py-2 text-muted-foreground">
        <span className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium tabular-nums">
          <Heart className="h-[18px] w-[18px] shrink-0" aria-hidden />
          {post._count.likes}
        </span>
        <Link
          href={detailHref}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium tabular-nums transition-colors hover:bg-muted/50 hover:text-foreground",
            shellFocusRing
          )}
        >
          <MessageCircle className="h-[18px] w-[18px] shrink-0" aria-hidden />
          {post._count.comments}
        </Link>
      </div>
    </Card>
  );
}
