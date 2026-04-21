"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getOrCreateMarketingVisitorKey,
  sendMarketingTrack,
} from "@/lib/marketing/send-marketing-track";

const SHARE_LINKS = {
  twitter: (url: string, text: string) =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  facebook: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  linkedin: (url: string, text: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
};

function fireCarmunityShareEvent(meta: Record<string, unknown>) {
  void fetch("/api/carmunity/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "share_action", meta }),
    keepalive: true,
  });
}

export function ShareButtons({
  url,
  title,
  description,
  auctionId,
  trackMarketing = false,
  triggerClassName,
  carmunityShareMeta,
}: {
  url: string;
  title: string;
  description?: string;
  /** When set with `trackMarketing`, records SHARE_CLICK for auction analytics. */
  auctionId?: string;
  trackMarketing?: boolean;
  /** Optional classes for the trigger button (e.g. Carmunity copper outline). */
  triggerClassName?: string;
  /** Lightweight Carmunity share attribution (Phase L). */
  carmunityShareMeta?: Record<string, unknown>;
}) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const shareText = description ? `${title} — ${description}` : title;
  const captionBlock = `${title}\n${fullUrl}`;

  function emitShareClick(shareTarget: string) {
    if (!trackMarketing || !auctionId) return;
    const vk = getOrCreateMarketingVisitorKey();
    sendMarketingTrack({
      auctionId,
      eventType: "SHARE_CLICK",
      visitorKey: vk || undefined,
      metadata: {
        shareTarget,
        currentUrl: typeof window !== "undefined" ? window.location.href : undefined,
        referrer:
          typeof document !== "undefined" && document.referrer ? document.referrer : undefined,
        path: typeof window !== "undefined" ? window.location.pathname : undefined,
      },
    });
  }

  async function copyLink() {
    emitShareClick("copy_link");
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (carmunityShareMeta) {
        fireCarmunityShareEvent({ ...carmunityShareMeta, channel: "copy_link" });
      }
    } catch {
      /* noop */
    }
  }

  async function copyForInstagram() {
    emitShareClick("instagram_copy");
    try {
      await navigator.clipboard.writeText(captionBlock);
      if (carmunityShareMeta) fireCarmunityShareEvent({ ...carmunityShareMeta, channel: "instagram_copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  async function copyForTikTok() {
    emitShareClick("tiktok_copy");
    try {
      await navigator.clipboard.writeText(`${shareText}\n${fullUrl}`);
      if (carmunityShareMeta) fireCarmunityShareEvent({ ...carmunityShareMeta, channel: "tiktok_copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  async function copyForSnapchat() {
    emitShareClick("snapchat_copy");
    try {
      await navigator.clipboard.writeText(fullUrl);
      if (carmunityShareMeta) fireCarmunityShareEvent({ ...carmunityShareMeta, channel: "snapchat_copy" });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  }

  function emitCarmunitySocial(channel: string) {
    if (carmunityShareMeta) {
      fireCarmunityShareEvent({ ...carmunityShareMeta, channel });
    }
  }

  async function shareNative() {
    if (typeof navigator === "undefined" || !navigator.share) return;
    emitShareClick("native_share");
    emitCarmunitySocial("native_share");
    try {
      await navigator.share({ title, text: shareText, url: fullUrl });
    } catch {
      /* user cancelled */
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={
            triggerClassName ??
            "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-foreground"
          }
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[220px] border-white/10 bg-[#121218]/95 backdrop-blur-xl"
      >
        {typeof navigator !== "undefined" && typeof navigator.share === "function" ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                void shareNative();
              }}
            >
              Share via device…
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <a
            href={SHARE_LINKS.twitter(fullUrl, shareText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              emitShareClick("twitter");
              emitCarmunitySocial("twitter");
            }}
          >
            Share on X
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={SHARE_LINKS.facebook(fullUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              emitShareClick("facebook");
              emitCarmunitySocial("facebook");
            }}
          >
            Share on Facebook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={SHARE_LINKS.linkedin(fullUrl, shareText)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              emitShareClick("linkedin");
              emitCarmunitySocial("linkedin");
            }}
          >
            Share on LinkedIn
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-xs text-muted-foreground"
          onClick={() => void copyForInstagram()}
        >
          Copy for Instagram (title + link)
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-xs text-muted-foreground"
          onClick={() => void copyForTikTok()}
        >
          Copy for TikTok (caption + link)
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer text-xs text-muted-foreground"
          onClick={() => void copyForSnapchat()}
        >
          Copy link for Snapchat
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void copyLink()}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
