import { ContactForm } from "./ContactForm";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="min-h-[80vh] bg-[linear-gradient(180deg,#fafaf7_0%,#ffffff_100%)] px-4 py-16 md:py-24">
      <div className="carasta-container grid gap-12 md:grid-cols-2 md:items-start md:gap-16">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/80">
            Contact
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">
            Contact
          </h1>
          <p className="text-lg text-neutral-700">
            Reach Carasta about support, listings, partnerships, or product questions.
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            Whether you are exploring the Carmunity, joining Discussions,
            bidding in auctions, or preparing to sell, this is the public path
            for getting help from the team.
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">
            For partnerships and press inquiries, use the form or email{" "}
            <a
              href="mailto:info@carasta.com"
              className="text-primary hover:underline"
            >
              info@carasta.com
            </a>
            .
          </p>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-950">
              Looking for self-serve help first?
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Start with the public resource layer for FAQs, trust pages, and a
              clearer explanation of how Carasta works.
            </p>
            <Link
              href="/resources"
              className="mt-4 inline-flex text-sm font-semibold text-neutral-900 transition hover:text-primary"
            >
              Visit resources
            </Link>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
            <p className="text-sm font-semibold text-neutral-950">
              Common reasons to contact us
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-600">
              <li>Support questions that are not answered in Resources</li>
              <li>Partnership or press inquiries</li>
              <li>Trust or moderation concerns that need escalation</li>
              <li>Questions about listings, buying, or selling basics</li>
            </ul>
          </div>
        </div>
        <Card className="border-neutral-200 bg-white shadow-sm">
          <div className="p-6 md:p-8">
            <ContactForm />
          </div>
        </Card>
      </div>
    </section>
  );
}
