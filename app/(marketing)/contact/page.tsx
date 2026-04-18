import { ContactForm } from "./ContactForm";
import { Card } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <section className="min-h-[80vh] bg-background px-4 py-16 md:py-24">
      <div className="carasta-container grid gap-12 md:grid-cols-2 md:items-start md:gap-16">
        <div className="space-y-6">
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-neutral-100 md:text-4xl">
            Contact
          </h1>
          <p className="text-lg text-neutral-300">
            Individuals and dealerships are welcome to reach out.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Whether you&apos;re listing a car, bidding in auctions, or
            exploring Carmunity, we&apos;ll get back to you as soon as we can.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For partnerships and press inquiries, use the form or email{" "}
            <a
              href="mailto:info@carasta.com"
              className="text-primary hover:underline"
            >
              info@carasta.com
            </a>
            .
          </p>
        </div>
        <Card className="border-border/60 bg-card/60 shadow-glass-sm">
          <div className="p-6 md:p-8">
            <ContactForm />
          </div>
        </Card>
      </div>
    </section>
  );
}
