import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export type AdminSessionResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAdminSession(): Promise<AdminSessionResult> {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!userId || role !== "ADMIN") {
    return { ok: false, response: NextResponse.json({ message: "Forbidden." }, { status: 403 }) };
  }
  return { ok: true, userId };
}
