"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Music2 } from "lucide-react";

import { shellFocusRing } from "@/lib/shell-nav-styles";
import { cn } from "@/lib/utils";

const socialConfig = [
  {
    key: "instagram",
    urlKey: "instagramUrl",
    icon: Instagram,
    label: "Instagram",
    color: "text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300",
  },
  {
    key: "facebook",
    urlKey: "facebookUrl",
    icon: Facebook,
    label: "Facebook",
    color: "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
  },
  {
    key: "twitter",
    urlKey: "twitterUrl",
    icon: Twitter,
    label: "X (Twitter)",
    color: "text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300",
  },
  {
    key: "tiktok",
    urlKey: "tiktokUrl",
    icon: Music2,
    label: "TikTok",
    color: "text-muted-foreground hover:text-foreground",
  },
] as const;

export function SocialLinks({
  instagramUrl,
  facebookUrl,
  twitterUrl,
  tiktokUrl,
}: {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  tiktokUrl?: string | null;
}) {
  const links = [instagramUrl, facebookUrl, twitterUrl, tiktokUrl].filter(Boolean) as string[];

  if (links.length === 0) return null;

  const urls = {
    instagramUrl,
    facebookUrl,
    twitterUrl,
    tiktokUrl,
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {socialConfig.map(({ key, urlKey, icon: Icon, label, color }) => {
        const url = urls[urlKey as keyof typeof urls];
        if (!url) return null;
        return (
          <Link
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm transition-colors",
              "hover:border-primary/30 hover:bg-muted/50",
              shellFocusRing,
              color
            )}
            aria-label={label}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
