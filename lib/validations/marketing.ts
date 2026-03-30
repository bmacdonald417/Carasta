import { z } from "zod";
import { MarketingTrafficSource } from "@prisma/client";

export const marketingTrackBodySchema = z.object({
  auctionId: z.string().min(1).max(128),
  eventType: z.enum(["VIEW", "SHARE_CLICK", "BID_CLICK"]),
  source: z.nativeEnum(MarketingTrafficSource).optional(),
  visitorKey: z.string().min(8).max(128).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .refine(
      (m) => !m || Object.keys(m).length <= 24,
      "Metadata too large"
    ),
});

export type MarketingTrackBody = z.infer<typeof marketingTrackBodySchema>;
