"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const STATUSES = [
  { value: "", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "DRAFT", label: "Draft" },
  { value: "SOLD", label: "Sold" },
  { value: "ENDED", label: "Ended" },
] as const;

export function ListingsFilters({
  currentStatus,
  handle,
}: {
  currentStatus?: string;
  handle: string;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {STATUSES.map(({ value, label }) => {
        const isActive = (currentStatus ?? "") === value;
        const href = value
          ? `/u/${handle}/listings?status=${value}`
          : `/u/${handle}/listings`;
        return (
          <Button
            key={value || "all"}
            variant={isActive ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={href}>{label}</Link>
          </Button>
        );
      })}
    </div>
  );
}
