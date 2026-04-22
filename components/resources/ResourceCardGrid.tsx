import Link from "next/link";

import type { ResourceLinkItem } from "./resource-links";

export function ResourceCardGrid({
  items,
  compact = false,
}: {
  items: ResourceLinkItem[];
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "grid gap-4 md:grid-cols-2"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      }
    >
      {items.map(({ title, description, href, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="rounded-2xl border border-border bg-card p-6 shadow-e1 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </Link>
      ))}
    </div>
  );
}
