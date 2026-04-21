/**
 * Local / operator convenience: Prisma and Next read `DATABASE_URL` only
 * (`prisma/schema.prisma`). For environments where you store the reachable
 * (public proxy) string in `DATABASE_PUBLIC_URL` and omit `DATABASE_URL`,
 * copy it before spawning the child process.
 *
 * Railway production: set private `DATABASE_URL` on the web service (runtime).
 * Nixpacks build: `scripts/build-with-public-db.cjs` handles public vs private.
 * Do not commit real connection strings to `.env.example`.
 */
const { spawnSync } = require("child_process");

function ensureDatabaseUrlFromPublic() {
  const url = process.env.DATABASE_URL;
  const pub = process.env.DATABASE_PUBLIC_URL;
  const missing = !url || String(url).trim() === "";
  if (missing && pub && String(pub).trim() !== "") {
    process.env.DATABASE_URL = pub;
    console.log(
      "[run-with-local-db] DATABASE_URL was empty; using DATABASE_PUBLIC_URL for this command."
    );
  }
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error(
    "Usage: node scripts/run-with-local-db.cjs <command> [args...]\nExample: node scripts/run-with-local-db.cjs npx next dev"
  );
  process.exit(1);
}

ensureDatabaseUrlFromPublic();

const [cmd, ...rest] = args;
const result = spawnSync(cmd, rest, {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status === null ? 1 : result.status);
