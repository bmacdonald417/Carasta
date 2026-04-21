/**
 * Prisma reads `DATABASE_URL` only (`prisma/schema.prisma`). Some deployments
 * (including a simplified Railway setup) expose only the public TCP proxy as
 * `DATABASE_PUBLIC_URL`. When `DATABASE_URL` is unset or blank, mirror the
 * public URL so Prisma works at `next start` and anywhere `@/lib/db` loads.
 *
 * Build-time Prisma is still handled by `scripts/build-with-public-db.cjs`;
 * local CLI uses `scripts/run-with-local-db.cjs`.
 */
const url = process.env.DATABASE_URL?.trim();
const pub = process.env.DATABASE_PUBLIC_URL?.trim();

if (!url && pub) {
  process.env.DATABASE_URL = pub;
}
