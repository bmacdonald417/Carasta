import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertPlanOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import {
  listingMarketingPlanPatchSchema,
  normalizeChannelsInput,
} from "@/lib/validations/listing-marketing-workspace";
import { serializeWorkspacePlan } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/marketing/plan/[planId]
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ planId: string }> }
) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  const { planId } = await context.params;
  const allowed = await assertPlanOwnedBySeller(planId, auth.user.id);
  if (!allowed) {
    return NextResponse.json({ message: "Plan not found." }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = listingMarketingPlanPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const data = parsed.data;
  if (
    data.objective === undefined &&
    data.audience === undefined &&
    data.positioning === undefined &&
    data.channels === undefined
  ) {
    return NextResponse.json({ message: "No fields to update." }, { status: 400 });
  }

  const update: {
    objective?: string;
    audience?: string;
    positioning?: string;
    channels?: string[];
  } = {};
  if (data.objective !== undefined) update.objective = data.objective;
  if (data.audience !== undefined) update.audience = data.audience;
  if (data.positioning !== undefined) update.positioning = data.positioning;
  if (data.channels !== undefined) {
    update.channels = normalizeChannelsInput(data.channels);
  }

  const plan = await prisma.listingMarketingPlan.update({
    where: { id: planId },
    data: update,
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      artifacts: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  return NextResponse.json({ plan: serializeWorkspacePlan(plan) });
}
