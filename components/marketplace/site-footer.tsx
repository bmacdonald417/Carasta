import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { AppStoreBadges } from "@/components/ui/app-store-badges";
import { getPublicSocialLinks } from "@/lib/marketing/social-links";

const joinHref = "/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore";

const footerCols = [
  {
    heading: "Auctions",
    links: [
      { href: "/auctions", label: "Live Auctions" },
      { href: "/auctions?filter=ending-soon", label: "Ending Soon" },
      { href: "/auctions?filter=no-reserve", label: "No Reserve" },
      { href: "/sell", label: "List a Vehicle" },
      { href: "/how-it-works", label: "How Bidding Works" },
    ],
  },
  {
    heading: "Carmunity",
    links: [
      { href: "/explore", label: "Feed" },
      { href: "/discussions", label: "Discussions" },
      { href: "/messages", label: "Messages" },
      { href: "/garage/add", label: "Add to Garage" },
      { href: "/community-guidelines", label: "Community Guidelines" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/why-carasta", label: "About Carasta" },
      { href: "/resources", label: "Resources" },
      { href: "/resources/faq", label: "FAQ" },
      { href: "/resources/trust-and-safety", label: "Trust & Safety" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/community-guidelines", label: "Community Guidelines" },
    ],
  },
];

const trustBadges = [
  { label: "Transparent Bidding", icon: "🔒" },
  { label: "Verified Sellers", icon: "✓" },
  { label: "Enthusiast-Built", icon: "🏎" },
];

export function SiteFooter() {
  const socialLinks = getPublicSocialLinks();

  return (
    <footer className="mt-auto">
      {/* Main footer body */}
      <div className="border-t border-border/60 bg-[hsl(var(--navy))] pt-12 pb-10 text-white">
        <div className="carasta-container">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] lg:gap-8">

            {/* Brand column */}
            <div className="space-y-6 lg:pr-4">
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src="/brand/carasta/logo-circle.png"
                    alt="Carmunity by Carasta"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="carasta-marketing-display text-xl font-semibold tracking-[0.15em] text-white">
                    Carmunity
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-white/65">
                  The social-first platform for buying, selling, and celebrating extraordinary cars. Auctions, community, and seller tools — all in one.
                </p>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2">
                {trustBadges.map(({ label, icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-medium text-white/75"
                  >
                    <span className="text-xs">{icon}</span>
                    {label}
                  </span>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href={joinHref}
                  className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition hover:bg-[hsl(var(--primary-hover))]"
                >
                  Join Carmunity
                </Link>
                <Link
                  href="/auctions"
                  className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-white transition hover:bg-white/8"
                >
                  Live auctions
                </Link>
              </div>

              {/* Social icons */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(({ key, href }) => {
                    const Icon =
                      key === "instagram" ? Instagram : key === "youtube" ? Youtube : Facebook;
                    const label =
                      key === "instagram" ? "Instagram" : key === "youtube" ? "YouTube" : "Facebook";
                    return (
                      <a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                        aria-label={label}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                  {/* TikTok */}
                  <a
                    href="https://tiktok.com/@carasta"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-white/35 hover:text-white"
                    aria-label="TikTok"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.84a8.18 8.18 0 0 0 4.78 1.52V6.92a4.85 4.85 0 0 1-1.01-.23z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>

            {/* Link columns */}
            {footerCols.map(({ heading, links }) => (
              <div key={heading}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                  {heading}
                </p>
                <nav className="flex flex-col gap-2.5">
                  {links.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className="text-sm text-white/65 transition hover:text-white"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}
          </div>

          {/* App store + contact row */}
          <div className="mt-10 flex flex-wrap items-start justify-between gap-6 border-t border-white/8 pt-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45 mb-3">
                Carmunity on mobile
              </p>
              <AppStoreBadges />
              <p className="mt-2.5 max-w-xs text-[11px] leading-relaxed text-white/45">
                Same account, garage, and social graph as the web platform.
              </p>
            </div>
            <div className="text-sm text-white/55">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/45 mb-3">Get in touch</p>
              <a href="mailto:info@carasta.com" className="text-white/70 transition hover:text-white">
                info@carasta.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8 bg-[hsl(var(--navy-soft))] py-4">
        <div className="carasta-container flex flex-col items-center justify-between gap-3 text-xs text-white/50 md:flex-row">
          <p>© {new Date().getFullYear()} Carasta. All rights reserved. Carmunity by Carasta.</p>
          <nav className="flex flex-wrap justify-center gap-5 md:justify-end">
            <Link href="/terms" className="transition hover:text-white/80">Terms</Link>
            <Link href="/privacy" className="transition hover:text-white/80">Privacy</Link>
            <Link href="/community-guidelines" className="transition hover:text-white/80">Guidelines</Link>
            <Link href="/contact" className="transition hover:text-white/80">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
