"use client";

import Link from "next/link";
import { Instagram, Facebook, Twitter, Music2 } from "lucide-react";

const socialConfig = [
  {
    key: "instagram",
    urlKey: "instagramUrl",
    icon: Instagram,
    label: "Instagram",
    color: "text-pink-500 hover:text-pink-400",
  },
  {
    key: "facebook",
    urlKey: "facebookUrl",
    icon: Facebook,
    label: "Facebook",
    color: "text-blue-500 hover:text-blue-400",
  },
  {
    key: "twitter",
    urlKey: "twitterUrl",
    icon: Twitter,
    label: "X (Twitter)",
    color: "text-sky-400 hover:text-sky-300",
  },
  {
    key: "tiktok",
    urlKey: "tiktokUrl",
    icon: Music2,
    label: "TikTok",
    color: "text-neutral-300 hover:text-white",
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
  const links = [
    instagramUrl,
    facebookUrl,
    twitterUrl,
    tiktokUrl,
  ].filter(Boolean) as string[];

  if (links.length === 0) return null;

  const urls = {
    instagramUrl,
    facebookUrl,
    twitterUrl,
    tiktokUrl,
  };

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {socialConfig.map(({ key, urlKey, icon: Icon, label, color }) => {
        const url = urls[urlKey as keyof typeof urls];
        if (!url) return null;
        return (
          <Link
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition hover:border-[#ff3b5c]/30 hover:bg-white/10 ${color}`}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
