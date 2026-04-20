/**
 * Railway / Nixpacks build runs on a network that typically cannot reach
 * `postgres-*.railway.internal`. Prisma CLI during `npm run build` should use
 * the TCP proxy URL when provided.
 *
 * Set on the **web service** (same place as DATABASE_URL):
 *   DATABASE_PUBLIC_URL = Postgres plugin "public" / proxy connection string
 *
 * At **runtime**, leave DATABASE_URL as the private URL; Next/Prisma read that
 * when the container starts. This script only affects the build child process.
 */
const { spawnSync } = require("child_process");

const env = { ...process.env };
if (env.DATABASE_PUBLIC_URL) {
  env.DATABASE_URL = env.DATABASE_PUBLIC_URL;
}

const result = spawnSync("npm", ["run", "build:core"], {
  stdio: "inherit",
  env,
  shell: true,
});

process.exit(result.status === null ? 1 : result.status);
