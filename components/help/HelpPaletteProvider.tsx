"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, Library } from "lucide-react";

import { getHelpPaletteModel } from "@/lib/help/help-palette";
import type { ProductHelpLink } from "@/lib/help/product-help";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function isTypingShortcutTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el.isContentEditable) return true;
  return el.closest("[data-skip-help-palette-shortcut='true']") != null;
}

type HelpPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openPalette: () => void;
  closePalette: () => void;
  /** Topic ids from the last assistant-driven open (for row highlighting). */
  assistantHighlightTopicIds: ReadonlySet<string> | null;
  /** Open palette and optionally highlight canonical rows matching assistant citations/routes. */
  openPaletteFromAssistant: (topicIds: string[]) => void;
};

const HelpPaletteContext = createContext<HelpPaletteContextValue | null>(null);

export function useHelpPalette() {
  const ctx = useContext(HelpPaletteContext);
  if (!ctx) {
    throw new Error("useHelpPalette must be used within HelpPaletteProvider");
  }
  return ctx;
}

function PaletteSection({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-2", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      {children}
    </section>
  );
}

function PaletteLinkList({
  links,
  tier,
  highlightTopicIds,
}: {
  links: ProductHelpLink[];
  tier: "primary" | "related" | "global";
  highlightTopicIds: ReadonlySet<string> | null;
}) {
  const { closePalette } = useHelpPalette();
  if (links.length === 0) return null;
  return (
    <ul className="space-y-1">
      {links.map((link) => {
        const highlighted = highlightTopicIds?.has(link.topicId) ?? false;
        return (
          <li key={`${tier}-${link.topicId}`}>
            <Link
              href={link.href}
              onClick={() => closePalette()}
              className={cn(
                "group block rounded-xl border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                highlighted
                  ? "border-primary/40 bg-primary/10 hover:border-primary/50 hover:bg-primary/[0.14]"
                  : "border-transparent hover:border-border hover:bg-muted/40"
              )}
              data-help-palette-tier={tier}
              data-canonical-help-topic={link.topicId}
              data-canonical-help-href={link.href}
              data-assistant-highlight={highlighted ? "true" : undefined}
            >
              <span className="text-sm font-medium text-foreground group-hover:text-primary">
                {link.label}
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                {link.excerpt}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function HelpPaletteProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [assistantHighlightTopicIds, setAssistantHighlightTopicIds] = useState<
    ReadonlySet<string> | null
  >(null);

  const openPalette = useCallback(() => {
    setAssistantHighlightTopicIds(null);
    setOpen(true);
  }, []);

  const openPaletteFromAssistant = useCallback((topicIds: string[]) => {
    const next = topicIds.filter(Boolean);
    setAssistantHighlightTopicIds(next.length > 0 ? new Set(next) : null);
    setOpen(true);
  }, []);

  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      setAssistantHighlightTopicIds(null);
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (!(e.ctrlKey || e.metaKey) || e.key !== "/") return;
      if (isTypingShortcutTarget(e.target)) return;
      e.preventDefault();
      setAssistantHighlightTopicIds(null);
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const model = useMemo(() => getHelpPaletteModel(pathname), [pathname]);

  const ctx = useMemo(
    () => ({
      open,
      setOpen,
      openPalette,
      closePalette,
      assistantHighlightTopicIds,
      openPaletteFromAssistant,
    }),
    [open, openPalette, closePalette, assistantHighlightTopicIds, openPaletteFromAssistant]
  );

  return (
    <HelpPaletteContext.Provider value={ctx}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-h-[min(90vh,640px)] max-w-lg gap-0 overflow-y-auto border-border bg-card p-0 text-foreground shadow-e2"
          data-help-palette="true"
          data-help-palette-schema-version={model.paletteSchema}
          data-help-retrieval-schema-version={model.retrievalSchema}
          data-product-help-context={model.context}
          data-assistant-bridge-version="2x.1"
        >
          <DialogHeader className="border-b border-border bg-muted/20 px-5 py-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Library className="h-5 w-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
                  Quick help
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  Read-only links to canonical Resources and trust pages — not a
                  chat assistant. Press{" "}
                  <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px] text-foreground">
                    Ctrl or ⌘ + /
                  </kbd>{" "}
                  anytime outside text fields.
                </DialogDescription>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">This page</span>{" "}
              <span className="font-mono text-foreground/80">{model.pathname || "/"}</span>
              {model.routeMatched ? (
                <span className="text-muted-foreground">
                  {" "}
                  · mapped help context{" "}
                  <span className="font-mono text-foreground/80">{model.context}</span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {" "}
                  · using general defaults (
                  <span className="font-mono text-foreground/80">{model.context}</span>)
                </span>
              )}
            </p>
            {assistantHighlightTopicIds && assistantHighlightTopicIds.size > 0 ? (
              <p
                className="mt-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-[11px] leading-relaxed text-foreground"
                data-assistant-palette-bridge="true"
              >
                Topics from your last{" "}
                <span className="font-medium">Carasta Assistant</span> reply are highlighted
                below when they match a canonical help row.
              </p>
            ) : null}
          </DialogHeader>

          <div className="space-y-5 px-5 py-4">
            <PaletteSection eyebrow="Suggested for this page">
              <PaletteLinkList
                links={model.primary}
                tier="primary"
                highlightTopicIds={assistantHighlightTopicIds}
              />
            </PaletteSection>

            {model.related.length > 0 ? (
              <PaletteSection eyebrow="Suggested next">
                <PaletteLinkList
                  links={model.related}
                  tier="related"
                  highlightTopicIds={assistantHighlightTopicIds}
                />
              </PaletteSection>
            ) : null}

            <PaletteSection eyebrow="Always useful">
              <PaletteLinkList
                links={model.globalPins}
                tier="global"
                highlightTopicIds={assistantHighlightTopicIds}
              />
            </PaletteSection>

            <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/15 px-3 py-2 text-[11px] text-muted-foreground">
              <CircleHelp className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                For exploratory Q&amp;A, use{" "}
                <span className="font-medium text-foreground">Carasta Assistant</span>{" "}
                — this palette only opens canonical pages.
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </HelpPaletteContext.Provider>
  );
}
