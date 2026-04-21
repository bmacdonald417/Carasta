import { Badge } from "@/components/ui/badge";
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
        <Badge
          key={b.slug}
          variant="outline"
          className="border-primary/25 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
        >
          {b.name}
        </Badge>
      ))}
    </div>
  );
}
