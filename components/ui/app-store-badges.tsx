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

export function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-all duration-300 hover:opacity-90 hover:scale-[1.02] ${className}`}
      aria-label="Download on the App Store"
    >
      <Image
        src={APP_STORE_BADGE}
        alt="Download on the App Store"
        width={250}
        height={83}
        className="h-10 w-auto md:h-11"
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
      className={`inline-block transition-all duration-300 hover:opacity-90 hover:scale-[1.02] ${className}`}
      aria-label="Get it on Google Play"
    >
      <Image
        src={GOOGLE_PLAY_BADGE}
        alt="Get it on Google Play"
        width={258}
        height={98}
        className="h-10 w-auto md:h-11"
      />
    </a>
  );
}

export function AppStoreBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-4 ${className}`}
    >
      <AppStoreBadge />
      <GooglePlayBadge />
    </div>
  );
}
