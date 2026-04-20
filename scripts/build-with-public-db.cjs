/**
 * Railway / Nixpacks build runs on a network that cannot reach
 * `postgres-*.railway.internal` (private networking is not available during build).
 * Prisma CLI during `npm run build` must use the TCP proxy URL.
 *
 * On the **web** service (the service that runs `npm run build`), set:
 *   DATABASE_PUBLIC_URL = Postgres plugin “public” / proxy connection string
 * and keep:
 *   DATABASE_URL = private URL for **runtime** (Next + Prisma at `npm start`).
 *
 * Railway must expose DATABASE_PUBLIC_URL to the **build** environment for that
 * service (same Variables list as DATABASE_URL). If it exists only on the Postgres
 * service, add a **reference** or paste the public URL on the web service.
 */
const { execSync } = require("child_process");

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

execSync("npm run build:core", { stdio: "inherit", env: process.env });
