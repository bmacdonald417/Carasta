"use server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const name = (formData.get("name") as string)?.trim() ?? null;
  const bio = (formData.get("bio") as string)?.trim() ?? null;
  const location = (formData.get("location") as string)?.trim() ?? null;
  const avatarUrl = (formData.get("avatarUrl") as string)?.trim() ?? null;

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name, bio, location, avatarUrl },
  });

  revalidatePath("/settings");
  const handle = (session.user as any).handle;
  if (handle) revalidatePath(`/u/${handle}`);
  return { ok: true };
}
