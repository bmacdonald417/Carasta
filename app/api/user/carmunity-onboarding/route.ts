import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { logCarmunityEvent } from "@/lib/carmunity/carmunity-analytics";
import {
  completeCarmunityOnboarding,
  getCarmunityOnboardingState,
  resetCarmunityOnboarding,
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
  /** Clears completion so onboarding can run again (prefs unchanged unless sent). */
  resetOnboarding: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }
  const st = await getCarmunityOnboardingState(userId);
  return NextResponse.json({
    completed: Boolean(st.completedAt),
    prefs: st.prefs,
  });
}

export async function PATCH(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
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

  const { gearSlugs, lowerCategories, complete, resetOnboarding } = parsed.data;

  if (resetOnboarding) {
    await resetCarmunityOnboarding(userId);
    logCarmunityEvent({ type: "carmunity_onboarding_reset", userId });
  }

  if (gearSlugs !== undefined || lowerCategories !== undefined) {
    await saveCarmunityOnboardingPrefs({
      userId,
      prefs: {
        ...(gearSlugs !== undefined ? { gearSlugs } : {}),
        ...(lowerCategories !== undefined ? { lowerCategories } : {}),
      },
    });
  }

  if (complete && !resetOnboarding) {
    await completeCarmunityOnboarding(userId);
    logCarmunityEvent({ type: "carmunity_onboarding_completed", userId });
  }

  const st = await getCarmunityOnboardingState(userId);
  return NextResponse.json({ ok: true, completed: Boolean(st.completedAt), prefs: st.prefs });
}
