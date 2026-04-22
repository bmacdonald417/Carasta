import { ContactForm } from "./ContactForm";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function ContactPage() {
  return (
    <section className="min-h-[80vh] bg-background px-4 py-16 md:py-24">
      <div className="carasta-container grid gap-12 md:grid-cols-2 md:items-start md:gap-16">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
            Contact
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Contact
          </h1>
          <p className="text-lg text-muted-foreground">
            Reach Carasta about support, listings, partnerships, or product questions.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Whether you are exploring the Carmunity, joining Discussions,
            bidding in auctions, or preparing to sell, this is the public path
            for getting help from the team.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For partnerships and press inquiries, use the form or email{" "}
            <a
              href="mailto:info@carasta.com"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              info@carasta.com
            </a>
            .
          </p>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-e1">
            <p className="text-sm font-semibold text-foreground">
              Looking for self-serve help first?
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with the public resource layer for FAQs, trust pages, and a
              clearer explanation of how Carasta works.
            </p>
            <Link
              href="/resources"
              className="mt-4 inline-flex text-sm font-semibold text-primary transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Visit resources
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-muted/30 p-5">
            <p className="text-sm font-semibold text-foreground">
              Common reasons to contact us
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
              <li>Support questions that are not answered in Resources</li>
              <li>Partnership or press inquiries</li>
              <li>Trust or moderation concerns that need escalation</li>
              <li>Questions about listings, buying, or selling basics</li>
            </ul>
          </div>
        </div>
        <Card className="border-border bg-card shadow-e1">
          <div className="p-6 md:p-8">
            <ContactForm />
          </div>
        </Card>
      </div>
    </section>
  );
}
