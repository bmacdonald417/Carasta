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
          className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-neutral-950">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-600">{description}</p>
        </Link>
      ))}
    </div>
  );
}
