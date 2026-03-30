"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MarketingCampaignStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import type { SellerAuctionOption } from "@/lib/marketing/get-seller-campaigns";
import type { MarketingCampaignType } from "@/lib/validations/campaign";
import {
  createMarketingCampaign,
  updateMarketingCampaign,
} from "@/app/(app)/u/[handle]/marketing/campaigns/actions";

function formatDatetimeLocalValue(d: Date | null): string {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export function CampaignForm({
  handle,
  mode,
  auctions,
  campaign,
  defaultAuctionId,
}: {
  handle: string;
  mode: "create" | "edit";
  auctions: SellerAuctionOption[];
  /** Pre-select listing on create (e.g. from auction drill-down). */
  defaultAuctionId?: string | null;
  campaign?: {
    id: string;
    name: string;
    auctionId: string;
    type: string;
    status: MarketingCampaignStatus;
    startAt: Date | null;
    endAt: Date | null;
  };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(campaign?.name ?? "");
  const initialAuction =
    campaign?.auctionId ??
    (defaultAuctionId &&
    auctions.some((a) => a.id === defaultAuctionId)
      ? defaultAuctionId
      : null) ??
    auctions[0]?.id ??
    "";
  const [auctionId, setAuctionId] = useState(initialAuction);
  const [type, setType] = useState<MarketingCampaignType>(
    (campaign?.type as MarketingCampaignType) ?? "social"
  );
  const [status, setStatus] = useState<MarketingCampaignStatus>(
    campaign?.status ?? MarketingCampaignStatus.DRAFT
  );
  const [startAt, setStartAt] = useState(formatDatetimeLocalValue(campaign?.startAt ?? null));
  const [endAt, setEndAt] = useState(formatDatetimeLocalValue(campaign?.endAt ?? null));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.set("name", name);
    fd.set("auctionId", auctionId);
    fd.set("type", type);
    fd.set("status", status);
    if (startAt.trim()) fd.set("startAt", startAt);
    if (endAt.trim()) fd.set("endAt", endAt);

    const result =
      mode === "create"
        ? await createMarketingCampaign(handle, fd)
        : await updateMarketingCampaign(handle, campaign!.id, fd);

    setLoading(false);
    if (result.ok) {
      toast({ title: mode === "create" ? "Campaign created" : "Campaign updated" });
      router.push(`/u/${handle}/marketing/campaigns`);
      router.refresh();
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  if (auctions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
        <p className="font-medium text-neutral-200">You need a listing first</p>
        <p className="mt-2 text-sm text-neutral-500">
          Create an auction, then you can attach a campaign to it.
        </p>
        <Button className="mt-6" asChild variant="secondary">
          <Link href="/sell">Start selling</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <Label htmlFor="campaign-name" className="text-neutral-300">
          Campaign name
        </Label>
        <Input
          id="campaign-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 border-white/10 bg-white/5 text-neutral-100"
          placeholder="e.g. Instagram launch week"
          maxLength={200}
          required
        />
      </div>

      <div>
        <Label className="text-neutral-300">Listing</Label>
        <Select value={auctionId} onValueChange={setAuctionId}>
          <SelectTrigger className="mt-1 border-white/10 bg-white/5 text-neutral-100">
            <SelectValue placeholder="Select a listing" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#121218] text-neutral-100">
            {auctions.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label className="text-neutral-300">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as MarketingCampaignType)}
          >
            <SelectTrigger className="mt-1 border-white/10 bg-white/5 text-neutral-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#121218] text-neutral-100">
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-neutral-300">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as MarketingCampaignStatus)}
          >
            <SelectTrigger className="mt-1 border-white/10 bg-white/5 text-neutral-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#121218] text-neutral-100">
              <SelectItem value={MarketingCampaignStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={MarketingCampaignStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={MarketingCampaignStatus.PAUSED}>Paused</SelectItem>
              <SelectItem value={MarketingCampaignStatus.ENDED}>Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="startAt" className="text-neutral-300">
            Start (optional)
          </Label>
          <Input
            id="startAt"
            type="datetime-local"
            value={startAt}
            onChange={(e) => setStartAt(e.target.value)}
            className="mt-1 border-white/10 bg-white/5 text-neutral-100"
          />
        </div>
        <div>
          <Label htmlFor="endAt" className="text-neutral-300">
            End (optional)
          </Label>
          <Input
            id="endAt"
            type="datetime-local"
            value={endAt}
            onChange={(e) => setEndAt(e.target.value)}
            className="mt-1 border-white/10 bg-white/5 text-neutral-100"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading} className="bg-[#ff3b5c] hover:bg-[#ff3b5c]/90">
          {loading ? "Saving…" : mode === "create" ? "Create campaign" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={`/u/${handle}/marketing/campaigns`}>Cancel</a>
        </Button>
      </div>
    </form>
  );
}
