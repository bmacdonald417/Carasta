"use client";

/**
 * Official App Store and Google Play badges (local assets, matched footprint).
 * Artwork: Apple SVG from Apple Media Services API; Google Play PNG from Google static badges.
 * Files live under /public/brand/store-badges/
 */

const APP_STORE_URL = "https://apps.apple.com/us/app/carasta/id6740201534";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.hidden_cherry_45273";

const APPLE_BADGE_SRC = "/brand/store-badges/apple-app-store-en-us.svg";
const GOOGLE_BADGE_SRC = "/brand/store-badges/google-play-en.png";

/** Same outer box; muted shell so black badge art sits cleanly on grey footers. */
const badgeShellClass =
  "flex h-12 w-[168px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/30 px-3 py-2 transition hover:border-border hover:bg-muted/45 md:h-[52px] md:w-[176px]";

export function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${badgeShellClass} ${className}`.trim()}
      aria-label="Download on the App Store"
    >
      <img
        src={APPLE_BADGE_SRC}
        alt="Download on the App Store"
        width={160}
        height={40}
        className="h-8 w-auto max-w-[148px] object-contain object-center md:h-9 md:max-w-[156px]"
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}

export function GooglePlayBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={GOOGLE_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${badgeShellClass} ${className}`.trim()}
      aria-label="Get it on Google Play"
    >
      <img
        src={GOOGLE_BADGE_SRC}
        alt="Get it on Google Play"
        width={180}
        height={54}
        className="h-8 w-auto max-w-[148px] object-contain object-center md:h-9 md:max-w-[156px]"
        loading="lazy"
        decoding="async"
      />
    </a>
  );
}

export function AppStoreBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-start gap-3 ${className}`.trim()}
    >
      <AppStoreBadge />
      <GooglePlayBadge />
    </div>
  );
}
