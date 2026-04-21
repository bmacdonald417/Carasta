"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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

const CONDITION_OPTIONS = [
  { value: "__all__", label: "Any condition" },
  { value: "CONCOURS", label: "Concours" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "VERY_GOOD", label: "Very good" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
] as const;

export function AuctionFilters({
  makes,
  models,
  make,
  model,
  yearMin,
  yearMax,
  priceMin,
  priceMax,
  mileageMin,
  mileageMax,
  location,
  condition,
  featured,
  noReserve,
  endingSoon,
  status,
  sort,
  q,
  zip,
  radius,
  view,
  page = 1,
  total,
  pageSize = 50,
}: {
  makes: string[];
  models: string[];
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMin?: number;
  mileageMax?: number;
  location?: string;
  condition?: string;
  featured?: boolean;
  noReserve?: boolean;
  endingSoon?: boolean;
  status?: string;
  sort?: string;
  q?: string;
  zip?: string;
  radius?: number;
  view?: "grid" | "map";
  page?: number;
  total?: number;
  pageSize?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localZip, setLocalZip] = useState(zip ?? "");
  useEffect(() => {
    setLocalZip(zip ?? "");
  }, [zip]);

  function update(key: string, value: string | number | undefined) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === undefined || value === "") next.delete(key);
    else next.set(key, String(value));
    if (key !== "page") next.delete("page");
    router.push(`/auctions?${next.toString()}`);
  }

  function removeFilter(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);
    if (key === "zip" || key === "radius") {
      next.delete("zip");
      next.delete("radius");
    }
    if (key === "view") next.delete("view");
    next.delete("page");
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
  if (sort && sort !== "ending") {
    const sortLabels: Record<string, string> = {
      newest: "Newest",
      highest: "Highest bid",
      price_asc: "Price: low → high",
      price_desc: "Price: high → low",
    };
    activePills.push({
      key: "sort",
      label: `Sort: ${sortLabels[sort] ?? sort}`,
    });
  }
  if (zip) activePills.push({ key: "zip", label: `Near ${zip}` });
  if (radius != null) activePills.push({ key: "radius", label: `Within ${radius} mi` });
  if (view && view !== "grid") activePills.push({ key: "view", label: "Map view" });

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-card p-4 shadow-e1">
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
        <div className="w-[100px]">
          <Label className="text-xs">Mileage min</Label>
          <Input
            type="number"
            min={0}
            placeholder="0"
            defaultValue={mileageMin}
            onBlur={(e) => update("mileageMin", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[100px]">
          <Label className="text-xs">Mileage max</Label>
          <Input
            type="number"
            min={0}
            placeholder="Any"
            defaultValue={mileageMax}
            onBlur={(e) => update("mileageMax", e.target.value || undefined)}
            className="mt-1"
          />
        </div>
        <div className="min-w-[140px] max-w-[200px]">
          <Label className="text-xs">Location</Label>
          <Input
            placeholder="Zip, city, title…"
            defaultValue={location}
            onBlur={(e) => update("location", e.target.value.trim() || undefined)}
            className="mt-1"
          />
        </div>
        <div className="w-[140px]">
          <Label className="text-xs">Condition</Label>
          <Select
            value={condition ?? "__all__"}
            onValueChange={(v) => update("condition", v === "__all__" ? undefined : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={!!featured}
              title="Reserved for future featured listings"
              onChange={(e) => update("featured", e.target.checked ? "1" : undefined)}
              className="h-4 w-4 rounded border-border"
            />
            <Label htmlFor="featured" className="text-sm text-muted-foreground">
              Featured{" "}
              <span className="text-xs">(soon)</span>
            </Label>
          </div>
        </div>
        <div className="w-[180px]">
          <Label className="text-xs">Sort</Label>
          <Select value={sort ?? "ending"} onValueChange={(v) => update("sort", v)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ending">Ending soon</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="highest">Highest bid</SelectItem>
              <SelectItem value="price_asc">Price: low → high</SelectItem>
              <SelectItem value="price_desc">Price: high → low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[100px]">
          <Label className="text-xs">Zip</Label>
          <Input
            placeholder="90210"
            value={localZip}
            onChange={(e) =>
              setLocalZip(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            onBlur={(e) =>
              update("zip", e.target.value.trim() || undefined)
            }
            className="mt-1"
            maxLength={10}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">View</Label>
          <div className="flex rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => update("view", undefined)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                (view ?? "grid") === "grid"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => update("view", "map")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                view === "map"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Map
            </button>
          </div>
        </div>
        <div className="w-[100px]">
          <Label className="text-xs">Radius</Label>
          <Select
            value={radius != null ? String(radius) : "__none__"}
            onValueChange={(v) => update("radius", v === "__none__" ? undefined : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Any</SelectItem>
              <SelectItem value="25">25 mi</SelectItem>
              <SelectItem value="50">50 mi</SelectItem>
              <SelectItem value="100">100 mi</SelectItem>
              <SelectItem value="250">250 mi</SelectItem>
              <SelectItem value="500">500 mi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {total != null && view !== "map" && (
        <p className="text-xs text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
        </p>
      )}

      {activePills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activePills.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => removeFilter(key)}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
