import { z } from "zod";

const conditionGradeSchema = z.enum([
  "CONCOURS",
  "EXCELLENT",
  "VERY_GOOD",
  "GOOD",
  "FAIR",
]);

const imperfectionSchema = z.object({
  location: z.string(),
  description: z.string().min(1, "Description is required"),
  severity: z.enum(["minor", "moderate", "major"]),
});

const damageImageSchema = z.object({
  label: z.string().min(1, "Label is required"),
  imageUrl: z.string().url("Invalid URL"),
});

export const createAuctionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1, "Make is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  trim: z.string().optional(),
  mileage: z.number().int().nonnegative().optional(),
  vin: z.string().optional(),
  reservePriceCents: z.number().int().nonnegative().optional(),
  buyNowPriceCents: z.number().int().nonnegative().optional(),
  buyNowExpiresAt: z.date().optional(),
  startAt: z.date(),
  endAt: z.date(),
  imageUrls: z.array(z.string().url()).default([]),
  conditionGrade: conditionGradeSchema.optional(),
  conditionSummary: z.string().optional(),
  imperfections: z.array(imperfectionSchema).optional(),
  damageImages: z.array(damageImageSchema).optional(),
});

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;

export const createAuctionDraftSchema = createAuctionSchema.extend({
  startAt: z.date().optional(),
  endAt: z.date().optional(),
});

export type CreateAuctionDraftInput = z.infer<typeof createAuctionDraftSchema>;

export const placeBidSchema = z.object({
  auctionId: z.string(),
  amountCents: z.number().int().positive(),
});

export const quickBidSchema = z.object({
  auctionId: z.string(),
  currentHighCents: z.number().int().nonnegative(),
});

export const buyNowSchema = z.object({ auctionId: z.string() });

export const autoBidSchema = z.object({
  auctionId: z.string(),
  maxAmountCents: z.number().int().positive(),
});
