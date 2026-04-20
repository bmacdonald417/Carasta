/**
 * One-off: create or promote an admin user (credentials via env only).
 *
 * Usage (PowerShell):
 *   $env:ADMIN_EMAIL="you@example.com"
 *   $env:ADMIN_PASSWORD="your-strong-password"
 *   npx ts-node -P tsconfig.scripts.json scripts/create-admin-user.ts
 *
 * Never commit real credentials; rotate passwords shared in chat.
 */
import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/db";

async function ensureUniqueHandle(base: string): Promise<string> {
  let handle = base.slice(0, 24).toLowerCase().replace(/[^a-z0-9]/g, "") || "admin";
  let n = 0;
  while (true) {
    const exists = await prisma.user.findUnique({ where: { handle } });
    if (!exists) return handle;
    handle = `${base.replace(/[^a-z0-9]/gi, "").toLowerCase().slice(0, 16)}${++n}`;
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment.");
    process.exit(1);
  }

  const passwordHash = await hash(password, 12);
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, handle: true, role: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: Role.ADMIN,
        passwordHash,
      },
    });
    console.log(`Updated existing user to ADMIN: ${email} (id=${existing.id}, handle=@${existing.handle})`);
    return;
  }

  const local = email.split("@")[0] ?? "admin";
  const handle = await ensureUniqueHandle(local);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      handle,
      name: email.split("@")[0] ?? "Admin",
      role: Role.ADMIN,
      acceptedTermsAt: new Date(),
      acceptedPrivacyAt: new Date(),
      acceptedCommunityGuidelinesAt: new Date(),
    },
    select: { id: true, email: true, handle: true, role: true },
  });

  console.log(`Created ADMIN user: ${user.email} (id=${user.id}, handle=@${user.handle})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
