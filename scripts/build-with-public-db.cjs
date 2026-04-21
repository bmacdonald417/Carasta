/**
 * Railway / Nixpacks build often cannot reach `postgres-*.railway.internal`.
 * Prisma CLI during `npm run build` needs a TCP-reachable URL.
 *
 * Simplified setup: set **only** `DATABASE_PUBLIC_URL` (public proxy) on the web
 * service. This script assigns `process.env.DATABASE_URL` from it for the build
 * subprocess so `prisma generate` / `db push` / `seed` / `next build` all see it.
 *
 * Split setup (optional): private `DATABASE_URL` for runtime + public
 * `DATABASE_PUBLIC_URL` for build. If `DATABASE_PUBLIC_URL` is set, it wins for
 * this build process. At `next start`, `lib/db-env.ts` mirrors public →
 * `DATABASE_URL` when `DATABASE_URL` is unset.
 */
const { execSync } = require("child_process");

/**
 * Small Postgres plans + public proxy: `next build` static generation can open many
 * concurrent Prisma pools (one per worker process). Append Prisma URL params so each
 * pool stays tiny unless the operator already set them on Railway.
 *
 * Override cap: DATABASE_BUILD_CONNECTION_LIMIT (digits only).
 */
function withBuildPostgresConnectionGuards(urlString) {
  if (!urlString) return urlString;
  try {
    const u = new URL(urlString);
    const proto = u.protocol.toLowerCase();
    if (proto !== "postgres:" && proto !== "postgresql:") return urlString;
    const cap = String(process.env.DATABASE_BUILD_CONNECTION_LIMIT || "3").trim();
    if (!u.searchParams.has("connection_limit") && /^\d+$/.test(cap)) {
      u.searchParams.set("connection_limit", cap);
    }
    if (!u.searchParams.has("pool_timeout")) {
      u.searchParams.set("pool_timeout", "60");
    }
    return u.toString();
  } catch {
    return urlString;
  }
}

function maskDbUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}${u.pathname}`;
  } catch {
    return "(unparseable URL)";
  }
}

const publicUrl = process.env.DATABASE_PUBLIC_URL;
if (publicUrl) {
  process.env.DATABASE_URL = publicUrl;
  console.log(
    "[build-with-public-db] Prisma build will use DATABASE_PUBLIC_URL host:",
    maskDbUrl(publicUrl)
  );
} else if (/\brailway\.internal\b/i.test(String(process.env.DATABASE_URL || ""))) {
  console.error(
    [
      "[build-with-public-db] DATABASE_URL uses a Railway private hostname, but DATABASE_PUBLIC_URL is not set in this build environment.",
      "Nixpacks cannot reach postgres*.railway.internal during `npm run build`.",
      "",
      "Fix (Carasta *web* service → Variables):",
      "  • Add DATABASE_PUBLIC_URL = your Postgres public / *.proxy.rlwy.net connection string.",
      "  • Define it on the **same service** that builds and deploys the app (not only on the DB service).",
      "  • If Railway offers a “Build” / “Build-time” toggle for variables, ensure DATABASE_PUBLIC_URL is enabled for builds.",
    ].join("\n")
  );
  process.exit(1);
} else {
  console.log(
    "[build-with-public-db] DATABASE_PUBLIC_URL unset; using DATABASE_URL for build:",
    maskDbUrl(process.env.DATABASE_URL || "")
  );
}

const guarded = withBuildPostgresConnectionGuards(process.env.DATABASE_URL);
if (guarded && guarded !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = guarded;
  console.log(
    "[build-with-public-db] Applied Prisma connection guards to DATABASE_URL for build (connection_limit / pool_timeout)."
  );
}

execSync("npm run build:core", { stdio: "inherit", env: process.env });
