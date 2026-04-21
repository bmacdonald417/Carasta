import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getCarmunityOnboardingState,
  listOnboardingSpaceOptions,
} from "@/lib/carmunity/onboarding-service";
import { CarmunitySettingsSection } from "./carmunity-settings-section";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      handle: true,
      email: true,
      name: true,
      bio: true,
      location: true,
      avatarUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      twitterUrl: true,
      tiktokUrl: true,
      weeklyMarketingDigestOptIn: true,
    },
  });
  if (!user) redirect("/auth/sign-in");

  const [carmunitySpaces, carmunityState] = await Promise.all([
    listOnboardingSpaceOptions(),
    getCarmunityOnboardingState((session.user as { id: string }).id),
  ]);

  return (
    <div className="carasta-container max-w-xl py-8">
      <h1 className="font-display text-2xl font-bold uppercase tracking-wider text-foreground">
        Settings
      </h1>
      <p className="mt-1 text-neutral-400">
        Update your profile, bio, and social links.
      </p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <SettingsForm
          handle={user.handle}
          accountEmail={user.email}
          name={user.name ?? ""}
          bio={user.bio ?? ""}
          location={user.location ?? ""}
          avatarUrl={user.avatarUrl ?? ""}
          instagramUrl={user.instagramUrl ?? ""}
          facebookUrl={user.facebookUrl ?? ""}
          twitterUrl={user.twitterUrl ?? ""}
          tiktokUrl={user.tiktokUrl ?? ""}
          weeklyMarketingDigestOptIn={user.weeklyMarketingDigestOptIn}
        />
      </div>

      <div className="mt-8">
        <CarmunitySettingsSection
          spaces={carmunitySpaces}
          initialPrefs={carmunityState.prefs}
          onboardingCompleted={Boolean(carmunityState.completedAt)}
        />
      </div>
    </div>
  );
}
