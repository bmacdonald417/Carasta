import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Car,
  Gavel,
  LifeBuoy,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const joinCarmunityHref = `/auth/sign-up?callbackUrl=${encodeURIComponent("/explore")}`;

const pillarCards = [
  {
    title: "Carmunity",
    description:
      "Follow enthusiasts, post updates, and keep up with the cars and people you actually care about.",
    href: "/explore",
    icon: Users,
  },
  {
    title: "Discussions",
    description:
      "Get into focused conversations around projects, ownership, buying, selling, and the stories behind the cars.",
    href: "/discussions",
    icon: MessageSquare,
  },
  {
    title: "Messages",
    description:
      "Move from discovery to direct connection without leaving the platform when a conversation needs to go one-to-one.",
    href: "/auth/sign-in?callbackUrl=%2Fmessages",
    icon: Mail,
  },
  {
    title: "Profiles + Garage",
    description:
      "Show what you own, what you are building, and what belongs in your dream garage with a real enthusiast identity.",
    href: "/auth/sign-in",
    icon: Car,
  },
  {
    title: "Auctions + Sell Tools",
    description:
      "Browse transparent live auctions and seller workflows that support better listings, stronger reach, and more confidence.",
    href: "/sell",
    icon: Gavel,
  },
];

const differentiationCards = [
  {
    title: "Built by enthusiasts",
    description:
      "Carasta is designed for people who care about the details, the stories, and the culture around ownership.",
    icon: BadgeCheck,
  },
  {
    title: "Community beyond the transaction",
    description:
      "Profiles, garage identity, Carmunity, and Discussions give the platform value before, during, and after the sale.",
    icon: Users,
  },
  {
    title: "Transparent auction mechanics",
    description:
      "Reserve visibility, anti-sniping protection, watchlists, and clear bidding flows help the marketplace feel credible.",
    icon: ShieldCheck,
  },
  {
    title: "Seller-intelligent tools",
    description:
      "Carasta is growing beyond basic listings with seller marketing support, planning workflows, and AI-assisted drafting.",
    icon: Sparkles,
  },
];

const howItWorksSteps = [
  {
    title: "Build your identity",
    description:
      "Create your profile, start your Garage, and make it obvious what you own, follow, and care about.",
  },
  {
    title: "Join the Carmunity",
    description:
      "Explore posts, participate in Discussions, and connect with people around the cars and topics that matter to you.",
  },
  {
    title: "Follow the market",
    description:
      "Track auctions, save vehicles, and learn how Carasta keeps bidding and seller presentation easier to understand.",
  },
  {
    title: "Stay connected after the sale",
    description:
      "Messages, profiles, and shared enthusiast identity keep the platform useful long after a listing closes.",
  },
];

const supportCards = [
  {
    title: "How It Works",
    description:
      "See how Carmunity, Discussions, Garages, and auctions fit together across the platform.",
    href: "/how-it-works",
    icon: BookOpen,
  },
  {
    title: "Resources",
    description:
      "Find FAQs, trust pages, and public help paths without sending legal content to the center of the experience.",
    href: "/resources",
    icon: LifeBuoy,
  },
  {
    title: "Contact",
    description:
      "Talk to Carasta about listings, support, partnerships, or questions about the platform.",
    href: "/contact",
    icon: Mail,
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
        {description}
      </p>
    </div>
  );
}

export function CarmunityHero() {
  return (
    <section className="border-b border-border bg-gradient-to-b from-background via-background to-muted/25">
      <div className="carasta-container py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm">
              Carmunity-first. Marketplace-proven. Seller-intelligent.
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              The automotive platform for people who want more than a transaction.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
              Carasta brings Carmunity, Discussions, Messages, profiles, and
              Garage identity together with transparent live auctions and smarter
              seller tools. It is built for enthusiasts who want the social side
              of the hobby and the marketplace to live in the same system.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={joinCarmunityHref}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Join Carmunity
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/discussions"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Explore Discussions
              </Link>
              <Link
                href="/auctions"
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Browse Live Auctions
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-e1 md:p-7">
            <div className="grid gap-4">
              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What Carasta is
                </p>
                <p className="mt-3 text-base leading-7 text-foreground">
                  A social automotive platform where enthusiast identity, live
                  marketplace activity, and seller confidence reinforce each
                  other instead of living on separate islands.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    Social-first core
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Carmunity, Discussions, Messages, profiles, and Garage
                    identity shape the first impression.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    Marketplace proof
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Real auctions and active listings validate the broader
                    product story rather than replacing it.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    Seller intelligence
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Marketing workflows and AI-assisted tools support stronger
                    listings without overpromising.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <p className="text-sm font-semibold text-foreground">
                    Built for enthusiasts
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    The product is designed to be useful before, during, and
                    after the sale.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductPillarsSection() {
  return (
    <section className="border-b border-border bg-muted/30 py-16 md:py-20">
      <div className="carasta-container">
        <SectionHeading
          eyebrow="Platform pillars"
          title="One platform, multiple reasons to come back."
          description="Carasta should make sense whether you are here to post, talk cars, follow auctions, sell intelligently, or keep your identity tied to the hobby."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {pillarCards.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-e1 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Explore
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyCarastaSection() {
  return (
    <section className="border-b border-border bg-background py-16 md:py-20">
      <div className="carasta-container">
        <SectionHeading
          eyebrow="Why Carasta"
          title="A car platform that still feels like it was made by people who actually care."
          description="The strongest parts of Carasta are not just listings. They are the way the platform keeps enthusiast identity, conversation, trust, and transaction quality connected."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {differentiationCards.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-e1"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/why-carasta"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read why Carasta is different
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SellerIntelligenceSection() {
  return (
    <section className="border-b border-border bg-muted/40 py-16 md:py-20">
      <div className="carasta-container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
              Seller tools
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Seller support that goes beyond posting a listing.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Carasta is building toward a stronger seller workspace with
              marketing support, promotion planning, analytics, and AI-assisted
              drafting. This phase keeps that story at teaser level, but it
              should already be clear that sellers have more here than a form
              and a checkout page.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                See seller tools
              </Link>
              <Link
                href={joinCarmunityHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-primary/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start selling
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              "Seller marketing workflows and visibility tools",
              "AI-assisted listing and promotion support",
              "Performance context that can grow with the marketplace",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <p className="text-sm leading-6 text-foreground">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSnapshot() {
  return (
    <section className="border-b border-border bg-muted/30 py-16 md:py-20">
      <div className="carasta-container">
        <SectionHeading
          eyebrow="How it works"
          title="A clearer snapshot of how the platform fits together."
          description="Carasta is not just an auction destination. It is a connected system for identity, community, discovery, marketplace activity, and follow-through."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {howItWorksSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-e1"
            >
              <p className="text-sm font-semibold text-primary">0{index + 1}</p>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Read the full How It Works guide
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function TrustResourcesBand() {
  return (
    <section className="border-t border-border bg-gradient-to-b from-info-soft/25 via-background to-background py-16 md:py-20">
      <div className="carasta-container">
        <SectionHeading
          eyebrow="Support + trust"
          title="Public paths that feel intentional, not bolted on."
          description="This phase adds a clearer support and resource layer so people can understand the platform, get help, and reach Carasta without legal drafts becoming the center of the header."
          centered
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {supportCards.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-2xl border border-border bg-card p-6 shadow-e1 transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-e2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Open
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href={joinCarmunityHref}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Join Carmunity
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
