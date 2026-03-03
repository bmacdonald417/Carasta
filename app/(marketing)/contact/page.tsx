import { ContactForm } from "./ContactForm";

export default function ContactPage() {
  return (
    <section className="min-h-[80vh] bg-carasta-blue px-4 py-16 text-carasta-white md:py-24">
      <div className="carasta-container grid gap-12 md:grid-cols-2 md:gap-16 md:items-start">
        <div>
          <h1 className="font-serif text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            Contact Us
          </h1>
          <p className="mt-6 text-xl text-carasta-white/95">
            Individuals &amp; Dealerships are encouraged to Join.
          </p>
          <p className="mt-4 text-carasta-white/90 leading-relaxed">
            Whether you&apos;re looking to list a car, bid on an auction, or
            connect with the Carmunity, we&apos;re here to help. Reach out and
            we&apos;ll get back to you as soon as we can.
          </p>
          <p className="mt-4 text-carasta-white/90 leading-relaxed">
            For partnerships and press inquiries, please use the form or email
            us directly at info@carasta.com.
          </p>
        </div>
        <div className="rounded-lg bg-carasta-white/5 p-6 backdrop-blur-sm md:p-8">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
