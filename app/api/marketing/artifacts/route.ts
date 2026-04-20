import { NextResponse } from "next/server";
import { ListingMarketingArtifactType } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  assertPlanOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import { listingMarketingArtifactCreateSchema } from "@/lib/validations/listing-marketing-workspace";
import { serializeWorkspaceArtifact } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/marketing/artifacts — append a versioned draft row (immutable history).
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

  const parsed = listingMarketingArtifactCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { planId, content, channel, type } = parsed.data;
  const allowed = await assertPlanOwnedBySeller(planId, auth.user.id);
  if (!allowed) {
    return NextResponse.json({ message: "Plan not found." }, { status: 404 });
  }

  const artifactType = type ?? ListingMarketingArtifactType.OTHER;
  const channelKey = channel ?? "";

  const agg = await prisma.listingMarketingArtifact.aggregate({
    where: { planId, type: artifactType, channel: channelKey },
    _max: { version: true },
  });
  const nextVersion = (agg._max.version ?? 0) + 1;

  const artifact = await prisma.listingMarketingArtifact.create({
    data: {
      planId,
      type: artifactType,
      channel: channelKey,
      content,
      version: nextVersion,
    },
  });

  return NextResponse.json({ artifact: serializeWorkspaceArtifact(artifact) });
}
