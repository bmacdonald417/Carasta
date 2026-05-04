"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  HELP_RETRIEVAL_SCHEMA_VERSION,
  getRetrievedHelpBundle,
} from "@/lib/help/help-retrieval";
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
  /** When false, hides the intro paragraph (compact surfaces). */
  showIntro?: boolean;
  /**
   * `ranked` applies deterministic pathname-aware ordering + optional related links.
   * `static` uses the canonical list order from `product-help.ts` only.
   */
  retrievalMode?: "static" | "ranked";
  /** Cap primary links (ranked or static). */
  maxPrimaryLinks?: number;
  /** Max related canonical links (ranked only). 0 disables the related block. */
  relatedLimit?: number;
  /** When true, shows the one-line excerpt under each primary link. */
  showExcerpts?: boolean;
  /** Compact header + expandable body (e.g. auctions marketplace). */
  collapsible?: boolean;
  /** Initial open state when `collapsible` is true. */
  defaultExpanded?: boolean;
};

export function ContextualHelpCard({
  context,
  className,
  title,
  description,
  showIntro = true,
  retrievalMode = "ranked",
  maxPrimaryLinks,
  relatedLimit,
  showExcerpts = false,
  collapsible = false,
  defaultExpanded = false,
}: ContextualHelpCardProps) {
  const pathname = usePathname() ?? "";
  const panelId = useId();
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const { primary, related } = useMemo(() => {
    if (retrievalMode === "static") {
      const list = getProductHelpLinks(context);
      const primaryLinks =
        typeof maxPrimaryLinks === "number" && maxPrimaryLinks > 0
          ? list.slice(0, maxPrimaryLinks)
          : list;
      return { primary: primaryLinks, related: [] as const };
    }
    return getRetrievedHelpBundle(context, pathname, {
      primaryLimit: maxPrimaryLinks,
      relatedLimit,
    });
  }, [context, pathname, retrievalMode, maxPrimaryLinks, relatedLimit]);

  const intro = getProductHelpIntro(context);

  const linkLists = (
    <>
      <ul className="space-y-2">
        {primary.map((link) => (
          <li key={link.topicId} className="text-sm">
            <Link
              href={link.href}
              className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              data-canonical-help-topic={link.topicId}
              data-canonical-help-href={link.href}
              data-help-link-tier="primary"
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

      {related.length > 0 ? (
        <div
          className="border-t border-border/60 pt-3"
          data-help-related-block="true"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Suggested next
          </p>
          <ul className="mt-2 space-y-1.5">
            {related.map((link) => (
              <li key={link.topicId} className="text-xs">
                <Link
                  href={link.href}
                  className="font-medium text-primary/90 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  data-canonical-help-topic={link.topicId}
                  data-canonical-help-href={link.href}
                  data-help-link-tier="related"
                >
                  {link.label}
                </Link>
                {showExcerpts ? (
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {link.excerpt}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );

  if (collapsible) {
    const heading = title ?? intro.title;
    const sub = description ?? intro.description;
    const summaryLine = (
      <span className="min-w-0 truncate text-sm md:text-base">
        <span className="font-semibold text-foreground">{heading}</span>
        <span className="font-normal text-muted-foreground"> — {sub}</span>
      </span>
    );
    return (
      <aside
        className={cn(
          "overflow-hidden rounded-2xl border border-border bg-card shadow-e2 ring-1 ring-primary/[0.08]",
          className
        )}
        data-product-help-context={context}
        data-help-retrieval-mode={retrievalMode}
        data-help-retrieval-schema-version={
          retrievalMode === "ranked" ? HELP_RETRIEVAL_SCHEMA_VERSION : undefined
        }
      >
        <button
          type="button"
          id={`${panelId}-trigger`}
          aria-expanded={expanded}
          aria-controls={`${panelId}-panel`}
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:gap-4 md:px-5 md:py-3.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary shadow-e1">
            <CircleHelp className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">{summaryLine}</div>
          <ChevronDown
            className={cn(
              "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
            aria-hidden
          />
        </button>
        <div
          id={`${panelId}-panel`}
          role="region"
          aria-labelledby={`${panelId}-trigger`}
          hidden={!expanded}
          className={cn(!expanded && "hidden")}
        >
          <div className="space-y-3 border-t border-border/80 bg-muted/[0.35] px-4 py-4 md:px-5">
            {linkLists}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-2xl border border-border/80 bg-muted/20 p-4 shadow-e1 md:p-5",
        className
      )}
      data-product-help-context={context}
      data-help-retrieval-mode={retrievalMode}
      data-help-retrieval-schema-version={
        retrievalMode === "ranked" ? HELP_RETRIEVAL_SCHEMA_VERSION : undefined
      }
      aria-label={title ?? intro.title}
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CircleHelp className="h-4 w-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {showIntro ? (
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {title ?? intro.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {description ?? intro.description}
              </p>
            </div>
          ) : (
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {title ?? intro.title}
            </h2>
          )}
          {linkLists}
        </div>
      </div>
    </aside>
  );
}
