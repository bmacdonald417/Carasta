import Link from "next/link";

const paths = [
  {
    title: "Understand the product",
    body: "Start with the public product guide, then drill into Carmunity, Discussions, identity, and marketplace mechanics.",
    href: "/how-it-works",
    cta: "Open How It Works",
  },
  {
    title: "Trust, safety, and policies",
    body: "Use the trust layer when you need conduct expectations, moderation context, or the current draft policy structure.",
    href: "/resources/trust-and-safety",
    cta: "Open Trust & Safety",
  },
  {
    title: "Fast answers and vocabulary",
    body: "Use the FAQ for common questions and the glossary when you need consistent definitions across the public site.",
    href: "/resources/faq",
    cta: "Browse the FAQ",
    secondaryHref: "/resources/glossary",
    secondaryCta: "Open the glossary",
  },
] as const;

export function ResourceHubOrientation() {
  return (
    <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 shadow-e1 md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
          Start here
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Pick the path that matches what you are trying to do.
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Carasta is intentionally organized around{" "}
          <span className="font-semibold text-foreground">Carmunity</span> (the
          social layer), <span className="font-semibold text-foreground">Market</span>{" "}
          (auctions and commerce), and{" "}
          <span className="font-semibold text-foreground">Resources</span> (this
          help and trust layer). These entry points keep the public layer
          navigable without turning into a giant docs portal.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {paths.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card p-6 shadow-e1"
          >
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href={item.href}
                className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {item.cta}
              </Link>
              {"secondaryHref" in item ? (
                <Link
                  href={item.secondaryHref}
                  className="inline-flex text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {item.secondaryCta}
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
