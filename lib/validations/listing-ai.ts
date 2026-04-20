import { z } from "zod";

export const listingAiGenerateBodySchema = z.object({
  auctionId: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(2100),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(100).optional().nullable(),
  mileage: z.number().int().nonnegative().nullable().optional(),
  vin: z.string().max(32).optional().nullable(),
  title: z.string().max(200).optional(),
  description: z.string().max(20000).optional(),
  conditionSummary: z.string().max(8000).optional(),
  highlights: z.string().max(8000).optional(),
  tone: z.string().max(200).optional(),
  audience: z.string().max(2000).optional(),
});

export type ListingAiGenerateBody = z.infer<typeof listingAiGenerateBodySchema>;

export const listingAiStructuredResultSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(20000),
  conditionSummary: z.string().max(8000).optional().nullable(),
});

export type ListingAiStructuredResult = z.infer<typeof listingAiStructuredResultSchema>;
