import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/1a1a1a/666?text=Car";
const USER_AVATAR = "https://placehold.co/100/2a2a2a/888?text=U";

async function main() {
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
      },
      update: {},
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
      { authorId: users[0].id, content: "New track setup. Ready for the weekend.", imageUrl: PLACEHOLDER_IMAGE },
      { authorId: users[1].id, content: "Flat six sounds never get old.", imageUrl: PLACEHOLDER_IMAGE },
      { authorId: users[2].id, content: "V8 Monday.", imageUrl: PLACEHOLDER_IMAGE },
      { authorId: users[0].id, content: "Garage day.", imageUrl: PLACEHOLDER_IMAGE },
      { authorId: users[3].id, content: "JDM build in progress.", imageUrl: PLACEHOLDER_IMAGE },
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
        images: {
          create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }],
        },
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
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
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
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
  ]);

  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const buyNowExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Auctions
  const auctions = await Promise.all([
    prisma.auction.create({
      data: {
        sellerId: users[0].id,
        title: "2019 Porsche 911 GT3 RS",
        description: "Well maintained, track ready.",
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
        images: {
          create: [
            { url: PLACEHOLDER_IMAGE, sortOrder: 0 },
            { url: PLACEHOLDER_IMAGE, sortOrder: 1 },
          ],
        },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[1].id,
        title: "2016 Porsche Cayman GT4",
        description: "Manual, low miles.",
        year: 2016,
        make: "Porsche",
        model: "Cayman",
        trim: "GT4",
        mileage: 18000,
        reservePriceCents: null, // no reserve
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[2].id,
        title: "2020 Ford Mustang Shelby GT500",
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
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[3].id,
        title: "1998 Nissan Skyline R34",
        year: 1998,
        make: "Nissan",
        model: "Skyline",
        trim: "R34",
        reservePriceCents: 15000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[0].id,
        title: "2021 BMW M4 Competition",
        year: 2021,
        make: "BMW",
        model: "M4",
        trim: "Competition",
        mileage: 8000,
        reservePriceCents: null,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[4].id,
        title: "1970 Chevrolet Chevelle SS",
        year: 1970,
        make: "Chevrolet",
        model: "Chevelle",
        trim: "SS",
        reservePriceCents: 6000000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[5].id,
        title: "2018 Subaru WRX STI",
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
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
      },
    }),
    prisma.auction.create({
      data: {
        sellerId: users[1].id,
        title: "2022 Toyota GR Supra",
        year: 2022,
        make: "Toyota",
        model: "GR Supra",
        mileage: 3000,
        reservePriceCents: 5500000,
        startAt: now,
        endAt: sevenDays,
        status: "LIVE",
        images: { create: [{ url: PLACEHOLDER_IMAGE, sortOrder: 0 }] },
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
