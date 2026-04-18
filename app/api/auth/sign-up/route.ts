import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { signUpSchema } from "@/lib/validations/auth";

function sanitizeHandleBase(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28);
}

function getValidationMessage(parsed: z.SafeParseError<unknown>): string {
  const flat = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const first =
    flat.email?.[0] ??
    flat.password?.[0] ??
    flat.handle?.[0] ??
    flat.name?.[0] ??
    flat.acceptTerms?.[0] ??
    flat.acceptPrivacy?.[0] ??
    flat.acceptCommunityGuidelines?.[0];
  return first ?? "Invalid input.";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: getValidationMessage(parsed as z.SafeParseError<unknown>) },
        { status: 400 }
      );
    }
    const { email, password, name } = parsed.data;
    const handle = parsed.data.handle?.trim() || undefined;
    const consentAt = new Date();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const emailBase = sanitizeHandleBase(email.split("@")[0]) || "user";
    let finalHandle =
      handle && sanitizeHandleBase(handle).length >= 2
        ? sanitizeHandleBase(handle)
        : emailBase + Math.random().toString(36).slice(2, 6);
    if (finalHandle.length < 2) finalHandle = "user" + Math.random().toString(36).slice(2, 8);
    let n = 0;
    while (await prisma.user.findUnique({ where: { handle: finalHandle } })) {
      const base = handle && sanitizeHandleBase(handle).length >= 2 ? sanitizeHandleBase(handle) : emailBase;
      finalHandle = (base + (++n).toString()).slice(0, 30);
    }

    const passwordHash = await hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        handle: finalHandle,
        name: name ?? null,
        acceptedTermsAt: consentAt,
        acceptedPrivacyAt: consentAt,
        acceptedCommunityGuidelinesAt: consentAt,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sign-up] Error:", e);
    const code = (e as { code?: string })?.code;

    if (code === "P2002") {
      return NextResponse.json(
        {
          message:
            "That email or handle is already taken. Try signing in or use a different email/handle.",
        },
        { status: 400 }
      );
    }
    if (
      code === "P1000" ||
      code === "P1001" ||
      code === "P1002" ||
      code === "P1003" ||
      code === "P1011" ||
      code === "P2021"
    ) {
      return NextResponse.json(
        {
          message:
            code === "P2021"
              ? "Database schema not applied. Deployer: run prisma db push and db seed with Railway DATABASE_URL."
              : "Service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
