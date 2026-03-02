import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/).optional(),
  name: z.string().max(100).optional(),
});

function sanitizeHandleBase(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 28);
}

function getValidationMessage(parsed: z.SafeParseError<unknown>): string {
  const flat = parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>;
  const first =
    flat.email?.[0] ?? flat.password?.[0] ?? flat.handle?.[0] ?? flat.name?.[0];
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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const emailBase = sanitizeHandleBase(email.split("@")[0]);
    let finalHandle =
      handle
        ? sanitizeHandleBase(handle)
        : emailBase + Math.random().toString(36).slice(2, 6);
    let n = 0;
    while (await prisma.user.findUnique({ where: { handle: finalHandle } })) {
      const base = handle ? sanitizeHandleBase(handle) : emailBase;
      finalHandle = (base + (++n).toString()).slice(0, 30);
    }

    const passwordHash = await hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        handle: finalHandle,
        name: name ?? null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[sign-up] Error:", e);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          {
            message:
              "That email or handle is already taken. Try signing in or use a different email/handle.",
          },
          { status: 400 }
        );
      }
      if (e.code === "P1001" || e.code === "P1002") {
        return NextResponse.json(
          { message: "Service temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
