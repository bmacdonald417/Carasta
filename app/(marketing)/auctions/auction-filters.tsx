"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { X } from "lucide-react";

type FilterPill = { key: string; label: string };

export function AuctionFilters({
  makes,
  models,
  make,
  model,
  yearMin,
  yearMax,
  priceMin,
  priceMax,
  noReserve,
  endingSoon,
  status,
  sort,
  q,
}: {
  makes: string[];
  models: string[];
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  noReserve?: boolean;
  endingSoon?: boolean;
  status?: string;
  sort?: string;
  q?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(key: string, value: string | number | undefined) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
    router.push(`/auctions?${next.toString()}`);
  }

  function removeFilter(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    router.push(`/auctions?${next.toString()}`);
  }

  const activePills: FilterPill[] = [];
  if (q) activePills.push({ key: "q", label: `Search: "${q}"` });
  if (make) activePills.push({ key: "make", label: `Make: ${make}` });
  if (model) activePills.push({ key: "model", label: `Model: ${model}` });
  if (yearMin != null) activePills.push({ key: "yearMin", label: `Year ≥ ${yearMin}` });
  if (yearMax != null) activePills.push({ key: "yearMax", label: `Year ≤ ${yearMax}` });
  if (priceMin != null) activePills.push({ key: "priceMin", label: `Price ≥ $${priceMin.toLocaleString()}` });
  if (priceMax != null) activePills.push({ key: "priceMax", label: `Price ≤ $${priceMax.toLocaleString()}` });
  if (noReserve) activePills.push({ key: "noReserve", label: "No reserve" });
  if (endingSoon) activePills.push({ key: "endingSoon", label: "Ending in 24h" });
  if (status && status !== "LIVE") activePills.push({ key: "status", label: `Status: ${status}` });
  if (sort && sort !== "ending") activePills.push({ key: "sort", label: `Sort: ${sort === "newest" ? "Newest" : sort === "highest" ? "Highest bid" : "Ending soon"}` });

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border/50 bg-card/50 p-4">
        <div className="w-full min-w-[140px] max-w-[200px]">
          <Label className="text-xs">Search</Label>
          <Input
            placeholder="Make, model, title..."
            defaultValue={q}
            onBlur={(e) => update("q", e.target.value.trim() || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-full min-w-[120px] max-w-[140px]">
          <Label className="text-xs">Make</Label>
          <Select
            value={make ?? "__all__"}
            onValueChange={(v) => update("make", v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All makes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All makes</SelectItem>
              {makes.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full min-w-[120px] max-w-[140px]">
          <Label className="text-xs">Model</Label>
          <Select
            value={model ?? "__all__"}
            onValueChange={(v) => update("model", v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All models" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All models</SelectItem>
              {models.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[80px]">
          <Label className="text-xs">Year min</Label>
          <Input
            type="number"
            min={1900}
            max={2100}
            placeholder="1990"
            defaultValue={yearMin}
            onBlur={(e) => update("yearMin", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[80px]">
          <Label className="text-xs">Year max</Label>
          <Input
            type="number"
            min={1900}
            max={2100}
            placeholder="2024"
            defaultValue={yearMax}
            onBlur={(e) => update("yearMax", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[90px]">
          <Label className="text-xs">Price min ($)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            placeholder="0"
            defaultValue={priceMin}
            onBlur={(e) => update("priceMin", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[90px]">
          <Label className="text-xs">Price max ($)</Label>
          <Input
            type="number"
            min={0}
            step={1000}
            placeholder="Any"
            defaultValue={priceMax}
            onBlur={(e) => update("priceMax", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[120px]">
          <Label className="text-xs">Status</Label>
          <Select
            value={status ?? "LIVE"}
            onValueChange={(v) => update("status", v === "LIVE" ? undefined : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="ENDED">Ended</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="noReserve"
              checked={!!noReserve}
              onChange={(e) => update("noReserve", e.target.checked ? "1" : undefined)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="noReserve" className="text-sm">No reserve</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="endingSoon"
              checked={!!endingSoon}
              onChange={(e) => update("endingSoon", e.target.checked ? "1" : undefined)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="endingSoon" className="text-sm">Ending in 24h</Label>
          </div>
        </div>
        <div className="w-[140px]">
          <Label className="text-xs">Sort</Label>
          <Select value={sort ?? "ending"} onValueChange={(v) => update("sort", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending">Ending soon</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest bid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activePills.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => removeFilter(key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ff3b5c]/40 bg-[#ff3b5c]/10 px-3 py-1 text-xs font-medium text-[#ff3b5c] transition hover:bg-[#ff3b5c]/20"
            >
              {label}
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => router.push("/auctions")}
            className="text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
