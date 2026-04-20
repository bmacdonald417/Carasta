import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertPlanOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { serializeWorkspaceTask } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/marketing/tasks/for-plan/[planId]
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ planId: string }> }
) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  const { planId } = await context.params;
  const ok = await assertPlanOwnedBySeller(planId, auth.user.id);
  if (!ok) {
    return NextResponse.json({ message: "Plan not found." }, { status: 404 });
  }

  const tasks = await prisma.listingMarketingTask.findMany({
    where: { planId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ tasks: tasks.map(serializeWorkspaceTask) });
}
