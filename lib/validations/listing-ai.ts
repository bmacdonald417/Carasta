import { z } from "zod";

/** Sell wizard section — drives prompt + which fields the client should apply. */
export const listingAiWizardScopeSchema = z.enum(["full", "condition", "imperfections"]);
export const listingAiAudiencePresetSchema = z.enum([
  "collector",
  "performance_buyer",
  "daily_driver",
  "project_car",
  "weekend_enthusiast",
]);
export const listingAiServiceHistoryConfidenceSchema = z.enum([
  "documented",
  "partial",
  "unknown",
]);

export type ListingAiWizardScope = z.infer<typeof listingAiWizardScopeSchema>;
export type ListingAiAudiencePreset = z.infer<typeof listingAiAudiencePresetSchema>;

export const listingAiGenerateBodySchema = z.object({
  auctionId: z.string().min(1).optional(),
  /** When set, listing AI focuses that part of the listing (default full listing draft). */
  wizardScope: listingAiWizardScopeSchema.optional(),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional().nullable(),
  mileage: z.number().int().nonnegative().nullable().optional(),
  vin: z.string().max(32).optional().nullable(),
  title: z.string().max(200).optional(),
  description: z.string().max(20000).optional(),
  conditionSummary: z.string().max(8000).optional(),
  /** e.g. CONCOURS — passed when wizardScope is condition for model context */
  conditionGrade: z.string().max(32).optional().nullable(),
  highlights: z.string().max(8000).optional(),
  tone: z.string().max(200).optional(),
  audience: z.string().max(2000).optional(),
  audiencePreset: listingAiAudiencePresetSchema.optional(),
  ownershipDuration: z.string().max(200).optional(),
  serviceHistoryConfidence: listingAiServiceHistoryConfidenceSchema.optional(),
  modifications: z.string().max(4000).optional(),
  originality: z.string().max(4000).optional(),
  documentationAvailable: z.string().max(1000).optional(),
  sellingReason: z.string().max(1000).optional(),
});

export type ListingAiGenerateBody = z.infer<typeof listingAiGenerateBodySchema>;

export const listingAiStructuredResultSchema = z.object({
  title: z.string().min(1).max(200),
  titleOptions: z.array(z.string().min(1).max(200)).max(4).default([]),
  shortSummary: z.string().max(600).default(""),
  description: z.string().min(1).max(20000),
  conditionSummary: z.string().max(8000).optional().nullable(),
  missingInfo: z.array(z.string().min(1).max(300)).max(10).default([]),
  riskFlags: z.array(z.string().min(1).max(300)).max(10).default([]),
  readinessScore: z.number().int().min(0).max(100).default(0),
  readinessReasons: z.array(z.string().min(1).max(400)).max(10).default([]),
  disclosureSuggestions: z.array(z.string().min(1).max(400)).max(10).default([]),
});

export type ListingAiStructuredResult = z.infer<typeof listingAiStructuredResultSchema>;

export const listingAiRewriteFieldSchema = z
  .object({
    auctionId: z.string().min(1).optional(),
    field: z.enum(["title", "description", "conditionSummary"]),
    instruction: z.string().max(500).optional(),
    currentText: z.string().max(22000),
    year: z.number().int().min(1900).max(2100).optional(),
    make: z.string().max(100).optional(),
    model: z.string().max(100).optional(),
    trim: z.string().max(100).optional().nullable(),
    mileage: z.number().int().nonnegative().nullable().optional(),
    vin: z.string().max(32).optional().nullable(),
    title: z.string().max(200).optional(),
    description: z.string().max(20000).optional(),
    conditionSummary: z.string().max(8000).optional(),
    conditionGrade: z.string().max(32).optional().nullable(),
    audiencePreset: listingAiAudiencePresetSchema.optional(),
    ownershipDuration: z.string().max(200).optional(),
    serviceHistoryConfidence: listingAiServiceHistoryConfidenceSchema.optional(),
    modifications: z.string().max(4000).optional(),
    originality: z.string().max(4000).optional(),
    documentationAvailable: z.string().max(1000).optional(),
    sellingReason: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.auctionId) {
      if (data.year == null || !data.make?.trim() || !data.model?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "year, make, and model are required when auctionId is omitted.",
        });
      }
    }
  });

export type ListingAiRewriteFieldBody = z.infer<typeof listingAiRewriteFieldSchema>;

export const listingAiRewriteFieldResultSchema = z.object({
  text: z.string().min(1).max(22000),
});

export type ListingAiRewriteFieldResult = z.infer<typeof listingAiRewriteFieldResultSchema>;
