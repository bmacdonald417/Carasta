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

export function AuctionFilters({
  make,
  model,
  yearMin,
  yearMax,
  noReserve,
  endingSoon,
  sort,
  q,
}: {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  noReserve?: boolean;
  endingSoon?: boolean;
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

  return (
    <div className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border/50 bg-card/50 p-4">
      <div className="w-full min-w-[140px] max-w-[200px]">
        <Label className="text-xs">Search</Label>
        <Input
          placeholder="Make, model, title..."
          defaultValue={q}
          onChange={(e) => update("q", e.target.value || undefined)}
          onBlur={(e) => update("q", e.target.value.trim() || undefined)}
          className="mt-1"
        />
      </div>
      <div className="w-full min-w-[100px] max-w-[120px]">
        <Label className="text-xs">Make</Label>
        <Input
          placeholder="e.g. Porsche"
          defaultValue={make}
          onBlur={(e) => update("make", e.target.value.trim() || undefined)}
          className="mt-1"
        />
      </div>
      <div className="w-full min-w-[100px] max-w-[120px]">
        <Label className="text-xs">Model</Label>
        <Input
          placeholder="e.g. 911"
          defaultValue={model}
          onBlur={(e) => update("model", e.target.value.trim() || undefined)}
          className="mt-1"
        />
      </div>
      <div className="w-[70px]">
        <Label className="text-xs">Year min</Label>
        <Input
          type="number"
          placeholder="1990"
          defaultValue={yearMin}
          onBlur={(e) => update("yearMin", e.target.value || undefined)}
          className="mt-1"
        />
      </div>
      <div className="w-[70px]">
        <Label className="text-xs">Year max</Label>
        <Input
          type="number"
          placeholder="2024"
          defaultValue={yearMax}
          onBlur={(e) => update("yearMax", e.target.value || undefined)}
          className="mt-1"
        />
      </div>
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
      <div className="w-[140px]">
        <Label className="text-xs">Sort</Label>
        <Select value={sort ?? "newest"} onValueChange={(v) => update("sort", v)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="ending">Ending soon</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
