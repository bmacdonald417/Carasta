import { NextResponse } from "next/server";
import { z } from "zod";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createAuctionDiscussionThread } from "@/lib/forums/auction-discussion";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  title: z.string().max(200).optional(),
  body: z.string().max(20_000).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ message: "Sign in required." }, { status: 401 });
  }

  const { id: auctionId } = await params;
  if (!auctionId) {
    return NextResponse.json({ message: "Auction id required." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    json = {};
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    select: { id: true, title: true, year: true, make: true, model: true, status: true },
  });
  if (!auction) {
    return NextResponse.json({ message: "Auction not found." }, { status: 404 });
  }

  const defaultTitle = `Discussion: ${auction.title}`.slice(0, 200);
  const listingUrl = `/auctions/${auction.id}`;
  const defaultBody = [
    `Community discussion for this Carasta listing.`,
    ``,
    `**${auction.year} ${auction.make} ${auction.model}**`,
    ``,
    `Listing: ${listingUrl}`,
    ``,
    `Share questions, inspection notes, or context for other enthusiasts — keep it respectful and on-topic.`,
  ].join("\n");

  const title = (parsed.data.title?.trim() || defaultTitle).slice(0, 200);
  const body = (parsed.data.body?.trim() || defaultBody).slice(0, 20_000);

  const result = await createAuctionDiscussionThread({
    authorId: userId,
    auctionId,
    title,
    body,
  });
  if (!result.ok) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, threadId: result.threadId });
}
