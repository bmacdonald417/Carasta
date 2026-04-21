import type { ReactNode } from "react";

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
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  relatedLinks?: ResourceLinkItem[];
  relatedTitle?: string;
  relatedDescription?: string;
}) {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-5xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
            {description}
          </p>
        </div>

        <div className="mt-12 space-y-8">{children}</div>

        {relatedLinks && relatedLinks.length > 0 ? (
          <div className="mt-14 rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
                Next steps
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950">
                {relatedTitle}
              </h2>
              <p className="mt-4 text-base leading-7 text-neutral-600">
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
