import { z } from "zod";

const consentMustBeTrue = (field: string) =>
  z.boolean().refine((v) => v === true, {
    message: `You must accept the ${field} to create an account.`,
  });

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/).optional(),
  name: z.string().max(100).optional(),
  acceptTerms: consentMustBeTrue("Terms of Service"),
  acceptPrivacy: consentMustBeTrue("Privacy Policy"),
  acceptCommunityGuidelines: consentMustBeTrue("Community Guidelines"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
