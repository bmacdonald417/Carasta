/**
 * Official Carmunity social URLs — only surfaces links when env is set.
 * Set in `.env` (optional): NEXT_PUBLIC_CARMUNITY_INSTAGRAM_URL, etc.
 */

export type PublicSocialKey = "instagram" | "youtube" | "facebook";

export type PublicSocialLink = {
  key: PublicSocialKey;
  href: string;
};

export function getPublicSocialLinks(): PublicSocialLink[] {
  const pairs: Array<[PublicSocialKey, string | undefined]> = [
    ["instagram", process.env.NEXT_PUBLIC_CARMUNITY_INSTAGRAM_URL],
    ["youtube", process.env.NEXT_PUBLIC_CARMUNITY_YOUTUBE_URL],
    ["facebook", process.env.NEXT_PUBLIC_CARMUNITY_FACEBOOK_URL],
  ];
  const out: PublicSocialLink[] = [];
  for (const [key, raw] of pairs) {
    const href = raw?.trim();
    if (href) out.push({ key, href });
  }
  return out;
}
