import type { PrismaClient } from "@prisma/client";

/** Matches @handle where handle is Carmunity-style (alphanumeric + underscore). */
export const MENTION_HANDLE_REGEX = /@([a-zA-Z0-9_]{2,32})/g;

export function extractMentionHandles(text: string): string[] {
  const out = new Set<string>();
  const re = new RegExp(MENTION_HANDLE_REGEX.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = m[1];
    if (raw) out.add(raw.toLowerCase());
  }
  return Array.from(out);
}

export async function loadValidHandles(
  prisma: PrismaClient,
  handles: string[]
): Promise<Set<string>> {
  if (handles.length === 0) return new Set();
  const rows = await prisma.user.findMany({
    where: { handle: { in: handles, mode: "insensitive" } },
    select: { handle: true },
  });
  return new Set(rows.map((r) => r.handle.toLowerCase()));
}

