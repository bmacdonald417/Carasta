import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export type AdminMarketingExportAuthResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * **ADMIN** session only — for `/api/admin/marketing/export/*` CSV routes.
 * `/api/admin/*` is not covered by `middleware.ts`; routes must call this.
 */
export async function requireAdminMarketingCsvAccess(): Promise<AdminMarketingExportAuthResult> {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json({ ok: false }, { status: 401 }),
    };
  }
  return { ok: true };
}
