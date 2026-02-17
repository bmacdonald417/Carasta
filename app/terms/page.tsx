export default function TermsPage() {
  return (
    <section className="bg-carasta-bg px-4 py-16 md:py-24">
      <div className="carasta-container max-w-3xl">
        <h1 className="font-serif text-4xl font-semibold text-carasta-ink md:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 text-carasta-muted">
          Last updated: {new Date().toLocaleDateString("en-US")}
        </p>
        <div className="mt-12 space-y-6 font-serif text-carasta-muted leading-relaxed">
          <p>
            This is a placeholder. Carasta will publish full Terms &amp;
            Conditions here. By using the Carasta platform you agree to conduct
            yourself in accordance with our community guidelines and applicable
            laws.
          </p>
          <p>
            For questions about these terms, please contact us at{" "}
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
