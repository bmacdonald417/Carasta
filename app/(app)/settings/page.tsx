import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getCarmunityOnboardingState,
  listOnboardingSpaceOptions,
} from "@/lib/carmunity/onboarding-service";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
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
    <div className="carasta-container max-w-xl space-y-8 py-8">
      <header className="border-b border-border pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, connected links, email preferences, and Carmunity
          discovery.
        </p>
      </header>

      <ContextualHelpCard context="settings.account" />

      <section>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-foreground">Profile</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            This information appears on your public profile where applicable.
          </p>
        </div>
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
      </section>

      <CarmunitySettingsSection
        spaces={carmunitySpaces}
        initialPrefs={carmunityState.prefs}
        onboardingCompleted={Boolean(carmunityState.completedAt)}
      />
    </div>
  );
}
