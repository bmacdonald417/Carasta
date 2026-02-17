"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addGarageCar } from "@/app/garage/actions";
import { useToast } from "@/components/ui/use-toast";

export function AddGarageCarForm({
  type,
  className,
}: {
  type: "GARAGE" | "DREAM";
  className?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    make: "",
    model: "",
    trim: "",
    notes: "",
    imageUrls: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.make.trim() || !form.model.trim()) {
      toast({ title: "Make and model required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const imageUrls = form.imageUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);
    const result = await addGarageCar({
      type,
      year: form.year,
      make: form.make.trim(),
      model: form.model.trim(),
      trim: form.trim.trim() || undefined,
      notes: form.notes.trim() || undefined,
      imageUrls,
    });
    setLoading(false);
    if (result.ok && result.handle) {
      toast({ title: "Car added" });
      router.push(`/u/${result.handle}/${type === "GARAGE" ? "garage" : "dream"}`);
      router.refresh();
    } else {
      toast({ title: result.error ?? "Failed", variant: "destructive" });
    }
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-2xl border border-border/50 bg-card/80 p-6 ${className ?? ""}`}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Year</Label>
          <Input
            id="year"
            type="number"
            value={form.year}
            onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="make">Make</Label>
          <Input
            id="make"
            value={form.make}
            onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
            placeholder="Porsche"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={form.model}
            onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
            placeholder="911"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="trim">Trim</Label>
          <Input
            id="trim"
            value={form.trim}
            onChange={(e) => setForm((p) => ({ ...p, trim: e.target.value }))}
            className="mt-1"
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          className="mt-1"
        />
      </div>
      <div className="mt-4">
        <Label htmlFor="imageUrls">Image URLs (optional, one per line or comma)</Label>
        <Textarea
          id="imageUrls"
          value={form.imageUrls}
          onChange={(e) => setForm((p) => ({ ...p, imageUrls: e.target.value }))}
          className="mt-1 min-h-[60px]"
        />
      </div>
      <div className="mt-6 flex gap-2">
        <Button type="button" variant="outline" asChild>
          <Link href="/settings">Cancel</Link>
        </Button>
        <Button type="submit" variant="performance" disabled={loading}>
          {loading ? "Adding…" : "Add car"}
        </Button>
      </div>
    </form>
  );
}
