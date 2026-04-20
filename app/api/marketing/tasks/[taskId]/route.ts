import { NextRequest, NextResponse } from "next/server";
import { ListingMarketingTaskStatus, ListingMarketingTaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireMarketingWorkspaceSession } from "@/lib/marketing/marketing-workspace-auth";
import { listingMarketingTaskPatchSchema } from "@/lib/validations/listing-marketing-workspace";
import { serializeWorkspaceTask } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * PATCH /api/marketing/tasks/[taskId]
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ taskId: string }> }
) {
  const auth = await requireMarketingWorkspaceSession();
  if (!auth.ok) return auth.response;

  const { taskId } = await context.params;

  const task = await prisma.listingMarketingTask.findFirst({
    where: { id: taskId },
    include: {
      plan: {
        select: {
          id: true,
          createdById: true,
          auction: { select: { sellerId: true } },
        },
      },
    },
  });

  if (
    !task ||
    task.plan.createdById !== auth.user.id ||
    task.plan.auction.sellerId !== auth.user.id
  ) {
    return NextResponse.json({ message: "Task not found." }, { status: 404 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = listingMarketingTaskPatchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const patch = parsed.data;
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ message: "No fields to update." }, { status: 400 });
  }

  const data: {
    title?: string;
    description?: string;
    channel?: string | null;
    type?: ListingMarketingTaskType;
    sortOrder?: number;
    status?: ListingMarketingTaskStatus;
    completedAt?: Date | null;
  } = {};

  if (patch.title !== undefined) data.title = patch.title;
  if (patch.description !== undefined) data.description = patch.description;
  if (patch.channel !== undefined) data.channel = patch.channel;
  if (patch.type !== undefined) data.type = patch.type;
  if (patch.sortOrder !== undefined) data.sortOrder = patch.sortOrder;
  if (patch.status !== undefined) {
    data.status = patch.status;
    if (patch.status === ListingMarketingTaskStatus.COMPLETED) {
      data.completedAt = new Date();
    } else if (patch.status === ListingMarketingTaskStatus.PENDING) {
      data.completedAt = null;
    }
  }

  const updated = await prisma.listingMarketingTask.update({
    where: { id: taskId },
    data,
  });

  return NextResponse.json({ task: serializeWorkspaceTask(updated) });
}
