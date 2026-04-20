import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import { redeemCreditsBodySchema } from "@/lib/validations/rewards/wallet";
import { createWalletIfMissing } from "@/lib/rewards/ledger/wallet";
import { postLedgerTransaction } from "@/lib/rewards/ledger/ledger";
import { WalletTransactionKind } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/rewards/redeem
 * MVP: spend available balance on a redemption option.
 */
export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = redeemCreditsBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  const option = await prisma.redemptionOption.findUnique({
    where: { code: parsed.data.optionCode },
    select: { id: true, code: true, cost: true, isActive: true },
  });
  if (!option || !option.isActive) {
    return NextResponse.json({ ok: false, error: "Redemption option not available." }, { status: 404 });
  }

  const wallet = await createWalletIfMissing(userId);

  // MVP: check cached balance. Later we can derive or reconcile from ledger.
  const fresh = await prisma.userWallet.findUnique({
    where: { id: wallet.id },
    select: { balanceAvailable: true },
  });
  const available = fresh?.balanceAvailable ?? 0;
  if (available < option.cost) {
    return NextResponse.json({ ok: false, error: "Insufficient Carasta Coin balance." }, { status: 409 });
  }

  const rec = await prisma.$transaction(async (tx) => {
    const record = await tx.redemptionRecord.create({
      data: {
        userId,
        walletId: wallet.id,
        optionId: option.id,
        cost: option.cost,
        notes: parsed.data.notes || undefined,
      },
      select: { id: true },
    });

    // Debit ledger (negative amount).
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        kind: WalletTransactionKind.REDEMPTION,
        amount: -option.cost,
        redemptionId: record.id,
        description: `Redeem ${option.code}`.slice(0, 300),
        idempotencyKey: `redeem:${record.id}`,
      },
      select: { id: true },
    });

    await tx.userWallet.update({
      where: { id: wallet.id },
      data: {
        balanceAvailable: { decrement: option.cost },
        lifetimeSpent: { increment: option.cost },
      },
      select: { id: true },
    });

    return record;
  });

  return NextResponse.json({ ok: true, redemptionId: rec.id });
}

