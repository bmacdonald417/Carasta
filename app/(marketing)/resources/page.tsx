import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Public resources for understanding Carasta, including FAQs, trust pages, platform guidance, and support paths.",
};

const availableResources = [
  {
    title: "How It Works",
    description:
      "Get the public product overview for Carmunity, Discussions, Garage identity, auctions, and seller support.",
    href: "/how-it-works",
    icon: BookOpen,
  },
  {
    title: "FAQ",
    description:
      "Quick answers about what Carasta is, who it is for, and how the public product surfaces fit together.",
    href: "/resources/faq",
    icon: HelpCircle,
  },
  {
    title: "Community Guidelines",
    description:
      "Read the current public conduct and moderation outline for Carmunity and Discussions.",
    href: "/community-guidelines",
    icon: MessageSquare,
  },
  {
    title: "Privacy Policy",
    description:
      "Review the current privacy outline while the full legal drafts continue toward binding publication.",
    href: "/privacy",
    icon: ShieldCheck,
  },
  {
    title: "Terms & Conditions",
    description:
      "See the current terms outline and the public path for questions about platform rules and agreements.",
    href: "/terms",
    icon: FileText,
  },
  {
    title: "Contact",
    description:
      "Reach Carasta about support, listings, partnerships, or questions that do not fit a self-serve article.",
    href: "/contact",
    icon: LifeBuoy,
  },
];

const nextResources = [
  "Buying on Carasta",
  "Selling on Carasta",
  "Platform glossary",
  "Profiles, Garages, and dream garage identity",
];

export default function ResourcesPage() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Resources
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            A cleaner public home for help, trust, and platform understanding.
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
            This phase establishes the public resource layer that the site was
            missing. The goal is simple: make it easier to understand Carasta,
            find support, and access trust pages without turning legal drafts
            into the emotional center of the product.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {availableResources.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-950 text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-neutral-950">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {description}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-neutral-200 bg-neutral-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Next content layer
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-neutral-950">
            The structure is now in place for richer public support content.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">
            Later phases can expand this area with more detailed guides and a
            future assistant knowledge corpus without having to rebuild the
            public navigation again.
          </p>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {nextResources.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
