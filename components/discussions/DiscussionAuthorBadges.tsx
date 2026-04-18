import { cn } from "@/lib/utils";

export function DiscussionAuthorBadges({
  badges,
  className,
}: {
  badges: Array<{ slug: string; name: string }>;
  className?: string;
}) {
  if (badges.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {badges.map((b) => (
        <span
          key={b.slug}
          className="rounded-full border border-primary/35 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
        >
          {b.name}
        </span>
      ))}
    </div>
  );
}
