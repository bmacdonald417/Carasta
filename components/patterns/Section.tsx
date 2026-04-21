import { cn } from "@/lib/utils";
import { Container } from "./Container";

type SectionProps = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Container max width */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  containerClassName,
  maxWidth,
}: SectionProps) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <Container className={containerClassName} maxWidth={maxWidth}>
        {(title || subtitle || action) && (
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              {title && (
                <h2 className="font-display text-2xl font-semibold uppercase tracking-[0.1em] text-foreground md:text-3xl">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="mt-1 text-neutral-400">{subtitle}</p>
              )}
            </div>
            {action}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
