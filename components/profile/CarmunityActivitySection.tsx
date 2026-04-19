import Link from "next/link";

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
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Carmunity Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Discussions by @{handle} will appear here.
          </p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-card/40 p-6 text-sm text-muted-foreground">
          No threads or replies yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
          Carmunity Activity
        </h2>
        <p className="text-sm text-muted-foreground">
          Recent Discussions participation by @{handle}
          {page > 1 ? (
            <span className="ml-2 text-xs text-primary">· page {page}</span>
          ) : null}
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((it, idx) => (
          <li key={`${it.kind}-${idx}-${it.at}`}>
            <Link
              href={it.href}
              className={cn(
                "block rounded-2xl border border-border/50 bg-card/50 p-4 transition",
                "hover:border-primary/30 hover:bg-muted/15"
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                {it.kind === "thread" ? "Thread" : "Reply"}
                <span className="ml-2 font-normal text-muted-foreground">{formatWhen(it.at)}</span>
              </p>
              {it.kind === "thread" ? (
                <p className="mt-1 font-medium text-foreground line-clamp-2">{it.title}</p>
              ) : (
                <>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                    In: <span className="text-foreground/80">{it.threadTitle}</span>
                  </p>
                  <p className="mt-1 text-sm text-foreground/90 line-clamp-3">{it.excerpt}</p>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
      {hasNextPage && nextPageHref ? (
        <div className="flex justify-center pt-2">
          <Link
            href={nextPageHref}
            className="rounded-full border border-primary/35 bg-primary/5 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-primary transition hover:bg-primary/10"
          >
            Load more activity
          </Link>
        </div>
      ) : null}
    </section>
  );
}
