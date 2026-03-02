import { z } from "zod";
import * as cheerio from "cheerio";

export const scrapedListingSchema = z.object({
  year: z.number().int().min(1900).max(2030),
  make: z.string().min(1),
  model: z.string().min(1),
  priceCents: z.number().int().positive(),
  mileage: z.number().int().nonnegative().optional(),
  vin: z.string().optional(),
  stockNumber: z.string().optional(),
  imageUrls: z.array(z.string().url()).default([]),
  detailUrl: z.string().url().optional(),
});

export type ValidatedListing = z.infer<typeof scrapedListingSchema>;

const RATE_LIMIT_MS = 2000;
const MAX_LISTINGS = 25;
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(text: string): number | null {
  const match = text.replace(/[,$\s]/g, "").match(/\d+/);
  if (!match) return null;
  const dollars = parseInt(match[0], 10);
  return isNaN(dollars) ? null : dollars * 100;
}

function parseMileage(text: string): number | null {
  const match = text.replace(/[,.\s]/g, "").match(/\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return isNaN(n) ? null : n;
}

function parseYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  return isNaN(n) ? null : n;
}

/**
 * Scrape Boch Exotics used inventory. Uses Playwright for dynamic content.
 * Falls back to mock data if scraping fails or returns no results.
 */
export async function scrapeBochInventory(): Promise<ValidatedListing[]> {
  const listings: ValidatedListing[] = [];
  let playwright: typeof import("playwright") | null = null;

  try {
    playwright = await import("playwright");
  } catch {
    console.warn("[boch-sync] Playwright not available, using mock data");
    return getMockListings();
  }

  const urls = [
    "https://www.bochexotics.com/used-inventory/index.htm",
    "https://www.bochexotics.com/used-inventory/index.htm?make=Ferrari",
    "https://www.bochexotics.com/used-inventory/index.htm?make=Lamborghini",
    "https://www.bochexotics.com/used-inventory/index.htm?make=Porsche",
  ];

  const browser = await playwright.chromium.launch({ headless: true });
  const seen = new Set<string>();

  try {
    for (const url of urls) {
      if (listings.length >= MAX_LISTINGS) break;

      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(url, { waitUntil: "networkidle", timeout: 15000 }).catch(() => null);
      await sleep(RATE_LIMIT_MS);

      const html = await page.content();
      const $ = cheerio.load(html);

      $("[data-vin], .vehicle-card, .inventory-listing, .vehicle-row, a[href*='vehicleDetails'], .srp-list-item").each((_, el) => {
        if (listings.length >= MAX_LISTINGS) return false;

        const $el = $(el);
        const vin = $el.attr("data-vin") ?? $el.find("[data-vin]").attr("data-vin") ?? undefined;
        const stock = $el.find(".stock-number, [data-stock]").first().text().trim() || undefined;
        const priceText = $el.find(".price, .vehicle-price, .listing-price, [data-price]").first().text().trim();
        const priceCents = parsePrice(priceText);
        const titleText = $el.find("h2, h3, .title, .vehicle-title, .listing-title").first().text().trim();
        const year = parseYear(titleText) ?? parseYear($el.text()) ?? new Date().getFullYear();
        const makeModel = titleText.replace(/\b(19|20)\d{2}\b/, "").trim().split(/\s+/);
        const make = makeModel[0] || "Exotic";
        const model = makeModel.slice(1).join(" ") || "Model";
        const mileageText = $el.find(".mileage, [data-mileage]").first().text().trim();
        const mileage = parseMileage(mileageText) ?? undefined;
        const img = $el.find("img").first().attr("src");
        const imageUrls = img ? [img.startsWith("http") ? img : `https://www.bochexotics.com${img.startsWith("/") ? "" : "/"}${img}`] : [];
        const link = $el.find("a[href*='vehicleDetails'], a[href*='inventory']").first().attr("href");
        const detailUrl = link ? (link.startsWith("http") ? link : `https://www.bochexotics.com${link.startsWith("/") ? "" : "/"}${link}`) : undefined;

        const dedupeKey = vin || stock || `${year}-${make}-${model}-${priceCents}`;
        if (seen.has(dedupeKey) || !priceCents) return;
        seen.add(dedupeKey);

        const parsed = scrapedListingSchema.safeParse({
          year,
          make,
          model,
          priceCents,
          mileage,
          vin: vin || undefined,
          stockNumber: stock || undefined,
          imageUrls,
          detailUrl,
        });
        if (parsed.success) listings.push(parsed.data);
      });

      await page.close();
    }
  } catch (err) {
    console.warn("[boch-sync] Scrape error:", err);
  } finally {
    await browser.close();
  }

  if (listings.length === 0) {
    console.warn("[boch-sync] No listings scraped, using mock data");
    return getMockListings();
  }

  return listings;
}

