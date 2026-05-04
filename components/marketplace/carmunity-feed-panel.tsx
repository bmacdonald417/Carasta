import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
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
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-e1 md:p-5",
        className
      )}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Carmunity Feed
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Latest posts from the community — join to react and comment.
          </p>
        </div>
        <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Latest
        </span>
      </div>

      <div className="mt-5 space-y-5">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No posts yet. Be the first to share what you&apos;re building in the garage.
          </p>
        ) : (
          posts.map((p) => {
            const display = p.author.name?.trim() || `@${p.author.handle}`;
            const excerpt = (p.content ?? "").replace(/\s+/g, " ").trim().slice(0, 220);
            return (
              <article key={p.id} className="rounded-xl border border-border/80 bg-muted/20 p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={p.author.avatarUrl ?? undefined} alt="" />
                    <AvatarFallback className="text-xs">
                      {display.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <Link
                        href={`/u/${p.author.handle}`}
                        className={cn(
                          "truncate text-sm font-semibold text-foreground hover:text-primary",
                          shellFocusRing,
                          "rounded-md"
                        )}
                      >
                        {display}
                      </Link>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {excerpt ? (
                      <p className="mt-2 text-sm leading-relaxed text-foreground/90">{excerpt}</p>
                    ) : null}
                    {p.imageUrl ? (
                      <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
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
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                        <span>{p._count.likes} likes</span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                          {p._count.comments} comments
                        </span>
                      </div>
                      <Link
                        href={`/explore/post/${p.id}`}
                        className={cn(
                          "shrink-0 text-[11px] font-medium text-primary hover:underline sm:text-xs",
                          shellFocusRing,
                          "rounded-md"
                        )}
                      >
                        View post
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-border/70 pt-4">
        <Link
          href="/explore"
          className={cn(
            "inline-flex flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-e1 transition hover:bg-[hsl(var(--primary-hover))] sm:flex-none",
            shellFocusRing
          )}
        >
          Open full feed
        </Link>
        {!currentUserId ? (
          <Link
            href="/auth/sign-in?callbackUrl=%2Fexplore"
            className={cn(
              "inline-flex flex-1 items-center justify-center rounded-2xl border border-border bg-transparent px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted/50 sm:flex-none",
              shellFocusRing
            )}
          >
            Log in to post
          </Link>
        ) : null}
      </div>
    </section>
  );
}
