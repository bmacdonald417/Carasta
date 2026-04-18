/**
 * Shared rules for Carmunity post image uploads (multipart route + docs).
 * Storage implementation lives in the API route; this module stays validation + path helpers only.
 */

export const CARMUNITY_IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MiB — safe for common serverless body limits

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function isAllowedCarmunityImageMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

/** File extension including dot, e.g. `.jpg`, or null if unknown. */
export function extensionForCarmunityImageMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return null;
  }
}

/** Public URL path under the site origin (e.g. `/uploads/carmunity/...`). */
export function buildCarmunityUploadRelativePath(
  userId: string,
  fileId: string,
  extWithDot: string
): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "");
  const safeId = fileId.replace(/[^a-zA-Z0-9-]/g, "");
  return `/uploads/carmunity/${safeUser}/${safeId}${extWithDot}`;
}
