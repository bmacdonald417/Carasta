import { z } from "zod";
import { rewardReasonCodeSchema } from "./zod-enums";

export const walletHistoryQuerySchema = z.object({
  take: z.coerce.number().min(1).max(100).optional().default(25),
  cursorCreatedAt: z.string().optional(),
  cursorId: z.string().optional(),
});

export const postEarnEventBodySchema = z.object({
  idempotencyKey: z.string().min(8).max(200),
  reasonCode: rewardReasonCodeSchema,
  auctionId: z.string().min(1).optional(),
  rewardCampaignId: z.string().min(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const redeemCreditsBodySchema = z.object({
  optionCode: z.string().min(1).max(80),
  notes: z.string().max(10_000).optional().default(""),
});

