import { z } from "zod";
import {
  ListingMarketingArtifactType,
  ListingMarketingTaskStatus,
  ListingMarketingTaskType,
} from "@prisma/client";

const channelsSchema = z
  .array(z.string().min(1).max(64))
  .max(32)
  .default([]);

export const listingMarketingPlanCreateSchema = z.object({
  auctionId: z.string().min(1),
  objective: z.string().max(20_000).optional().default(""),
  audience: z.string().max(20_000).optional().default(""),
  positioning: z.string().max(20_000).optional().default(""),
  channels: z.union([channelsSchema, z.string()]).optional(),
});

export const listingMarketingPlanPatchSchema = z.object({
  objective: z.string().max(20_000).optional(),
  audience: z.string().max(20_000).optional(),
  positioning: z.string().max(20_000).optional(),
  channels: z.union([channelsSchema, z.string()]).optional(),
});

export const listingMarketingTaskCreateSchema = z.object({
  planId: z.string().min(1),
  type: z.nativeEnum(ListingMarketingTaskType).optional(),
  title: z.string().min(1).max(500),
  description: z.string().max(20_000).optional().default(""),
  channel: z.string().max(64).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
});

export const listingMarketingTaskPatchSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(20_000).optional(),
  channel: z.string().max(64).nullable().optional(),
  type: z.nativeEnum(ListingMarketingTaskType).optional(),
  sortOrder: z.number().int().min(0).max(1_000_000).optional(),
  status: z.nativeEnum(ListingMarketingTaskStatus).optional(),
});

export const listingMarketingArtifactCreateSchema = z.object({
  planId: z.string().min(1),
  type: z.nativeEnum(ListingMarketingArtifactType).optional(),
  channel: z.string().max(64).optional().default(""),
  content: z.string().min(1).max(100_000),
});

/** Normalize channels from JSON or comma-separated string to string[]. */
export function normalizeChannelsInput(
  input: z.infer<typeof listingMarketingPlanCreateSchema>["channels"]
): string[] {
  if (input == null) return [];
  if (Array.isArray(input)) return input;
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 32);
}
