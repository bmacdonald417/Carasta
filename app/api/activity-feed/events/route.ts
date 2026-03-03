import { NextResponse } from "next/server";
import { sseActivityBuffer } from "@/lib/pusher";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(sseActivityBuffer.slice(-30).reverse());
}
