import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { MarketingPresetForm } from "@/components/marketing/marketing-preset-form";

export default async function NewMarketingPresetPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  if ((session?.user as { id?: string } | null)?.id !== user.id) notFound();

  return (
    <div className="carasta-container max-w-3xl py-8">
      <Link
        href={`/u/${user.handle}/marketing/presets`}
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Presets
      </Link>
      <h1 className="font-display text-2xl font-bold text-neutral-100">
        New preset
      </h1>
      <p className="mt-1 text-sm text-neutral-400">
        Saved settings apply on listing marketing pages when you pick this preset.
      </p>
      <div className="mt-8">
        <MarketingPresetForm handle={user.handle} mode="create" />
      </div>
    </div>
  );
}
