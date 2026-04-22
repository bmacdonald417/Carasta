import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import type { ResourceLinkItem } from "./resource-links";
import { ResourceCardGrid } from "./ResourceCardGrid";

export function ResourcePageLayout({
  eyebrow,
  title,
  description,
  children,
  relatedLinks,
  relatedTitle = "Related resources",
  relatedDescription = "Continue through the public help layer with the guides most relevant to this topic.",
  backHref = "/resources",
  backLabel = "All resources",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  relatedLinks?: ResourceLinkItem[];
  relatedTitle?: string;
  relatedDescription?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <section className="min-h-screen bg-background px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="mb-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {backLabel}
          </Link>
        </div>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg">
            {description}
          </p>
        </div>

        <div className="mt-12 space-y-8">{children}</div>

        {relatedLinks && relatedLinks.length > 0 ? (
          <div className="mt-14 rounded-2xl border border-border bg-muted/30 p-8 shadow-e1 md:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
                Next steps
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                {relatedTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                {relatedDescription}
              </p>
            </div>
            <div className="mt-8">
              <ResourceCardGrid items={relatedLinks} compact />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
