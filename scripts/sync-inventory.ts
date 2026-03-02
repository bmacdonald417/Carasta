/**
 * Sync Boch Exotics inventory into demo auctions.
 * Uses the "dealer" user (or first ADMIN) as seller.
 * Run: npm run sync-inventory
 */
import { prisma } from "../lib/db";
import { scrapeBochInventory, generateDemoAuctions } from "../lib/scraper/boch-sync";

async function main() {
  const dealer = await prisma.user.findFirst({
    where: { handle: "dealer" },
  });
  const seller = dealer ?? (await prisma.user.findFirst({ where: { role: "ADMIN" } }));

  if (!seller) {
    console.error("No dealer or ADMIN user found. Run db:seed first.");
    process.exit(1);
  }

  console.log(`Using seller: @${seller.handle} (${seller.name})`);

  const listings = await scrapeBochInventory();
  console.log(`Scraped/loaded ${listings.length} listings`);

  const created = await generateDemoAuctions(listings, seller.id, prisma);
  console.log(`Created ${created} new demo auctions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
