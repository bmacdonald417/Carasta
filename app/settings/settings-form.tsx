"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "./actions";
import { useToast } from "@/components/ui/use-toast";

export function SettingsForm({
  handle,
  name,
  bio,
  location,
  avatarUrl,
}: {
  handle: string;
  name: string;
  bio: string;
  location: string;
  avatarUrl: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio);
  const [loc, setLoc] = useState(location);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("name", n);
    formData.set("bio", b);
    formData.set("location", loc);
    formData.set("avatarUrl", avatar);
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
        <Label>Handle</Label>
        <Input value={handle} disabled className="mt-1 bg-muted" />
        <p className="text-xs text-muted-foreground">Handle cannot be changed.</p>
      </div>
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input
          id="name"
          value={n}
          onChange={(e) => setN(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={loc}
          onChange={(e) => setLoc(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          type="url"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
