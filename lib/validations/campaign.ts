import { z } from "zod";
import { MarketingCampaignStatus } from "@prisma/client";

export const marketingCampaignTypeSchema = z.enum([
  "social",
  "email",
  "featured",
  "community",
]);

export type MarketingCampaignType = z.infer<typeof marketingCampaignTypeSchema>;

export const marketingCampaignFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(200),
    auctionId: z.string().min(1, "Listing is required"),
    type: marketingCampaignTypeSchema,
    status: z.nativeEnum(MarketingCampaignStatus),
    startAt: z.date().optional().nullable(),
    endAt: z.date().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.startAt && data.endAt && data.endAt <= data.startAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date must be after start date.",
        path: ["endAt"],
      });
    }
  });

export type MarketingCampaignFormInput = z.infer<
  typeof marketingCampaignFormSchema
>;

/** Parse optional datetime-local style strings from FormData. */
export function parseOptionalDatetimeInput(
  v: FormDataEntryValue | null
): Date | undefined {
  if (v == null || v === "") return undefined;
  const s = String(v).trim();
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}
