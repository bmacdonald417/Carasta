import { z } from "zod";

export const marketingPresetSourceSchema = z.enum([
  "instagram",
  "facebook",
  "linkedin",
  "email",
  "carmunity",
]);

export const marketingPresetMediumSchema = z.enum([
  "social",
  "email",
  "community",
]);

export const marketingPresetCopyVariantSchema = z.enum([
  "short",
  "long",
  "ending_soon",
]);

export const marketingPresetFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    source: marketingPresetSourceSchema,
    medium: marketingPresetMediumSchema,
    campaignLabel: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((s) => (s === "" ? undefined : s)),
    copyVariant: marketingPresetCopyVariantSchema,
    includeHashtags: z.coerce.boolean(),
    includeKeywords: z.coerce.boolean(),
    isDefault: z.coerce.boolean(),
  })
  .superRefine((data, ctx) => {
    const social: readonly string[] = ["instagram", "facebook", "linkedin"];
    const ok =
      social.includes(data.source) && data.medium === "social"
        ? true
        : data.source === "email" && data.medium === "email"
          ? true
          : data.source === "carmunity" && data.medium === "community";
    if (!ok) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Medium must be social for Instagram/Facebook/LinkedIn, email for Email, community for Carmunity.",
        path: ["medium"],
      });
    }
  });

export type MarketingPresetFormInput = z.infer<typeof marketingPresetFormSchema>;
