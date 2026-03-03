import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Demo images — Unsplash collector cars
const CAR_IMAGES: Record<string, string> = {
  porsche911: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800",
  cayman: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
  mustang: "https://images.unsplash.com/photo-1584345604476-8ec50c0d4c8d?w=800",
  skyline: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
  bmw: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800",
  chevelle: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800",
  wrx: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
  supra: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800",
  corvette: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
  mclaren: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
  lambo: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800",
  generic: "https://placehold.co/600x400/1a1a1a/666?text=Car",
};
const USER_AVATAR = "https://placehold.co/100/2a2a2a/888?text=U";

async function main() {
  const existingCount = await prisma.auction.count();
  if (existingCount > 0) {
    console.log("Seed skipped — database already has", existingCount, "auctions.");
    return;
  }

  const passwordHash = await hash("password123", 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "tom@example.com" },
      create: {
        email: "tom@example.com",
        passwordHash,
        handle: "trackdaytom",
        name: "Tom",
        bio: "Track days and Porsches.",
        avatarUrl: USER_AVATAR,
        role: "ADMIN",
      },
      update: { role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "flat6@example.com" },
      create: {
        email: "flat6@example.com",
        passwordHash,
        handle: "flat6",
        name: "Alex",
        bio: "Flat-six forever.",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "v8vince@example.com" },
      create: {
        email: "v8vince@example.com",
        passwordHash,
        handle: "v8vince",
        name: "Vince",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "jdm@example.com" },
      create: {
        email: "jdm@example.com",
        passwordHash,
        handle: "jdm",
        name: "Jay",
        bio: "JDM only.",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "classic@example.com" },
      create: {
        email: "classic@example.com",
        passwordHash,
        handle: "classic",
        name: "Sam",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "rally@example.com" },
      create: {
        email: "rally@example.com",
        passwordHash,
        handle: "rally",
        name: "Riley",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "collector@example.com" },
      create: {
        email: "collector@example.com",
        passwordHash,
        handle: "collector",
        name: "Morgan",
        bio: "Classic car collector. Always hunting.",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
    prisma.user.upsert({
      where: { email: "dealer@example.com" },
      create: {
        email: "dealer@example.com",
        passwordHash,
        handle: "dealer",
        name: "Chris",
        bio: "Premium dealer. Curated inventory.",
        avatarUrl: USER_AVATAR,
      },
      update: {},
    }),
  ]);

  // Follows
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: users[0].id,
        followingId: users[1].id,
      },
    },
    create: { followerId: users[0].id, followingId: users[1].id },
    update: {},
  });
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: users[1].id,
        followingId: users[0].id,
      },
    },
    create: { followerId: users[1].id, followingId: users[0].id },
    update: {},
  });
  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: users[2].id,
        followingId: users[0].id,
      },
    },
    create: { followerId: users[2].id, followingId: users[0].id },
    update: {},
  });

  // Posts
  await prisma.post.createMany({
    data: [
      { authorId: users[0].id, content: "New track setup. Ready for the weekend.", imageUrl: CAR_IMAGES.porsche911 },
      { authorId: users[1].id, content: "Flat six sounds never get old.", imageUrl: CAR_IMAGES.cayman },
      { authorId: users[2].id, content: "V8 Monday.", imageUrl: CAR_IMAGES.mustang },
      { authorId: users[0].id, content: "Garage day.", imageUrl: CAR_IMAGES.generic },
      { authorId: users[3].id, content: "JDM build in progress.", imageUrl: CAR_IMAGES.skyline },
      { authorId: users[6].id, content: "New acquisition. 1969 Corvette.", imageUrl: CAR_IMAGES.corvette },
      { authorId: users[7].id, content: "Fresh listing going live tomorrow.", imageUrl: CAR_IMAGES.generic },
    ],
  });

  // Garage cars
  const garageCars = await Promise.all([
    prisma.garageCar.create({
      data: {
        ownerId: users[0].id,
        type: "GARAGE",
        year: 2019,
        make: "Porsche",
        model: "911",
        trim: "GT3 RS",
        notes: "Track focused.",
        images: { create: [{ url: CAR_IMAGES.porsche911, sortOrder: 0 }] },
      },
    }),
    prisma.garageCar.create({
      data: {
        ownerId: users[0].id,
        type: "DREAM",
        year: 2024,
        make: "Porsche",
        model: "911",
        trim: "GT3 RS",
        notes: "Next dream.",
        images: { create: [{ url: CAR_IMAGES.porsche911, sortOrder: 0 }] },
      },
    }),
    prisma.garageCar.create({
      data: {
        ownerId: users[1].id,
        type: "GARAGE",
        year: 2016,
        make: "Porsche",
        model: "Cayman",
        trim: "GT4",
        images: { create: [{ url: CAR_IMAGES.cayman, sortOrder: 0 }] },
      },
    }),
    prisma.garageCar.create({
      data: {
        ownerId: users[6].id,
        type: "DREAM",
        year: 2023,
        make: "McLaren",
        model: "720S",
        notes: "Dream garage.",
        images: { create: [{ url: CAR_IMAGES.mclaren, sortOrder: 0 }] },
      },
    }),
    prisma.garageCar.create({
      data: {
        ownerId: users[7].id,
        type: "GARAGE",
        year: 2022,
        make: "Lamborghini",
        model: "Huracán",
        notes: "Weekend cruiser.",
        images: { create: [{ url: CAR_IMAGES.lambo, sortOrder: 0 }] },
      },
    }),
  ]);

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const buyNowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Auctions — demo listings with varied collector cars
  const auctions = await Promise.all([
    prisma.auction.create({
      data: {
        sellerId: users[0].id,
        title: "2019 Porsche 911 GT3 RS",
        description: "Well maintained, track ready. Full service history.",
        year: 2019,
        make: "Porsche",
        model: "911",
        trim: "GT3 RS",
        mileage: 12000,
        reservePriceCents: 20000000, // 200k
        buyNowPriceCents: 25000000,
        buyNowExpiresAt: buyNowExpires,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        conditionGrade: "EXCELLENT",
        conditionSummary:
          "Two-owner car with full Porsche service history. Paint is original with no resprays. Interior shows minimal wear. All fluids changed at 10k miles.",
        imperfections: [
          {
            location: "Front bumper",
            description: "Small stone chip cluster, paint intact",
            severity: "minor",
          },
          {
            location: "Driver seat bolster",
            description: "Slight wear from entry/exit",
            severity: "moderate",
          },
        ],
        images: {
          create: [
            { url: CAR_IMAGES.porsche911, sortOrder: 0 },
            { url: CAR_IMAGES.generic, sortOrder: 1 },
          ],
        },
        damageImages: {
          create: [
            { label: "Front bumper chips", imageUrl: CAR_IMAGES.porsche911 },
            { label: "Driver seat bolster", imageUrl: CAR_IMAGES.generic },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[1].id,
        title: "2016 Porsche Cayman GT4",
        description: "Manual, low miles. Purity of driving.",
        year: 2016,
        make: "Porsche",
        model: "Cayman",
        trim: "GT4",
        mileage: 18000,
        reservePriceCents: null,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.cayman, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[2].id,
        title: "2020 Ford Mustang Shelby GT500",
        description: "760 HP supercharged V8. Like new.",
        year: 2020,
        make: "Ford",
        model: "Mustang",
        trim: "Shelby GT500",
        mileage: 5000,
        reservePriceCents: 8000000,
        buyNowPriceCents: 9500000,
        buyNowExpiresAt: buyNowExpires,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.mustang, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[3].id,
        title: "1998 Nissan Skyline R34",
        description: "JDM legend. RHD import, numbers matching.",
        year: 1998,
        make: "Nissan",
        model: "Skyline",
        trim: "R34",
        mileage: 45000,
        reservePriceCents: 15000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.skyline, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[0].id,
        title: "2021 BMW M4 Competition",
        description: "S58 inline-six. Carbon bucket seats.",
        year: 2021,
        make: "BMW",
        model: "M4",
        trim: "Competition",
        mileage: 8000,
        reservePriceCents: null,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.bmw, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[4].id,
        title: "1970 Chevrolet Chevelle SS",
        description: "Classic muscle. 454 big block, 4-speed.",
        year: 1970,
        make: "Chevrolet",
        model: "Chevelle",
        trim: "SS",
        mileage: 82000,
        reservePriceCents: 6000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.chevelle, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[5].id,
        title: "2018 Subaru WRX STI",
        description: "Rally-bred AWD. Stage 2 tune.",
        year: 2018,
        make: "Subaru",
        model: "WRX",
        trim: "STI",
        mileage: 25000,
        reservePriceCents: 3500000,
        buyNowPriceCents: 4200000,
        buyNowExpiresAt: buyNowExpires,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.wrx, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[1].id,
        title: "2022 Toyota GR Supra",
        description: "B58 inline-six. Manual transmission.",
        year: 2022,
        make: "Toyota",
        model: "GR Supra",
        mileage: 3000,
        reservePriceCents: 5500000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.supra, sortOrder: 0 }] },
      },
    }),
    // New demo listings from collector & dealer
    prisma.auction.create({
      data: {
        sellerId: users[6].id,
        title: "1969 Chevrolet Corvette Stingray",
        description: "L88 tribute. Restored, show quality.",
        year: 1969,
        make: "Chevrolet",
        model: "Corvette",
        trim: "Stingray",
        mileage: 12000,
        reservePriceCents: 12000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.corvette, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[7].id,
        title: "2023 McLaren 720S",
        description: "Twin-turbo V8. Carbon fiber everywhere.",
        year: 2023,
        make: "McLaren",
        model: "720S",
        mileage: 1200,
        reservePriceCents: 28000000,
        buyNowPriceCents: 32000000,
        buyNowExpiresAt: buyNowExpires,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.mclaren, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[7].id,
        title: "2022 Lamborghini Huracán EVO",
        description: "Naturally aspirated V10. Verde Mantis.",
        year: 2022,
        make: "Lamborghini",
        model: "Huracán",
        trim: "EVO",
        mileage: 2500,
        reservePriceCents: 24000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: CAR_IMAGES.lambo, sortOrder: 0 }] },
      },
    }),
  ]);

  // Bids on first auction
  const bidAmounts = [18000000, 18500000, 19000000, 19500000]; // 180k, 185k, 190k, 195k
  for (let i = 0; i < bidAmounts.length; i++) {
    await prisma.bid.create({
      data: {
        auctionId: auctions[0].id,
        bidderId: users[(i % 3) + 1].id,
        amountCents: bidAmounts[i],
      },
    });
  }

  // Auto-bids on first and second auctions
  await prisma.autoBid.create({
    data: {
      auctionId: auctions[0].id,
      bidderId: users[2].id,
      maxAmountCents: 21000000, // 210k
      active: true,
    },
  });
  await prisma.autoBid.create({
    data: {
      auctionId: auctions[1].id,
      bidderId: users[0].id,
      maxAmountCents: 7500000, // 75k
      active: true,
    },
  });

  console.log("Seed complete. Users:", users.length, "Auctions:", auctions.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
