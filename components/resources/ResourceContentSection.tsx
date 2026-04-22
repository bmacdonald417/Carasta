import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ResourceContentSectionProps = {
  as?: ElementType;
  title?: ReactNode;
  titleAs?: "h2" | "h3";
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  /**
   * Visual treatment for nested resource/help surfaces.
   * - default: standard elevated card
   * - muted: softer supporting surface
   * - inset: nested blocks inside a larger section
   */
  surface?: "default" | "muted" | "inset";
  padding?: "md" | "lg";
};

export function ResourceContentSection({
  as: Component = "section",
  title,
  titleAs: TitleComponent = "h2",
  description,
  children,
  className,
  surface = "default",
  padding = "md",
}: ResourceContentSectionProps) {
  const surfaceClass =
    surface === "muted"
      ? "border-border bg-muted/30"
      : surface === "inset"
        ? "border-border bg-muted/20"
        : "border-border bg-card shadow-e1";

  const paddingClass = padding === "lg" ? "p-8 md:p-10" : "p-6";

  return (
    <Component
      className={cn("rounded-2xl border", surfaceClass, paddingClass, className)}
    >
      {title ? (
        <TitleComponent className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </TitleComponent>
      ) : null}
      {description ? (
        <div className={cn(title ? "mt-4" : null, "text-sm leading-6 text-muted-foreground")}>
          {description}
        </div>
      ) : null}
      {title || description ? <div className="mt-6">{children}</div> : children}
    </Component>
  );
}
