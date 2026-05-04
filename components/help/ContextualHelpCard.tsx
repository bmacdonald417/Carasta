"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { ChevronDown, CircleHelp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export type ContextualHelpMenuProps = {
  context: ProductHelpContext;
  className?: string;
  /** Override default label from the help map. */
  title?: string;
  description?: string;
  /**
   * Retained for API compatibility; the control is a single trigger line.
   * Description is exposed on the trigger via `aria-label` when present.
   */
  showIntro?: boolean;
  /**
   * `ranked` applies deterministic pathname-aware ordering + optional related links.
   * `static` uses the canonical list order from `product-help.ts` only.
   */
  retrievalMode?: "static" | "ranked";
  maxPrimaryLinks?: number;
  relatedLimit?: number;
  showExcerpts?: boolean;
  /** @deprecated No-op. */
  collapsible?: boolean;
  /** @deprecated No-op. */
  defaultExpanded?: boolean;
  /** Menu panel alignment. */
  menuAlign?: "start" | "center" | "end";
};

export function ContextualHelpMenu({
  context,
  className,
  title,
  description,
  showIntro: _showIntro = true,
  retrievalMode = "ranked",
  maxPrimaryLinks,
  relatedLimit,
  showExcerpts = false,
  collapsible: _collapsible = false,
  defaultExpanded: _defaultExpanded = false,
  menuAlign = "end",
}: ContextualHelpMenuProps) {
  const pathname = usePathname() ?? "";

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
  const label = title ?? intro.title;
  const desc = description ?? intro.description;
  const ariaLabel = desc ? `${label}. ${desc}` : label;

  return (
    <div
      className={cn("flex w-full justify-end", className)}
      data-product-help-context={context}
      data-help-retrieval-mode={retrievalMode}
      data-help-retrieval-schema-version={
        retrievalMode === "ranked" ? HELP_RETRIEVAL_SCHEMA_VERSION : undefined
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 max-w-full gap-2 rounded-full border-primary/25 bg-background/95 px-3 font-semibold text-primary shadow-sm ring-1 ring-primary/10 hover:bg-primary/[0.07] hover:text-primary"
            aria-label={ariaLabel}
          >
            <CircleHelp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0 truncate text-left text-sm">{label}</span>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={menuAlign}
          className="w-[min(100vw-2rem,20rem)]"
        >
          {primary.map((link) => (
            <DropdownMenuItem key={link.topicId} asChild>
              <Link
                href={link.href}
                className="cursor-pointer"
                data-canonical-help-topic={link.topicId}
                data-canonical-help-href={link.href}
                data-help-link-tier="primary"
              >
                {showExcerpts ? (
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span>{link.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {link.excerpt}
                    </span>
                  </span>
                ) : (
                  link.label
                )}
              </Link>
            </DropdownMenuItem>
          ))}
          {related.length > 0 ? (
            <>
              <DropdownMenuSeparator />
              <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Suggested next
              </p>
              {related.map((link) => (
                <DropdownMenuItem key={link.topicId} asChild>
                  <Link
                    href={link.href}
                    className="cursor-pointer text-xs"
                    data-canonical-help-topic={link.topicId}
                    data-help-link-tier="related"
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export type ContextualHelpCardProps = ContextualHelpMenuProps;

export { ContextualHelpMenu as ContextualHelpCard };
