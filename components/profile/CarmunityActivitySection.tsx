import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

export type CarmunityActivityItem =
  | {
      kind: "thread";
      at: string;
      title: string;
      href: string;
    }
  | {
      kind: "reply";
      at: string;
      excerpt: string;
      threadTitle: string;
      href: string;
    };

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function CarmunityActivitySection({
  items,
  handle,
  page = 1,
  hasNextPage = false,
  nextPageHref,
}: {
  items: CarmunityActivityItem[];
  handle: string;
  page?: number;
  hasNextPage?: boolean;
  nextPageHref?: string | null;
}) {
  if (items.length === 0) {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Carmunity activity</h2>
          <p className="text-sm text-muted-foreground">
            Discussions by @{handle} will appear here — threads started and replies added across Carmunity.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center shadow-e1 sm:px-10">
          <p className="text-base font-semibold text-foreground">No public discussion activity yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            When @{handle} starts a thread or weighs in on someone else&apos;s build, it shows up here with a
            quick path back to the conversation.
          </p>
          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild className={cn("sm:min-w-[200px]", shellFocusRing)}>
              <Link href="/discussions">Browse discussions</Link>
            </Button>
            <Button variant="outline" asChild className={cn("border-border sm:min-w-[200px]", shellFocusRing)}>
              <Link href="/explore">Open Carmunity feed</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Carmunity activity</h2>
        <p className="text-sm text-muted-foreground">
          Recent Discussions participation by @{handle}
          {page > 1 ? <span className="ml-2 text-xs font-medium text-primary">· page {page}</span> : null}
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={`${it.kind}-${idx}-${it.at}`}>
            <Link
              href={it.href}
              className={cn(
                "block rounded-2xl border border-border bg-card p-4 shadow-e1 transition-colors",
                shellFocusRing,
                "hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wide">
                  {it.kind === "thread" ? "Thread" : "Reply"}
                </Badge>
                <span className="text-xs text-muted-foreground">{formatWhen(it.at)}</span>
              </div>
              {it.kind === "thread" ? (
                <p className="mt-2 font-medium text-foreground line-clamp-2">{it.title}</p>
              ) : (
                <>
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    In: <span className="font-medium text-foreground">{it.threadTitle}</span>
                  </p>
                  <p className="mt-1 text-sm text-foreground line-clamp-3">{it.excerpt}</p>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {hasNextPage && nextPageHref ? (
        <div className="flex justify-center pt-2">
          <Button variant="outline" size="sm" asChild className={cn("border-border font-medium", shellFocusRing)}>
            <Link href={nextPageHref}>Load more activity</Link>
          </Button>
        </div>
      ) : null}
    </section>
  );
}
