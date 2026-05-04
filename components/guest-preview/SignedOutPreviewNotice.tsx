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
        "overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-muted/40 px-4 py-4 shadow-e2 ring-1 ring-primary/10 sm:px-5 sm:py-4",
        className
      )}
      role="note"
      aria-label="Signed out preview"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/90">
            {title}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
            {description}
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:justify-start">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-border/80 bg-background/90 font-semibold text-foreground shadow-sm"
          >
            <Link href={signInHref}>Sign in</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full px-5 font-semibold shadow-sm">
            <Link href={signUpHref}>Join free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

