"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isReviewModeEnabled } from "@/lib/review-mode";
import { revalidatePath } from "next/cache";

export async function markAllNotificationsRead(): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  if (isReviewModeEnabled()) {
    return { ok: true };
  }

  await prisma.notification.updateMany({
    where: { userId: (session.user as any).id, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/");
  return { ok: true };
}
