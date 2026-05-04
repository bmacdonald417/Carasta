import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { shellFocusRing } from "@/lib/shell-nav-styles";

export type FeedPreviewPost = {
  id: string;
  content: string | null;
  imageUrl: string | null;
  createdAt: string;
  author: {
    handle: string;
    name: string | null;
    avatarUrl: string | null;
  };
  _count: { likes: number; comments: number };
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 36e5);
  const days = Math.floor(diff / 864e5);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function CarmunityFeedPanel({
  posts,
  currentUserId,
  className,
}: {
  posts: FeedPreviewPost[];
  currentUserId: string | null;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-e1 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Carmunity Feed</h2>
        <div className="flex gap-1">
          {["Latest", "Following", "Trending"].map((tab, i) => (
            <span
              key={tab}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium transition-colors",
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>

      {/* Composer bar — links to explore */}
      <Link
        href={currentUserId ? "/explore" : "/auth/sign-in?callbackUrl=%2Fexplore"}
        className="flex items-center gap-3 border-b border-border px-4 py-2.5 transition hover:bg-muted/30"
      >
        <div className="h-8 w-8 shrink-0 rounded-full bg-muted border border-border" />
        <span className="flex-1 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
          What&apos;s on your mind?
        </span>
        <div className="flex gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground text-xs">📷</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground text-xs">🎥</span>
        </div>
      </Link>

      {/* Posts */}
      <div className="divide-y divide-border">
        {posts.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No posts yet. Be the first to share what you&apos;re building.
          </p>
        ) : (
          posts.map((p) => {
            const display = p.author.name?.trim() || `@${p.author.handle}`;
            const excerpt = (p.content ?? "").replace(/\s+/g, " ").trim().slice(0, 280);
            return (
              <article key={p.id} className="px-4 py-3">
                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar className="h-9 w-9 border border-border shrink-0">
                    <AvatarImage src={p.author.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                      {display.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/u/${p.author.handle}`}
                      className={cn("text-sm font-semibold text-foreground hover:text-primary truncate block", shellFocusRing, "rounded-sm")}
                    >
                      {display}
                    </Link>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(p.createdAt)}</span>
                  </div>
                  <Link
                    href={`/explore/post/${p.id}`}
                    className={cn("shrink-0 text-[11px] font-medium text-primary hover:underline", shellFocusRing, "rounded-sm")}
                  >
                    View →
                  </Link>
                </div>

                {/* Content */}
                {excerpt ? (
                  <p className="text-sm leading-relaxed text-foreground/90 mb-2.5">{excerpt}</p>
                ) : null}

                {/* Image */}
                {p.imageUrl ? (
                  <div className="relative mb-2.5 w-full overflow-hidden rounded-xl border border-border bg-muted" style={{ aspectRatio: "16/9" }}>
                    <Image
                      src={p.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 560px"
                    />
                  </div>
                ) : null}

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                    <Heart className="h-3.5 w-3.5" aria-hidden />
                    {p._count.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                    {p._count.comments} {p._count.comments === 1 ? "Comment" : "Comments"}
                  </button>
                  <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-primary transition-colors ml-auto">
                    <Share2 className="h-3.5 w-3.5" aria-hidden />
                    Share
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <Link
          href="/explore"
          className={cn(
            "inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))]",
            shellFocusRing
          )}
        >
          Open full feed
        </Link>
      </div>
    </section>
  );
}
