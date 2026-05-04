"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Facebook, Instagram, Music2, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

import { updateProfile } from "./actions";

export function SettingsForm({
  handle,
  accountEmail,
  name,
  bio,
  location,
  avatarUrl,
  instagramUrl,
  facebookUrl,
  twitterUrl,
  tiktokUrl,
  weeklyMarketingDigestOptIn,
}: {
  handle: string;
  accountEmail: string;
  name: string;
  bio: string;
  location: string;
  avatarUrl: string;
  instagramUrl?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  tiktokUrl?: string;
  weeklyMarketingDigestOptIn: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio);
  const [loc, setLoc] = useState(location);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [ig, setIg] = useState(instagramUrl ?? "");
  const [fb, setFb] = useState(facebookUrl ?? "");
  const [tw, setTw] = useState(twitterUrl ?? "");
  const [tk, setTk] = useState(tiktokUrl ?? "");
  const [digest, setDigest] = useState(weeklyMarketingDigestOptIn);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("name", n);
    formData.set("bio", b);
    formData.set("location", loc);
    formData.set("avatarUrl", avatar);
    formData.set("instagramUrl", ig);
    formData.set("facebookUrl", fb);
    formData.set("twitterUrl", tw);
    formData.set("tiktokUrl", tk);
    if (digest) formData.set("weeklyMarketingDigestOptIn", "on");
    const result = await updateProfile(formData);
    setLoading(false);
    if (result.ok) {
      toast({ title: "Profile updated" });
      router.refresh();
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  const socialIconClass = "h-5 w-5 shrink-0 text-muted-foreground";

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="settings-handle" className="text-foreground">
          Handle
        </Label>
        <Input id="settings-handle" value={handle} disabled readOnly />
        <p className="text-xs text-muted-foreground">Handle cannot be changed.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-foreground">
          Display name
        </Label>
        <Input id="name" value={n} onChange={(e) => setN(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio" className="text-foreground">
          Bio
        </Label>
        <Textarea id="bio" value={b} onChange={(e) => setB(e.target.value)} rows={4} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location" className="text-foreground">
          Location
        </Label>
        <Input id="location" value={loc} onChange={(e) => setLoc(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="avatarUrl" className="text-foreground">
          Avatar URL
        </Label>
        <div className="flex items-start gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar preview"
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0"; }}
                onLoad={(e) => { (e.target as HTMLImageElement).style.opacity = "1"; }}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-lg text-muted-foreground">👤</span>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            <Input
              id="avatarUrl"
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://…"
            />
            <p className="text-xs text-muted-foreground">Paste a public image URL. Preview updates live.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Connected accounts
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Social profile URLs appear on your public profile when set.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Instagram className={socialIconClass} aria-hidden />
            <Input
              placeholder="https://instagram.com/username"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              aria-label="Instagram URL"
            />
          </div>
          <div className="flex items-center gap-3">
            <Facebook className={socialIconClass} aria-hidden />
            <Input
              placeholder="https://facebook.com/username"
              value={fb}
              onChange={(e) => setFb(e.target.value)}
              aria-label="Facebook URL"
            />
          </div>
          <div className="flex items-center gap-3">
            <Twitter className={socialIconClass} aria-hidden />
            <Input
              placeholder="https://x.com/username"
              value={tw}
              onChange={(e) => setTw(e.target.value)}
              aria-label="X (Twitter) URL"
            />
          </div>
          <div className="flex items-center gap-3">
            <Music2 className={socialIconClass} aria-hidden />
            <Input
              placeholder="https://tiktok.com/@username"
              value={tk}
              onChange={(e) => setTk(e.target.value)}
              aria-label="TikTok URL"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-border pt-6">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Email</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Weekly summary of marketing metrics and alerts. Sent only when an admin runs
            the digest job (not instant). Requires email provider setup — see docs.
          </p>
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm text-foreground transition hover:bg-muted/30">
          <input
            type="checkbox"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
            className={cn(
              "mt-0.5 size-4 shrink-0 rounded border border-input bg-background",
              "text-primary accent-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          />
          <span className="text-muted-foreground">
            Send me a <span className="font-medium text-foreground">weekly</span> marketing
            digest at <span className="font-medium text-foreground">{accountEmail}</span>
          </span>
        </label>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} variant="default">
          {loading ? "Saving…" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
