import { z } from "zod";
import { MarketingTrafficSource } from "@prisma/client";

const METADATA_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,63}$/;

export const marketingTrackBodySchema = z.object({
  auctionId: z.string().min(1).max(128),
  eventType: z.enum(["VIEW", "SHARE_CLICK", "BID_CLICK"]),
  source: z.nativeEnum(MarketingTrafficSource).optional(),
  visitorKey: z.string().min(8).max(128).optional(),
  metadata: z
    .record(z.string(), z.unknown())
    .optional()
    .superRefine((m, ctx) => {
      if (!m) return;
      const keys = Object.keys(m);
      if (keys.length > 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Metadata has too many keys",
        });
        return;
      }
      for (const k of keys) {
        if (!METADATA_KEY_RE.test(k)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid metadata key",
          });
          return;
        }
        const v = m[k];
        if (v != null && typeof v !== "string") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Metadata values must be strings or empty",
          });
          return;
        }
        if (typeof v === "string" && v.length > 4096) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Metadata value too long",
          });
          return;
        }
      }
    }),
});

export type MarketingTrackBody = z.infer<typeof marketingTrackBodySchema>;
