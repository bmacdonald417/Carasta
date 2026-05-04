/**
 * Shared rules for Carmunity post media uploads (images + video).
 * Storage implementation lives in the API route; this module stays validation + path helpers only.
 */

export const CARMUNITY_IMAGE_MAX_BYTES = 10 * 1024 * 1024; // 10 MiB for images
export const CARMUNITY_VIDEO_MAX_BYTES = 100 * 1024 * 1024; // 100 MiB for video

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
  "image/avif",
]);

const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/quicktime", // .mov
  "video/webm",
  "video/x-msvideo", // .avi
  "video/mpeg",
]);

export function isAllowedCarmunityImageMime(mime: string): boolean {
  return ALLOWED_IMAGE_MIME.has(mime);
}

export function isAllowedCarmunityVideoMime(mime: string): boolean {
  return ALLOWED_VIDEO_MIME.has(mime);
}

export function isAllowedCarmunityMime(mime: string): boolean {
  return isAllowedCarmunityImageMime(mime) || isAllowedCarmunityVideoMime(mime);
}

export function isVideo(mime: string): boolean {
  return ALLOWED_VIDEO_MIME.has(mime);
}

/** File extension including dot, e.g. `.jpg`, or null if unknown. */
export function extensionForCarmunityMime(mime: string): string | null {
  switch (mime) {
    case "image/jpeg": return ".jpg";
    case "image/png": return ".png";
    case "image/webp": return ".webp";
    case "image/gif": return ".gif";
    case "image/svg+xml": return ".svg";
    case "image/heic": return ".heic";
    case "image/heif": return ".heif";
    case "image/avif": return ".avif";
    case "video/mp4": return ".mp4";
    case "video/quicktime": return ".mov";
    case "video/webm": return ".webm";
    case "video/x-msvideo": return ".avi";
    case "video/mpeg": return ".mpeg";
    default: return null;
  }
}

// Keep legacy export for backwards compatibility
export function extensionForCarmunityImageMime(mime: string): string | null {
  return extensionForCarmunityMime(mime);
}

export function allowedMimeList(): string {
  return Array.from(ALLOWED_IMAGE_MIME)
    .concat(Array.from(ALLOWED_VIDEO_MIME))
    .join(",");
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
