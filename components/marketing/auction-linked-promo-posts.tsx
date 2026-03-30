import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ImageIcon } from "lucide-react";
import { formatMarketingDateTime } from "@/lib/marketing/marketing-display";

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
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="font-display text-lg font-semibold text-neutral-100">
        Carmunity promo posts
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Posts you published to Carmunity from this listing&apos;s marketing page
        (linked for your records).
      </p>
      {posts.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">
          None yet — use <strong className="text-neutral-400">Promote to Carmunity</strong>{" "}
          above to publish a linked post.
        </p>
      ) : null}
      {posts.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
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
                  <div className="flex h-full w-full items-center justify-center text-neutral-600">
                    <ImageIcon className="h-6 w-6" aria-hidden />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-neutral-500">
                  {formatMarketingDateTime(p.createdAt)}
                </p>
                {p.contentPreview ? (
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-300">
                    {p.contentPreview}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-neutral-500">Image post</p>
                )}
                <Link
                  href={`/explore/post/${p.id}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#ff3b5c]/90 hover:underline"
                >
                  View on Carmunity
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

