import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getJwtSubjectUserId } from "@/lib/auth/api-user";
import {
  buildCarmunityUploadRelativePath,
  CARMUNITY_IMAGE_MAX_BYTES,
  CARMUNITY_VIDEO_MAX_BYTES,
  extensionForCarmunityMime,
  isAllowedCarmunityMime,
  isVideo,
} from "@/lib/carmunity/carmunity-image-upload";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/carmunity/media/upload — multipart form, field `file`.
 * Authenticated. Writes to `public` under `/uploads/carmunity/{userId}/…`.
 * Supports: JPEG, PNG, WebP, GIF, SVG, HEIC, AVIF + MP4, MOV, WebM.
 *
 * Production: prefer a CDN or object storage; local `public/` is ephemeral on many hosts.
 * See CARMUNITY_MEDIA_UPLOAD_CONTRACT.md.
 */
export async function POST(req: NextRequest) {
  const userId = await getJwtSubjectUserId(req);
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing file field (multipart field name: file)." },
      { status: 400 }
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ ok: false, error: "Empty file." }, { status: 400 });
  }

  const mime = file.type || "application/octet-stream";

  if (!isAllowedCarmunityMime(mime)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unsupported file type. Allowed: JPEG, PNG, WebP, GIF, SVG, HEIC, AVIF, MP4, MOV, WebM.",
      },
      { status: 400 }
    );
  }

  const fileIsVideo = isVideo(mime);
  const maxBytes = fileIsVideo ? CARMUNITY_VIDEO_MAX_BYTES : CARMUNITY_IMAGE_MAX_BYTES;
  const maxLabel = fileIsVideo ? "100 MB" : "10 MB";

  if (file.size > maxBytes) {
    return NextResponse.json(
      { ok: false, error: `File must be ${maxLabel} or smaller.` },
      { status: 400 }
    );
  }

  const ext = extensionForCarmunityMime(mime);
  if (!ext) {
    return NextResponse.json({ ok: false, error: "Unsupported file type." }, { status: 400 });
  }

  const id = randomUUID();
  const relPath = buildCarmunityUploadRelativePath(userId, id, ext);
  const parts = relPath.replace(/^\//, "").split("/");
  const absFile = path.join(process.cwd(), "public", ...parts);

  const buf = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(absFile), { recursive: true });
  await writeFile(absFile, buf);

  const requestOrigin = new URL(req.url).origin;
  const publicBase =
    process.env.CARMUNITY_MEDIA_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    requestOrigin;

  const mediaUrl = `${publicBase}${relPath}`;

  return NextResponse.json({ ok: true, imageUrl: mediaUrl, mediaUrl, isVideo: fileIsVideo, mime });
}
