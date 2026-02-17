import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      handle: true,
      name: true,
      bio: true,
      location: true,
      avatarUrl: true,
    },
  });
  if (!user) redirect("/auth/sign-in");

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">
        Update your profile. Checkout is simulated (demo).
      </p>
      <div className="mt-6 rounded-2xl border border-border/50 bg-card/80 p-6">
        <p className="text-xs text-muted-foreground">
          Secure checkout partner (demo). No real payments.
        </p>
        <SettingsForm
          handle={user.handle}
          name={user.name ?? ""}
          bio={user.bio ?? ""}
          location={user.location ?? ""}
          avatarUrl={user.avatarUrl ?? ""}
        />
      </div>
    </div>
  );
}
