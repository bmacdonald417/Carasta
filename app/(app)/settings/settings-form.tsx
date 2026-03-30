"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { Instagram, Facebook, Twitter, Music2 } from "lucide-react";

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

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <Label className="text-neutral-300">Handle</Label>
        <Input
          value={handle}
          disabled
          className="mt-1 border-white/10 bg-white/5 text-neutral-400"
        />
        <p className="text-xs text-neutral-500">Handle cannot be changed.</p>
      </div>
      <div>
        <Label htmlFor="name" className="text-neutral-300">
          Display name
        </Label>
        <Input
          id="name"
          value={n}
          onChange={(e) => setN(e.target.value)}
          className="mt-1 border-white/10 bg-white/5 text-neutral-100"
        />
      </div>
      <div>
        <Label htmlFor="bio" className="text-neutral-300">
          Bio
        </Label>
        <Textarea
          id="bio"
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="mt-1 border-white/10 bg-white/5 text-neutral-100"
        />
      </div>
      <div>
        <Label htmlFor="location" className="text-neutral-300">
          Location
        </Label>
        <Input
          id="location"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="mt-1 border-white/10 bg-white/5 text-neutral-100"
        />
      </div>
      <div>
        <Label htmlFor="avatarUrl" className="text-neutral-300">
          Avatar URL
        </Label>
        <Input
          id="avatarUrl"
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="mt-1 border-white/10 bg-white/5 text-neutral-100"
        />
      </div>

      {/* Connected Accounts */}
      <div className="border-t border-white/10 pt-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-200">
          Connected Accounts
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Add your social profile URLs. They will appear on your public profile.
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Instagram className="h-5 w-5 shrink-0 text-pink-500" />
            <Input
              placeholder="https://instagram.com/username"
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              className="border-white/10 bg-white/5 text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <Facebook className="h-5 w-5 shrink-0 text-blue-500" />
            <Input
              placeholder="https://facebook.com/username"
              value={fb}
              onChange={(e) => setFb(e.target.value)}
              className="border-white/10 bg-white/5 text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <Twitter className="h-5 w-5 shrink-0 text-sky-400" />
            <Input
              placeholder="https://x.com/username"
              value={tw}
              onChange={(e) => setTw(e.target.value)}
              className="border-white/10 bg-white/5 text-neutral-100"
            />
          </div>
          <div className="flex items-center gap-3">
            <Music2 className="h-5 w-5 shrink-0 text-neutral-100" />
            <Input
              placeholder="https://tiktok.com/@username"
              value={tk}
              onChange={(e) => setTk(e.target.value)}
              className="border-white/10 bg-white/5 text-neutral-100"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-neutral-200">
          Email
        </h3>
        <p className="mt-1 text-xs text-neutral-500">
          Weekly summary of your marketing metrics and alerts. Sent only when an
          admin runs the digest job (not instant). Requires email provider setup
          — see docs.
        </p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={digest}
            onChange={(e) => setDigest(e.target.checked)}
            className="mt-1 rounded border-white/20 bg-black/40"
          />
          <span>
            Send me a <strong className="text-neutral-200">weekly</strong>{" "}
            marketing digest at <span className="text-neutral-200">{accountEmail}</span>
          </span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#ff3b5c] text-[#0a0a0f] hover:bg-[#ff3b5c]/90"
      >
        {loading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
