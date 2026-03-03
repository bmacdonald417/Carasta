import { z } from "zod";

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
