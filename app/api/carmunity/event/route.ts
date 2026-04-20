import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { logCarmunityEvent } from "@/lib/carmunity/carmunity-analytics";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "thread_open_feed",
  "share_action",
]);

const bodySchema = z.object({
  type: z.string().min(1).max(64),
  meta: z.record(z.unknown()).optional(),
});

export async function POST(req: Request) {
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || !ALLOWED.has(parsed.data.type)) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  logCarmunityEvent({
    type: parsed.data.type,
    userId,
    meta: parsed.data.meta,
  });

  return NextResponse.json({ ok: true });
}
