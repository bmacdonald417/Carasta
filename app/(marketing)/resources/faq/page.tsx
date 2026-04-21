import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about Carasta, Carmunity, Discussions, auctions, and public support paths.",
};

const faqs = [
  {
    question: "What is Carasta?",
    answer:
      "Carasta is a social automotive platform that combines Carmunity, Discussions, Messages, profiles, Garage identity, live auctions, and seller support in one product.",
  },
  {
    question: "Is Carasta only an auction site?",
    answer:
      "No. Auctions are a major part of the product, but the platform is intentionally broader than a marketplace. Carmunity, Discussions, profiles, and Garage identity are part of the core experience.",
  },
  {
    question: "What does Carmunity mean?",
    answer:
      "Carmunity is Carasta's community layer. It covers the social feed, enthusiast identity, public participation, and the ongoing relationships that should outlive a single listing.",
  },
  {
    question: "Why does the site emphasize Discussions?",
    answer:
      "Discussions is the canonical public term for Carasta's thread-based conversation areas. It better reflects the current product direction and reduces terminology drift.",
  },
  {
    question: "Can I use Carasta without buying or selling right away?",
    answer:
      "Yes. You can explore the Carmunity, follow people, participate in Discussions, and build your profile and Garage identity even if you are not currently in the market.",
  },
  {
    question: "What seller tools exist today?",
    answer:
      "Carasta already has seller-facing workflows and is building toward stronger marketing support, analytics, and AI-assisted tooling. This public phase introduces that story without overbuilding the full workspace in marketing pages.",
  },
];

export default function ResourcesFaqPage() {
  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-12 md:py-20">
      <div className="carasta-container max-w-4xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            FAQ
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-neutral-950 md:text-5xl">
            Quick answers about the public product story.
          </h1>
          <p className="mt-5 text-base leading-7 text-neutral-600 md:text-lg">
            This FAQ is intentionally lightweight for Phase 1. It gives the
            public site a stronger support path now and creates a clean home for
            later trust and knowledge expansion.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map(({ question, answer }) => (
            <div
              key={question}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-neutral-950">
                {question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {answer}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/resources"
            className="inline-flex items-center rounded-2xl bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Back to resources
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-2xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            Contact Carasta
          </Link>
        </div>
      </div>
    </section>
  );
}
