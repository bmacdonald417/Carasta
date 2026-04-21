import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon } from "lucide-react";
import { formatMarketingDateTime } from "@/lib/marketing/marketing-display";
import { SellerSectionPanel } from "@/components/marketing/seller-workspace-primitives";

export function AuctionLinkedPromoPostsSection({
  posts,
}: {
  posts: {
    id: string;
    createdAt: Date;
    contentPreview: string | null;
    imageUrl: string | null;
  }[];
}) {
  return (
    <SellerSectionPanel
      title="Carmunity posts"
      description="Promo posts published from this workspace and linked back to this listing."
    >
      {posts.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] px-5 py-8 text-center">
          <p className="text-sm text-[hsl(var(--seller-muted))]">
            No linked posts yet.
          </p>
          <p className="mt-2 text-xs text-[hsl(var(--seller-muted))]">
            Use <span className="font-medium text-[hsl(var(--seller-foreground))]">Promote to Carmunity</span>{" "}
            above to publish.
          </p>
        </div>
      ) : null}
      {posts.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex gap-3 rounded-[1.25rem] border border-[hsl(var(--seller-border))] bg-[hsl(var(--seller-panel-muted))] p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[hsl(var(--seller-muted))]">
                    <ImageIcon className="h-6 w-6" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[hsl(var(--seller-muted))]">
                  {formatMarketingDateTime(p.createdAt)}
                </p>
                {p.contentPreview ? (
                  <p className="mt-1 line-clamp-2 text-sm text-[hsl(var(--seller-foreground))]">
                    {p.contentPreview}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-[hsl(var(--seller-muted))]">Image post</p>
                )}
                <Link
                  href={`/explore/post/${p.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--seller-info-foreground))] hover:underline"
                >
                  View on Carmunity
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </SellerSectionPanel>
  );
}

