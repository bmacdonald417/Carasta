import Link from "next/link";

import { cn } from "@/lib/utils";

/** Profile canonical route: `/u/[handle]`. */
export function AuthorHandleLink({
  handle,
  className,
  showAt = true,
}: {
  handle: string;
  className?: string;
  showAt?: boolean;
}) {
  const h = handle.trim().toLowerCase();
  return (
    <Link
      href={`/u/${encodeURIComponent(h)}`}
      className={cn(
        "font-medium text-primary underline-offset-4 hover:underline",
        className
      )}
    >
      {showAt ? `@${h}` : h}
    </Link>
  );
}
