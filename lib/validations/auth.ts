import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/).optional(),
  name: z.string().max(100).optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
