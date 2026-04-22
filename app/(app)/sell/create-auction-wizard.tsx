"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAuction, saveAuctionDraft } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import type { ConditionGrade } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";
import { ListingAiAssistant } from "@/components/sell/listing-ai-assistant";
import { ListingAiFieldImprove } from "@/components/sell/listing-ai-field-improve";

const DEFAULT_DAYS = 7;
const BUY_NOW_HOURS = 24;
const TOTAL_STEPS = 5;

const CONDITION_GRADES: { value: ConditionGrade; label: string }[] = [
  { value: "CONCOURS", label: "Concours" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "VERY_GOOD", label: "Very Good" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

type ImperfectionItem = {
  id: string;
  location: string;
  description: string;
  severity: "minor" | "moderate" | "major";
};

type DamageImageItem = {
  id: string;
  label: string;
  imageUrl: string;
};

function genId() {
  return Math.random().toString(36).slice(2);
}

export function CreateAuctionWizard({
  className,
  listingAiEnabled = false,
}: {
  className?: string;
  listingAiEnabled?: boolean;
}) {
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
    imageUrls: "" as string,
    conditionGrade: "" as ConditionGrade | "",
    conditionSummary: "",
    imperfections: [] as ImperfectionItem[],
    damageImages: [] as DamageImageItem[],
  });

  function update(f: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...f }));
  }

  function addImperfection() {
    update({
      imperfections: [
        ...form.imperfections,
        { id: genId(), location: "", description: "", severity: "minor" },
      ],
    });
  }

  function removeImperfection(id: string) {
    update({
      imperfections: form.imperfections.filter((i) => i.id !== id),
    });
  }

  function updateImperfection(
    id: string,
    f: Partial<Omit<ImperfectionItem, "id">>
  ) {
    update({
      imperfections: form.imperfections.map((i) =>
        i.id === id ? { ...i, ...f } : i
      ),
    });
  }

  function addDamageImage() {
    update({
      damageImages: [
        ...form.damageImages,
        { id: genId(), label: "", imageUrl: "" },
      ],
    });
  }

  function removeDamageImage(id: string) {
    update({
      damageImages: form.damageImages.filter((d) => d.id !== id),
    });
  }

  function updateDamageImage(
    id: string,
    f: Partial<Omit<DamageImageItem, "id">>
  ) {
    update({
      damageImages: form.damageImages.map((d) =>
        d.id === id ? { ...d, ...f } : d
      ),
    });
  }

  const listingRewriteContext = useMemo(
    () => ({
      year: form.year,
      make: form.make,
      model: form.model,
      trim: form.trim,
      mileage:
        form.mileage === "" || Number.isNaN(Number(form.mileage))
          ? undefined
          : Number(form.mileage),
      vin: form.vin,
      title: form.title,
      description: form.description,
      conditionSummary: form.conditionSummary,
      conditionGrade: form.conditionGrade
        ? String(form.conditionGrade)
        : undefined,
    }),
    [
      form.conditionGrade,
      form.conditionSummary,
      form.description,
      form.make,
      form.mileage,
      form.model,
      form.title,
      form.trim,
      form.vin,
      form.year,
    ]
  );

  function buildPayload(isDraft = false) {
    const year = Number(form.year);
    const mileage =
      form.mileage === "" ? undefined : Number(form.mileage);
    const reserveCents =
      form.reservePriceCents === ""
        ? undefined
        : Math.round(Number(form.reservePriceCents) * 100);
    const buyNowCents =
      form.buyNowPriceCents === ""
        ? undefined
        : Math.round(Number(form.buyNowPriceCents) * 100);
    const startAt = new Date();
    const endAt = new Date(
      startAt.getTime() + form.durationDays * 24 * 60 * 60 * 1000
    );
    const buyNowExpiresAt =
      buyNowCents != null
        ? new Date(startAt.getTime() + BUY_NOW_HOURS * 60 * 60 * 1000)
        : undefined;
    const imageUrls = form.imageUrls
      .split(/[\n,]/)
      .map((u) => u.trim())
      .filter(Boolean);
    const imperfections = form.imperfections
      .filter((i) => i.description.trim())
      .map((i) => ({
        location: i.location.trim(),
        description: i.description.trim(),
        severity: i.severity,
      }));
    const damageImages = form.damageImages
      .filter((d) => d.label.trim() && d.imageUrl.trim())
      .map((d) => ({ label: d.label.trim(), imageUrl: d.imageUrl.trim() }));

    return {
      title: form.title.trim() || "Untitled",
      description: form.description.trim() || undefined,
      year,
      make: form.make.trim() || (isDraft ? "TBD" : ""),
      model: form.model.trim() || (isDraft ? "TBD" : ""),
      trim: form.trim.trim() || undefined,
      mileage,
      vin: form.vin.trim() || undefined,
      reservePriceCents: reserveCents,
      buyNowPriceCents: buyNowCents,
      buyNowExpiresAt,
      startAt,
      endAt,
      imageUrls,
      conditionGrade: form.conditionGrade || undefined,
      conditionSummary: form.conditionSummary.trim() || undefined,
      imperfections: imperfections.length ? imperfections : undefined,
      damageImages: damageImages.length ? damageImages : undefined,
    };
  }

  async function saveDraft() {
    const year = Number(form.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      toast({ title: "Invalid year", variant: "destructive" });
      return;
    }
    const payload = buildPayload(true);
    setLoading(true);
    const result = await saveAuctionDraft(payload);
    setLoading(false);
    if (result.ok && result.auctionId) {
      toast({ title: "Draft saved" });
      router.push(`/auctions/${result.auctionId}`);
      router.refresh();
    } else {
      toast({ title: result.error ?? "Failed", variant: "destructive" });
    }
  }

  async function submit() {
    const year = Number(form.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      toast({ title: "Invalid year", variant: "destructive" });
      return;
    }
    if (form.mileage !== "" && (isNaN(Number(form.mileage)) || Number(form.mileage) < 0)) {
      toast({ title: "Invalid mileage", variant: "destructive" });
      return;
    }
    const payload = buildPayload(false);
    if (!payload.title || !payload.make || !payload.model) {
      toast({ title: "Title, make, and model are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await createAuction(payload);
    setLoading(false);
    if (result.ok && result.auctionId) {
      toast({ title: "Auction created" });
      router.push(`/auctions/${result.auctionId}`);
      router.refresh();
    } else {
      toast({ title: result.error ?? "Failed", variant: "destructive" });
    }
  }

  const cardClass =
    "rounded-2xl border border-border bg-card p-6 shadow-e1 md:p-8";

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-medium tabular-nums text-foreground">
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="hidden sm:inline">Save a draft anytime — nothing publishes until you finish.</span>
      </div>
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i + 1 <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className={cardClass}>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Vehicle basics</h2>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="title">Title</Label>
                <ListingAiFieldImprove
                  enabled={listingAiEnabled}
                  field="title"
                  context={listingRewriteContext}
                  currentText={form.title}
                  onReplace={(t) => update({ title: t })}
                />
              </div>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. 2020 Porsche 911 GT3"
                className="mt-1"
              />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="description">Description</Label>
                <ListingAiFieldImprove
                  enabled={listingAiEnabled}
                  field="description"
                  context={listingRewriteContext}
                  currentText={form.description}
                  onReplace={(t) => update({ description: t })}
                />
              </div>
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
            <ListingAiAssistant
              enabled={listingAiEnabled}
              scope="full"
              intake={{
                year: form.year,
                make: form.make,
                model: form.model,
                trim: form.trim,
                mileage: form.mileage,
                vin: form.vin,
                title: form.title,
                description: form.description,
                conditionSummary: form.conditionSummary,
              }}
              onApply={(patch) =>
                update({
                  ...(patch.title !== undefined ? { title: patch.title } : {}),
                  ...(patch.description !== undefined ? { description: patch.description } : {}),
                  ...(patch.conditionSummary !== undefined
                    ? { conditionSummary: patch.conditionSummary }
                    : {}),
                })
              }
            />
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={saveDraft} disabled={loading} className="flex-1">
                Save draft
              </Button>
              <Button onClick={() => setStep(2)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Pricing</h2>
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
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button variant="outline" onClick={saveDraft} disabled={loading} className="flex-1">
                Save draft
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Media</h2>
            <div>
              <Label htmlFor="imageUrls">Image URLs (one per line or comma-separated)</Label>
              <Textarea
                id="imageUrls"
                value={form.imageUrls}
                onChange={(e) => update({ imageUrls: e.target.value })}
                placeholder="https://..."
                className="mt-1 min-h-[120px]"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button variant="outline" onClick={saveDraft} disabled={loading} className="flex-1">
                Save draft
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Condition report</h2>
            <div>
              <Label htmlFor="conditionGrade">Condition grade</Label>
              <Select
                value={form.conditionGrade}
                onValueChange={(v) => update({ conditionGrade: v as ConditionGrade | "" })}
              >
                <SelectTrigger id="conditionGrade" className="mt-1">
                  <SelectValue placeholder="Select grade (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITION_GRADES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="conditionSummary">Condition summary</Label>
                <ListingAiFieldImprove
                  enabled={listingAiEnabled}
                  field="conditionSummary"
                  context={listingRewriteContext}
                  currentText={form.conditionSummary}
                  onReplace={(t) => update({ conditionSummary: t })}
                />
              </div>
              <Textarea
                id="conditionSummary"
                value={form.conditionSummary}
                onChange={(e) => update({ conditionSummary: e.target.value })}
                placeholder="Overall condition, service history, notable wear..."
                className="mt-1"
              />
            </div>
            <ListingAiAssistant
              enabled={listingAiEnabled}
              scope="condition"
              intake={{
                year: form.year,
                make: form.make,
                model: form.model,
                trim: form.trim,
                mileage: form.mileage,
                vin: form.vin,
                title: form.title,
                description: form.description,
                conditionSummary: form.conditionSummary,
                conditionGrade: form.conditionGrade || undefined,
              }}
              onApply={(patch) =>
                update({
                  ...(patch.conditionSummary !== undefined
                    ? { conditionSummary: patch.conditionSummary }
                    : {}),
                })
              }
            />
            <div>
              <div className="flex items-center justify-between">
                <Label>Imperfections</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addImperfection}
                  className="h-8 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="mt-2 space-y-3">
                {form.imperfections.map((imp) => (
                  <div
                    key={imp.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2"
                  >
                    <div className="flex justify-between">
                      <Input
                        placeholder="Location (e.g. Driver door)"
                        value={imp.location}
                        onChange={(e) =>
                          updateImperfection(imp.id, { location: e.target.value })
                        }
                        className="h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 ml-2"
                        onClick={() => removeImperfection(imp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Description"
                      value={imp.description}
                      onChange={(e) =>
                        updateImperfection(imp.id, { description: e.target.value })
                      }
                      className="h-8"
                    />
                    <Select
                      value={imp.severity}
                      onValueChange={(v) =>
                        updateImperfection(imp.id, {
                          severity: v as "minor" | "moderate" | "major",
                        })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minor">Minor</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="major">Major</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
            <ListingAiAssistant
              enabled={listingAiEnabled}
              scope="imperfections"
              imperfectionsForAi={form.imperfections}
              intake={{
                year: form.year,
                make: form.make,
                model: form.model,
                trim: form.trim,
                mileage: form.mileage,
                vin: form.vin,
                title: form.title,
                description: form.description,
                conditionSummary: form.conditionSummary,
              }}
              onApply={(patch) =>
                update({
                  ...(patch.description !== undefined ? { description: patch.description } : {}),
                })
              }
            />
            <div>
              <div className="flex items-center justify-between">
                <Label>Damage images</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addDamageImage}
                  className="h-8 gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add label and image URL for each damage photo
              </p>
              <div className="mt-2 space-y-3">
                {form.damageImages.map((d) => (
                  <div
                    key={d.id}
                    className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3"
                  >
                    <Input
                      placeholder="Label (e.g. Door scratch)"
                      value={d.label}
                      onChange={(e) => updateDamageImage(d.id, { label: e.target.value })}
                      className="h-8 flex-1"
                    />
                    <Input
                      placeholder="Image URL"
                      value={d.imageUrl}
                      onChange={(e) =>
                        updateDamageImage(d.id, { imageUrl: e.target.value })
                      }
                      className="h-8 flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => removeDamageImage(d.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button variant="outline" onClick={saveDraft} disabled={loading} className="flex-1">
                Save draft
              </Button>
              <Button onClick={() => setStep(5)} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Review</h2>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <p className="font-medium text-muted-foreground">Vehicle</p>
                <p className="font-medium">{form.title || "Untitled"}</p>
                <p>
                  {form.year} {form.make} {form.model}
                  {form.trim ? ` ${form.trim}` : ""}
                </p>
                {form.mileage !== "" && (
                  <p>{Number(form.mileage).toLocaleString()} mi</p>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-muted-foreground">Pricing</p>
                <p>
                  Reserve:{" "}
                  {form.reservePriceCents
                    ? `$${Number(form.reservePriceCents).toLocaleString()}`
                    : "None"}
                </p>
                <p>
                  Buy now:{" "}
                  {form.buyNowPriceCents
                    ? `$${Number(form.buyNowPriceCents).toLocaleString()}`
                    : "None"}
                </p>
                <p>{form.durationDays} days</p>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                Back
              </Button>
              <Button variant="outline" onClick={saveDraft} disabled={loading} className="flex-1">
                Save draft
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
                variant="default"
              >
                {loading ? "Creating…" : "Create auction"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
