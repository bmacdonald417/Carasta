import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  assertAuctionOwnedBySeller,
  requireMarketingWorkspaceSession,
} from "@/lib/marketing/marketing-workspace-auth";
import {
  listingMarketingPlanCreateSchema,
  normalizeChannelsInput,
} from "@/lib/validations/listing-marketing-workspace";
import { serializeWorkspacePlan } from "@/lib/marketing/listing-marketing-workspace-serialize";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/marketing/plan — create the single workspace plan for a listing (seller-only).
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

  const parsed = listingMarketingPlanCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const { auctionId, objective, audience, positioning } = parsed.data;
  const channelsJson = normalizeChannelsInput(parsed.data.channels);

  const auction = await assertAuctionOwnedBySeller(auctionId, auth.user.id);
  if (!auction) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const existing = await prisma.listingMarketingPlan.findUnique({
    where: { auctionId },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { message: "A marketing plan already exists for this listing." },
      { status: 409 }
    );
  }

  const plan = await prisma.listingMarketingPlan.create({
    data: {
      auctionId,
      createdById: auth.user.id,
      objective: objective ?? "",
      audience: audience ?? "",
      positioning: positioning ?? "",
      channels: channelsJson,
    },
    include: {
      tasks: { orderBy: { sortOrder: "asc" } },
      artifacts: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  return NextResponse.json({ plan: serializeWorkspacePlan(plan) });
}
