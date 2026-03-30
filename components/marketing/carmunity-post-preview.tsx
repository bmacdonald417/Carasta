import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function CarmunityPostPreview({
  handle,
  displayName,
  avatarUrl,
  content,
  imageUrl,
  showImage,
}: {
  handle: string;
  displayName: string | null;
  avatarUrl: string | null;
  content: string;
  imageUrl: string | null;
  showImage: boolean;
}) {
  const showPhoto = showImage && !!imageUrl;

  return (
    <Card className="overflow-hidden border-white/10 bg-black/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-[#ff3b5c]/20 text-xs font-medium text-neutral-200">
              {(displayName ?? handle).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-neutral-100">@{handle}</p>
            <p className="text-xs text-neutral-500">Preview — not published yet</p>
          </div>
        </div>
        {content.trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-200">
            {content}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-neutral-500">Caption will appear here</p>
        )}
        {showPhoto ? (
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl!}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
