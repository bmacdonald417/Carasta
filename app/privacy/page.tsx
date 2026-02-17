export default function PrivacyPage() {
  return (
    <section className="bg-carasta-bg px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold text-carasta-ink md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-carasta-muted">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>
        <div className="mt-12 space-y-6 font-serif text-carasta-muted leading-relaxed">
          <p>
            This is a placeholder. Carasta will publish its full Privacy Policy
            here, including how we collect, use, and protect your data when you
            use our auction platform and Carmunity features.
          </p>
          <p>
            For privacy-related questions, contact us at{" "}
            <a
              href="mailto:info@carasta.com"
              className="text-carasta-ink underline hover:no-underline"
            >
              info@carasta.com
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
