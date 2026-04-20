import { prisma } from "@/lib/db";

export async function createWalletIfMissing(userId: string) {
  return prisma.userWallet.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function getWalletSummary(userId: string) {
  const wallet = await prisma.userWallet.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      balanceAvailable: true,
      balancePending: true,
      lifetimeEarned: true,
      lifetimeSpent: true,
    },
  });
  if (!wallet) {
    const created = await createWalletIfMissing(userId);
    return {
      walletId: created.id,
      userId: created.userId,
      balanceAvailable: created.balanceAvailable,
      balancePending: created.balancePending,
      lifetimeEarned: created.lifetimeEarned,
      lifetimeSpent: created.lifetimeSpent,
    };
  }
  return {
    walletId: wallet.id,
    userId: wallet.userId,
    balanceAvailable: wallet.balanceAvailable,
    balancePending: wallet.balancePending,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeSpent,
  };
}

