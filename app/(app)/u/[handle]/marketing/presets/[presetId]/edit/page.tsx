import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isMarketingEnabled } from "@/lib/marketing/feature-flag";
import { getMarketingPresetForSellerEdit } from "@/lib/marketing/get-seller-marketing-presets";
import { MarketingPresetForm } from "@/components/marketing/marketing-preset-form";
import { MarketingPresetDeleteButton } from "@/components/marketing/marketing-preset-delete-button";

export default async function EditMarketingPresetPage({
  params,
}: {
  params: Promise<{ handle: string; presetId: string }>;
}) {
  if (!isMarketingEnabled()) notFound();

  const { handle, presetId } = await params;
  const session = await getSession();
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) notFound();
  if ((session?.user as { id?: string } | null)?.id !== user.id) notFound();

  const preset = await getMarketingPresetForSellerEdit(user.id, presetId);
  if (!preset) notFound();

  return (
    <div className="carasta-container max-w-3xl py-8">
      <Link
        href={`/u/${user.handle}/marketing/presets`}
        className="mb-4 inline-block text-sm text-muted-foreground hover:text-foreground"
      >
        ← Presets
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Edit preset
        </h1>
        <MarketingPresetDeleteButton
          handle={user.handle}
          presetId={preset.id}
          variant="outline"
          redirectAfterDelete
        />
      </div>
      <div className="mt-8">
        <MarketingPresetForm
          handle={user.handle}
          mode="edit"
          preset={{
            id: preset.id,
            name: preset.name,
            source: preset.source,
            medium: preset.medium,
            campaignLabel: preset.campaignLabel,
            copyVariant: preset.copyVariant,
            includeHashtags: preset.includeHashtags,
            includeKeywords: preset.includeKeywords,
            isDefault: preset.isDefault,
          }}
        />
      </div>
    </div>
  );
}