/**
 * Fallback mock dataset for when scraping fails or returns nothing.
 */
function getMockListings(): ValidatedListing[] {
  return [
    {
      year: 2023,
      make: "Ferrari",
      model: "Roma",
      priceCents: 28500000,
      mileage: 3200,
      vin: "ZFF94LPA3R0284567",
      stockNumber: "P12345",
      imageUrls: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"],
    },
    {
      year: 2022,
      make: "Lamborghini",
      model: "Huracán EVO",
      priceCents: 26500000,
      mileage: 4500,
      vin: "ZHWUC2ZF8NLA12345",
      stockNumber: "L67890",
      imageUrls: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"],
    },
    {
      year: 2024,
      make: "Porsche",
      model: "911 GT3",
      priceCents: 19500000,
      mileage: 800,
      vin: "WP0ZZZ99ZPS123456",
      stockNumber: "P91101",
      imageUrls: ["https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800"],
    },
    {
      year: 2021,
      make: "Maserati",
      model: "MC20",
      priceCents: 22500000,
      mileage: 12000,
      stockNumber: "M45678",
      imageUrls: ["https://placehold.co/600x400/1a1a1a/666?text=MC20"],
    },
    {
      year: 2022,
      make: "McLaren",
      model: "720S",
      priceCents: 29500000,
      mileage: 2100,
      vin: "SBMXXADC8NW123456",
      imageUrls: ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800"],
    },
  ];
}

/**
 * Generate demo auctions from validated listings.
 * startingBidCents = priceCents * 0.6, reservePriceCents = priceCents * 0.85
 * endAt: random 3–7 days from now, startAt: now
 */
export async function generateDemoAuctions(
  listings: ValidatedListing[],
  sellerId: string,
  prisma: import("@prisma/client").PrismaClient
): Promise<number> {
  const now = new Date();
  const buyNowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let created = 0;

  for (const listing of listings) {
    if (listing.vin || listing.stockNumber) {
      const existing = await prisma.auction.findFirst({
        where: {
          sellerId,
          ...(listing.vin
            ? { vin: listing.vin }
            : { description: { contains: listing.stockNumber! } }),
        },
      });
      if (existing) continue;
    }

    const reservePriceCents = Math.round(listing.priceCents * 0.85);
    const buyNowPriceCents = listing.priceCents;
    const daysFromNow = 3 + Math.floor(Math.random() * 5);
    const endAt = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    const title = `${listing.year} ${listing.make} ${listing.model}`;
    const description = [
      "From Boch Exotics inventory.",
      listing.mileage ? `${listing.mileage.toLocaleString()} miles.` : null,
      listing.stockNumber ? `Stock #${listing.stockNumber}.` : null,
    ]
      .filter(Boolean)
      .join(" ");

    await prisma.auction.create({
      data: {
        sellerId,
        title,
        description,
        year: listing.year,
        make: listing.make,
        model: listing.model,
        vin: listing.vin,
        mileage: listing.mileage,
        reservePriceCents,
        buyNowPriceCents,
        buyNowExpiresAt: buyNowExpires,
        startAt: now,
        endAt,
        status: "LIVE",
        images: {
          create: (listing.imageUrls.length > 0 ? listing.imageUrls : ["https://placehold.co/600x400/1a1a1a/666?text=No+image"]).map(
            (url, i) => ({ url, sortOrder: i })
          ),
        },
      },
    });
    created++;
  }

  return created;
}
