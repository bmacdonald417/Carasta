import { NextResponse } from "next/server";
import { ListingMarketingTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  assertPlanOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { listingMarketingTaskCreateSchema } from "@/lib/validations/listing-marketing-workspace";
import { serializeWorkspaceTask } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/marketing/tasks
 */
export async function POST(req: Request) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = listingMarketingTaskCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { planId, title, description, channel, type, sortOrder } = parsed.data;
  const allowed = await assertPlanOwnedBySeller(planId, auth.user.id);
  if (!allowed) {
    return NextResponse.json({ message: "Plan not found." }, { status: 404 });
  }

  let nextOrder = sortOrder;
  if (nextOrder === undefined) {
    const agg = await prisma.listingMarketingTask.aggregate({
      where: { planId },
      _max: { sortOrder: true },
    });
    nextOrder = (agg._max.sortOrder ?? -1) + 1;
  }

  const task = await prisma.listingMarketingTask.create({
    data: {
      planId,
      title,
      description: description ?? "",
      channel: channel ?? null,
      type: type ?? ListingMarketingTaskType.CHECKLIST,
      sortOrder: nextOrder,
    },
  });

  return NextResponse.json({ task: serializeWorkspaceTask(task) });
}
