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
    <Card className="overflow-hidden border-border bg-card shadow-e1">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={avatarUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-primary/15 text-xs font-medium text-primary">
              {(displayName ?? handle).slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">@{handle}</p>
            <p className="text-xs text-muted-foreground">Preview — not published yet</p>
          </div>
        </div>
        {content.trim() ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
            {content}
          </p>
        ) : (
          <p className="mt-3 text-sm italic text-muted-foreground">Caption will appear here</p>
        )}
        {showPhoto ? (
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl bg-muted/40">
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
