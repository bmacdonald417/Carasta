import Link from "next/link";

/* ========== A) HERO ========== */
function Hero() {
  return (
    <section className="bg-carasta-bg px-4 pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="carasta-container text-center">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-carasta-ink md:text-5xl lg:text-6xl xl:text-7xl">
          Built by Enthusiasts, for Enthusiasts.
        </h1>
        <p className="mt-6 text-xl text-carasta-muted md:text-2xl">
          A better online car auction experience…Finally!
        </p>
        <p className="mt-2 text-lg text-carasta-muted">
          Smart features, and connected Carmunity, centered around car culture.
        </p>
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://placehold.co/960x480/1a1a1a/888888?text=Carasta+App+on+Devices"
              alt="Carasta app on devices"
              className="w-full object-contain"
              width={960}
              height={480}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== B) WHAT IS CARASTA ========== */
function WhatIsCarasta() {
  return (
    <section className="bg-carasta-bg py-16 md:py-24">
      <div className="carasta-container grid gap-12 md:grid-cols-2 md:gap-16 md:items-center">
        <div className="relative aspect-[3/4] max-h-[560px] overflow-hidden rounded-lg bg-gradient-to-br from-carasta-muted to-carasta-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://placehold.co/400x600/1a1a1a/888888?text=Carasta"
            alt="Phone in hand"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="font-serif text-3xl font-semibold leading-tight text-carasta-ink md:text-4xl lg:text-5xl">
            What is Carasta?
          </h2>
          <p className="mt-4 text-xl font-medium text-carasta-muted">
            A Better Online Car Auction Experience- Finally.
          </p>
          <p className="mt-1 text-lg text-carasta-muted">
            Built for Enthusiasts.
          </p>
          <p className="mt-6 text-carasta-muted leading-relaxed">
            Carasta brings together a premium car auction experience with a
            social Carmunity of enthusiasts. List your car, bid with confidence
            with smart tools like reserve meters and anti-sniping, and connect
            with collectors who share your passion.
          </p>
          <ul className="mt-8 space-y-3 text-carasta-muted">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-carasta-ink" />
              Live auctions with transparent bidding
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-carasta-ink" />
              Carmunity feed and profiles
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-carasta-ink" />
              Garage &amp; Dream Garage
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-carasta-ink" />
              List, browse, bid &amp; buy in one place
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ========== C) WHY CARASTA IS DIFFERENT — 4 cards ========== */
const whyCards = [
  {
    icon: (
      <svg className="h-14 w-14 text-carasta-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" />
      </svg>
    ),
    title: "Designed for Enthusiasts",
    body: "Every feature is built around car culture and the way collectors actually buy and sell.",
  },
  {
    icon: (
      <svg className="h-14 w-14 text-carasta-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    title: "Transparent Auctions",
    body: "Reserve meters, clear rules, and anti-sniping so you can bid with confidence.",
  },
  {
    icon: (
      <svg className="h-14 w-14 text-carasta-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: "Garage & Dream Garage",
    body: "Showcase what you own and what you want. Connect with others who get it.",
  },
  {
    icon: (
      <svg className="h-14 w-14 text-carasta-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "List, Bid & Buy",
    body: "Sell your car with optional reserve and buy-now. Bid with quick increments or set an auto-bid.",
  },
];

function WhyDifferent() {
  return (
    <section className="bg-carasta-bg py-16 md:py-24">
      <div className="carasta-container">
        <h2 className="font-serif text-3xl font-semibold text-carasta-ink md:text-4xl lg:text-5xl">
          Why Carasta is Different?
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {whyCards.map((card, i) => (
            <div
              key={i}
              className="carasta-card flex flex-col items-center text-center"
            >
              <div className="flex justify-center">{card.icon}</div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-carasta-ink">
                {card.title}
              </h3>
              <p className="mt-3 text-sm text-carasta-muted leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== D) HOW CARASTA WORKS — 3 cards ========== */
const howCards = [
  {
    title: "Create your Profile",
    bullets: [
      "Sign up in seconds with email or Google.",
      "Add your handle, bio, and location.",
      "Start following other enthusiasts.",
    ],
  },
  {
    title: "Explore the Carmunity",
    bullets: [
      "Post photos and updates.",
      "Like and comment on others’ posts.",
      "Build your Garage and Dream Garage.",
    ],
  },
  {
    title: "List, Browse, Bid & Buy",
    bullets: [
      "List your car with reserve or buy-now.",
      "Bid with $250 increments or set auto-bid.",
      "Buy now when available (first 24h).",
    ],
  },
];

function HowItWorks() {
  return (
    <section className="bg-carasta-bg py-16 md:py-24">
      <div className="carasta-container">
        <h2 className="font-serif text-3xl font-semibold text-carasta-ink md:text-4xl lg:text-5xl">
          How Carasta Works?
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {howCards.map((card, i) => (
            <div key={i} className="carasta-card">
              <div className="flex justify-center">
                <svg
                  className="h-12 w-12 text-carasta-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.2}
                >
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-6 font-serif text-xl font-semibold text-carasta-ink">
                {card.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-carasta-muted">
                {card.bullets.map((b, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-carasta-muted" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ========== E) FOLLOW US ON SOCIAL ========== */
function FollowSocial() {
  const socialLinks = [
    { name: "Instagram", href: "https://instagram.com/carasta", icon: "instagram" },
    { name: "Facebook", href: "https://facebook.com/carasta", icon: "facebook" },
    { name: "YouTube", href: "https://youtube.com/carasta", icon: "youtube" },
    { name: "TikTok", href: "https://tiktok.com/@carasta", icon: "tiktok" },
  ];

  return (
    <section className="bg-carasta-bg py-16 md:py-24">
      <div className="carasta-container">
        <h2 className="text-center font-serif text-3xl font-semibold text-carasta-ink md:text-4xl lg:text-5xl">
          Follow us on Social
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16 md:items-start">
          <div>
            <div className="relative aspect-square max-w-md overflow-hidden rounded-lg bg-carasta-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://placehold.co/400x400/1a1a1a/888888?text=Carasta+Community"
                alt="Carasta community"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-4 text-sm text-carasta-muted">
              Join the Carmunity. Share your builds and connect with enthusiasts.
            </p>
          </div>
          <div>
            <div className="overflow-hidden rounded-lg border border-carasta-border bg-carasta-card-bg p-4 shadow-sm">
              <h3 className="font-serif text-lg font-semibold text-carasta-ink">
                Why Carasta?
              </h3>
              <div className="mt-4 aspect-video w-full overflow-hidden rounded bg-carasta-ink/10">
                <iframe
                  title="Why Carasta"
                  src="https://www.youtube.com/embed/PB3J1s_ARqU"
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-lg bg-carasta-ink text-carasta-white transition-opacity hover:opacity-90"
                  aria-label={name}
                >
                  <span className="text-xs font-medium">{name.slice(0, 1)}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== HOME PAGE ========== */
export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatIsCarasta />
      <WhyDifferent />
      <HowItWorks />
      <FollowSocial />
      {/* Footer is in CarastaLayout */}
    </>
  );
}
