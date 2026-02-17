"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAuction } from "./actions";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_DAYS = 7;
const BUY_NOW_HOURS = 24;

export function CreateAuctionWizard({ className }: { className?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    year: new Date().getFullYear(),
    make: "",
    model: "",
    trim: "",
    mileage: "" as string | number,
    vin: "",
    reservePriceCents: "" as string | number,
    buyNowPriceCents: "" as string | number,
    durationDays: DEFAULT_DAYS,
    imageUrls: "" as string, // comma or newline
  });

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
  }

  async function submit() {
    const year = Number(form.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      toast({ title: "Invalid year", variant: "destructive" });
      return;
    }
    const mileage = form.mileage === "" ? undefined : Number(form.mileage);
    if (form.mileage !== "" && (isNaN(Number(form.mileage)) || mileage! < 0)) {
      toast({ title: "Invalid mileage", variant: "destructive" });
      return;
    }
    const reserveCents =
      form.reservePriceCents === ""
        ? undefined
        : Math.round(Number(form.reservePriceCents) * 100);
    if (
      form.reservePriceCents !== "" &&
      (isNaN(Number(form.reservePriceCents)) || (reserveCents ?? 0) < 0)
    ) {
      toast({ title: "Invalid reserve", variant: "destructive" });
      return;
    }
    const buyNowCents =
      form.buyNowPriceCents === ""
        ? undefined
        : Math.round(Number(form.buyNowPriceCents) * 100);
    if (
      form.buyNowPriceCents !== "" &&
      (isNaN(Number(form.buyNowPriceCents)) || (buyNowCents ?? 0) < 0)
    ) {
      toast({ title: "Invalid buy now price", variant: "destructive" });
      return;
    }

    const startAt = new Date();
    const endAt = new Date(
      startAt.getTime() + form.durationDays * 24 * 60 * 60 * 1000
    );
    const buyNowExpiresAt =
      buyNowCents != null
        ? new Date(startAt.getTime() + BUY_NOW_HOURS * 60 * 60 * 1000)
        : null;

    const imageUrls = form.imageUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);

    setLoading(true);
    const result = await createAuction({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      year,
      make: form.make.trim(),
      model: form.model.trim(),
      trim: form.trim.trim() || undefined,
      mileage,
      vin: form.vin.trim() || undefined,
      reservePriceCents: reserveCents,
      buyNowPriceCents: buyNowCents,
      buyNowExpiresAt: buyNowExpiresAt ?? undefined,
      startAt,
      endAt,
      imageUrls,
    });
    setLoading(false);
    if (result.ok && result.auctionId) {
      toast({ title: "Auction created" });
      router.push(`/auctions/${result.auctionId}`);
      router.refresh();
    } else {
      toast({ title: result.error ?? "Failed", variant: "destructive" });
    }
  }

  return (
    <div className={`rounded-2xl border border-border/50 bg-card/80 p-6 ${className ?? ""}`}>
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Basics</h2>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. 2020 Porsche 911 GT3"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Condition, mods, history..."
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => update({ year: Number(e.target.value) })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={form.make}
                onChange={(e) => update({ make: e.target.value })}
                placeholder="Porsche"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => update({ model: e.target.value })}
                placeholder="911"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="trim">Trim</Label>
              <Input
                id="trim"
                value={form.trim}
                onChange={(e) => update({ trim: e.target.value })}
                placeholder="GT3"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="mileage">Mileage (optional)</Label>
            <Input
              id="mileage"
              type="number"
              value={form.mileage}
              onChange={(e) => update({ mileage: e.target.value })}
              placeholder="12000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="vin">VIN (optional)</Label>
            <Input
              id="vin"
              value={form.vin}
              onChange={(e) => update({ vin: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button onClick={() => setStep(2)} className="w-full">
            Next
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Pricing & duration</h2>
          <div>
            <Label htmlFor="reserve">Reserve price $ (optional, hidden)</Label>
            <Input
              id="reserve"
              type="number"
              value={form.reservePriceCents}
              onChange={(e) => update({ reservePriceCents: e.target.value })}
              placeholder="80000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="buyNow">Buy now price $ (optional, first 24h only)</Label>
            <Input
              id="buyNow"
              type="number"
              value={form.buyNowPriceCents}
              onChange={(e) => update({ buyNowPriceCents: e.target.value })}
              placeholder="120000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="duration">Auction duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={form.durationDays}
              onChange={(e) => update({ durationDays: Number(e.target.value) })}
              min={1}
              max={30}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="imageUrls">Image URLs (one per line or comma-separated)</Label>
            <Textarea
              id="imageUrls"
              value={form.imageUrls}
              onChange={(e) => update({ imageUrls: e.target.value })}
              placeholder="https://..."
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              Back
            </Button>
            <Button
              onClick={submit}
              disabled={
                loading ||
                !form.title.trim() ||
                !form.make.trim() ||
                !form.model.trim()
              }
              className="flex-1"
              variant="performance"
            >
              {loading ? "Creating…" : "Create auction"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
