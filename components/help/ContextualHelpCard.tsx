"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getProductHelpIntro,
  getProductHelpLinks,
  type ProductHelpContext,
} from "@/lib/help/product-help";

type ContextualHelpCardProps = {
  context: ProductHelpContext;
  className?: string;
  /** Override default intro copy from the help map. */
  title?: string;
  description?: string;
  /** When true, shows the one-line excerpt under each link (use sparingly). */
  showExcerpts?: boolean;
};

export function ContextualHelpCard({
  context,
  className,
  title,
  description,
  showExcerpts = false,
}: ContextualHelpCardProps) {
  const intro = getProductHelpIntro(context);
  const links = getProductHelpLinks(context);

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-e1 md:p-5",
        className
      )}
      data-product-help-context={context}
      aria-label={title ?? intro.title}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CircleHelp className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {title ?? intro.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {description ?? intro.description}
            </p>
          </div>
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.topicId} className="text-sm">
                <Link
                  href={link.href}
                  className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  data-canonical-help-topic={link.topicId}
                  data-canonical-help-href={link.href}
                >
                  {link.label}
                </Link>
                {showExcerpts ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {link.excerpt}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
