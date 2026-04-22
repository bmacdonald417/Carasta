import type { Metadata } from "next";

import { ResourcePageLayout } from "@/components/resources/ResourcePageLayout";
import { pickResourceLinks } from "@/components/resources/resource-links";

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
  {
    question: "How do profiles and Garage fit into the platform?",
    answer:
      "Profiles and Garage are part of Carasta's identity model. They help people show what they own, what they follow, and how they participate in the broader enthusiast ecosystem.",
  },
  {
    question: "What role do Messages play?",
    answer:
      "Messages support one-to-one communication when a public conversation needs to become direct. They are part of the platform story, even though some support and trust content remains web-first.",
  },
  {
    question: "Where should I go for help or trust questions?",
    answer:
      "Start with Resources for the product guides, glossary, and trust pages. If you still need help, use the contact page to reach the Carasta team.",
  },
  {
    question: "Are the Terms and Privacy pages final legal documents?",
    answer:
      "No. They are still draft public structures pending legal review. They are written to clarify current expectations and support paths, not to overstate legal finality.",
  },
];

export default function ResourcesFaqPage() {
  return (
    <ResourcePageLayout
      eyebrow="FAQ"
      title="Quick answers about the platform, trust layer, and product language."
      description="This FAQ is written to be useful for both visitors and future assistant retrieval. It keeps the core Carasta concepts short, direct, and low-ambiguity."
      relatedLinks={pickResourceLinks([
        "/resources/what-is-carasta",
        "/resources/glossary",
        "/resources/trust-and-safety",
        "/contact",
      ])}
    >
        <div className="mt-12 space-y-4">
          {faqs.map(({ question, answer }) => (
            <div
              key={question}
              className="rounded-2xl border border-border bg-card p-6 shadow-e1"
            >
              <h2 className="text-xl font-semibold text-foreground">
                {question}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {answer}
              </p>
            </div>
          ))}
        </div>
    </ResourcePageLayout>
  );
}
