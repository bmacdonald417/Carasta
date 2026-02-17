import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/db";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  handle: z.string().min(2).max(30).regex(/^[a-z0-9_]+$/).optional(),
  name: z.string().max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.flatten().fieldErrors?.password?.[0] ?? "Invalid input." },
        { status: 400 }
      );
    }
    const { email, password, handle, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 400 }
      );
    }

    let finalHandle = handle?.toLowerCase().replace(/[^a-z0-9_]/g, "") ?? email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") + Math.random().toString(36).slice(2, 6);
    let n = 0;
    while (await prisma.user.findUnique({ where: { handle: finalHandle } })) {
      finalHandle = (handle ?? email.split("@")[0]) + (++n).toString();
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
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
