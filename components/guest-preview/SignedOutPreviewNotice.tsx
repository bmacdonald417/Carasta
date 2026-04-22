import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignedOutPreviewNotice({
  title = "Signed out preview",
  description = "You’re seeing a read-only preview. Join to react, comment, follow, save, bid, and sell.",
  nextUrl = "/explore",
  className,
}: {
  title?: string;
  description?: string;
  nextUrl?: string;
  className?: string;
}) {
  const safeNext = nextUrl.startsWith("/") ? nextUrl : "/explore";
  const activationCallback = `/welcome?next=${encodeURIComponent(safeNext)}`;
  const signUpHref = `/auth/sign-up?callbackUrl=${encodeURIComponent(activationCallback)}`;
  const signInHref = `/auth/sign-in?callbackUrl=${encodeURIComponent(activationCallback)}`;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-muted/20 px-4 py-3 shadow-e1",
        className
      )}
      role="note"
      aria-label="Signed out preview"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href={signInHref}>Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-4">
            <Link href={signUpHref}>Join free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

