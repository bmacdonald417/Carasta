"use client";

import Image from "next/image";

/**
 * Official App Store and Google Play badges.
 * Uses reliable CDN URLs for crisp, high-resolution display.
 */

const APP_STORE_URL = "https://apps.apple.com/us/app/carasta/id6740201534";
const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.hidden_cherry_45273";

// Official badge URLs (Apple Media Services, Google Play)
const APP_STORE_BADGE =
  "https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83&releaseDate=1704067200";
const GOOGLE_PLAY_BADGE =
  "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

/** Same outer box for both stores so layout stays even; art scales with object-contain. */
const badgeLinkBoxClass =
  "flex h-11 w-[148px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-card px-2 py-1.5 transition hover:border-border hover:bg-muted/30 md:h-12 md:w-[158px]";

export function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`${badgeLinkBoxClass} ${className}`.trim()}
      aria-label="Download on the App Store"
    >
      <Image
        src={APP_STORE_BADGE}
        alt="Download on the App Store"
        width={250}
        height={83}
        className="max-h-full max-w-full object-contain object-center"
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
      className={`${badgeLinkBoxClass} ${className}`.trim()}
      aria-label="Get it on Google Play"
    >
      <Image
        src={GOOGLE_PLAY_BADGE}
        alt="Get it on Google Play"
        width={258}
        height={98}
        className="max-h-full max-w-full object-contain object-center"
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
