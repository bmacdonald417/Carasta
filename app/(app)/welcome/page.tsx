import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { buildOnboardingPack, getCarmunityOnboardingState } from "@/lib/carmunity/onboarding-service";
import { ContextualHelpCard } from "@/components/help/ContextualHelpCard";
import { WelcomeActivationDialog } from "@/components/welcome/WelcomeActivationDialog";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  const viewerId = (session?.user as any)?.id as string | undefined;
  if (!viewerId) redirect("/auth/sign-in?callbackUrl=%2Fwelcome");

  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/") ? sp.next : "/explore";

  const st = await getCarmunityOnboardingState(viewerId);
  const needs = !st.completedAt;
  const pack = needs ? await buildOnboardingPack({ viewerUserId: viewerId }) : null;

  return (
    <div className="carasta-container max-w-xl py-10">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-e2 sm:p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Welcome to Carasta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You&apos;re in. Carmunity is your home now — posts, discussions, garage identity, and the
          Market experience in one system.
        </p>
        <div className="mt-5 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <p className="text-sm text-foreground">
            What unlocks now:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>React and comment on posts and threads</li>
            <li>Follow voices and shape your feed</li>
            <li>Save, watch, bid, and sell (where available)</li>
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="rounded-full px-5">
            <Link href={next}>Enter Carmunity</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-5">
            <Link href="/discussions">Browse Discussions</Link>
          </Button>
        </div>

        <ContextualHelpCard context="product.welcome" className="mt-6" />

        <p className="mt-4 text-xs text-muted-foreground">
          Get in the car and drive with Carasta.
        </p>
      </div>

      <WelcomeActivationDialog pack={pack} nextUrl={next} />
    </div>
  );
}

