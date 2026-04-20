import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import {
  completeCarmunityOnboarding,
  getCarmunityOnboardingState,
  saveCarmunityOnboardingPrefs,
} from "@/lib/carmunity/onboarding-service";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  gearSlugs: z.array(z.string().min(1)).max(12).optional(),
  lowerCategories: z
    .array(
      z.object({
        spaceSlug: z.string().min(1),
        slug: z.string().min(1),
      })
    )
    .max(24)
    .optional(),
  complete: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }
  const st = await getCarmunityOnboardingState(userId);
  return NextResponse.json({
    completed: Boolean(st.completedAt),
    prefs: st.prefs,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { gearSlugs, lowerCategories, complete } = parsed.data;

  if (gearSlugs !== undefined || lowerCategories !== undefined) {
    await saveCarmunityOnboardingPrefs({
      userId,
      prefs: {
        ...(gearSlugs !== undefined ? { gearSlugs } : {}),
        ...(lowerCategories !== undefined ? { lowerCategories } : {}),
      },
    });
  }

  if (complete) {
    await completeCarmunityOnboarding(userId);
  }

  const st = await getCarmunityOnboardingState(userId);
  return NextResponse.json({ ok: true, completed: Boolean(st.completedAt), prefs: st.prefs });
}
