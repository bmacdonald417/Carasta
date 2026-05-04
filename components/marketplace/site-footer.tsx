import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";
import { AppStoreBadges } from "@/components/ui/app-store-badges";
import { getPublicSocialLinks } from "@/lib/marketing/social-links";

const joinHref =
  "/auth/sign-up?callbackUrl=%2Fwelcome%3Fnext%3D%252Fexplore";

const footerProductLinks = [
  { href: "/explore", label: "Carmunity" },
  { href: "/discussions", label: "Discussions" },
  { href: "/auctions", label: "Auctions" },
  { href: "/sell", label: "Sell" },
];

const footerLearnLinks = [
  { href: "/", label: "Home" },
  { href: "/resources", label: "Resources" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/why-carasta", label: "Why Carasta" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  const socialLinks = getPublicSocialLinks();

  return (
    <footer className="mt-auto">
      <div className="relative border-t border-border/60 bg-[hsl(var(--navy))] pt-8 pb-10 text-white md:pt-10 md:pb-12">
        <div className="carasta-container">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] md:gap-10">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src="/brand/carasta/wordmark.png"
                  alt="Carmunity by Carasta"
                  width={180}
                  height={48}
                  className="h-10 object-contain object-left md:h-11"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="carasta-marketing-display text-xl font-semibold tracking-[0.15em] text-white md:text-2xl">
                  Carmunity
                </span>
              </div>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/75">
                Carmunity by Carasta brings discussions, profiles, Garage identity, messaging, auctions, and seller tools into one platform built for enthusiasts.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  href={joinHref}
                  className="rounded-full bg-primary px-4 py-2 font-semibold text-primary-foreground transition hover:bg-[hsl(var(--primary-hover))]"
                >
                  Join Carmunity
                </Link>
                <Link
                  href="/auctions"
                  className="rounded-full border border-white/25 px-4 py-2 font-semibold text-white transition hover:bg-white/10"
                >
                  Live auctions
                </Link>
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Auctions</p>
                <nav className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  {footerProductLinks.map(({ href, label }) => (
                    <Link key={href} href={href} className="transition hover:text-white">
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Sell</p>
                <nav className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  <Link href="/sell" className="transition hover:text-white">
                    List a vehicle
                  </Link>
                  <Link href="/how-it-works" className="transition hover:text-white">
                    Seller basics
                  </Link>
                  <Link href="/resources/faq" className="transition hover:text-white">
                    FAQ
                  </Link>
                </nav>
              </div>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Carmunity</p>
                <nav className="mt-4 flex flex-col gap-3 text-sm text-white/75">
                  {footerLearnLinks.map(({ href, label }) => (
                    <Link key={href} href={href} className="transition hover:text-white">
                      {label}
                    </Link>
                  ))}
                  <Link href="/messages" className="transition hover:text-white">
                    Messages
                  </Link>
                  <Link href="/community-guidelines" className="transition hover:text-white">
                    Community Guidelines
                  </Link>
                </nav>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Company</p>
                {socialLinks.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
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
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/85 transition hover:border-white/40 hover:text-white"
                          aria-label={label}
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    })}
                  </div>
                ) : null}
                <a
                  href="mailto:info@carasta.com"
                  className={`inline-block text-primary-foreground/90 hover:text-white ${socialLinks.length > 0 ? "mt-5" : "mt-4"}`}
                >
                  info@carasta.com
                </a>
                <div className="mt-5">
                  <p className="text-xs text-white/60">Carmunity on mobile</p>
                  <div className="mt-3">
                    <AppStoreBadges />
                  </div>
                  <p className="mt-3 max-w-xs text-[11px] leading-relaxed text-white/60">
                    Same account identity and social graph as the web product, with a narrower surface area for now.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
      </div>
      <div className="border-t border-white/10 bg-[hsl(var(--navy-soft))] py-4 text-white md:py-5">
        <div className="carasta-container flex flex-col items-center justify-between gap-4 md:flex-row md:gap-6">
          <div className="text-center md:text-left">
            <p className="text-sm text-white/75">
              © {new Date().getFullYear()} Carasta. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-white/65">
              Carmunity by Carasta — feed, discussions, garage, and auctions in one place.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm md:justify-end">
            <Link href="/terms" className="text-white/75 transition hover:text-white">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="text-white/75 transition hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/community-guidelines" className="text-white/75 transition hover:text-white">
              Community Guidelines
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
