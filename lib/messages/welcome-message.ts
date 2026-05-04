import { prisma } from "@/lib/db";

const CARASTA_HANDLE = "carasta";

const WELCOME_BODY = `👋 Welcome to Carmunity by Carasta!

We're thrilled you're here. Carmunity is built for people who live and breathe cars — whether you're here to bid on collector auctions, share your garage, join discussions, or connect with fellow enthusiasts.

Here's what you can do right now:

🏎  **Explore** the Carmunity feed — share posts, react, and follow voices you care about.
🔧  **Discussions** — join gear-organized forums on everything from mechanics to JDM to classic muscle.
🚗  **Garage** — add your cars and build your collection profile.
🔨  **Auctions** — browse live listings or list your own vehicle.

If you ever need help, check out our Resources hub or reply right here — we're a small team and we actually read these.

Welcome to the community. Now go find your next car. 🏁

— The Carasta Team`;

/**
 * Sends a welcome DM from the @carasta system user to a new user.
 * Safe to call multiple times — idempotent via directKey deduplication.
 */
export async function sendWelcomeMessage(newUserId: string): Promise<void> {
  try {
    const carastaUser = await prisma.user.findUnique({
      where: { handle: CARASTA_HANDLE },
      select: { id: true },
    });

    if (!carastaUser) return; // System user not seeded yet — skip silently

    const [minId, maxId] =
      carastaUser.id < newUserId
        ? [carastaUser.id, newUserId]
        : [newUserId, carastaUser.id];

    const directKey = `${minId}:${maxId}:g`;

    // Create-or-get the conversation
    const conversation = await prisma.conversation.upsert({
      where: { directKey },
      create: {
        directKey,
        auctionId: null,
        participants: {
          create: [{ userId: carastaUser.id }, { userId: newUserId }],
        },
      },
      update: {},
      select: { id: true, messages: { take: 1, select: { id: true } } },
    });

    // Only send if there are no messages yet (idempotent)
    if (conversation.messages.length > 0) return;

    const preview =
      "👋 Welcome to Carmunity by Carasta! We're thrilled you're here.";
    const now = new Date();

    await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: carastaUser.id,
          body: WELCOME_BODY,
        },
      }),
      prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: now,
          lastMessagePreview: preview,
        },
      }),
      prisma.notification.create({
        data: {
          userId: newUserId,
          actorId: carastaUser.id,
          targetId: conversation.id,
          type: "MESSAGE",
          payloadJson: JSON.stringify({
            conversationId: conversation.id,
            href: `/messages/${conversation.id}`,
            message: preview,
            title: "Welcome to Carmunity!",
            preview,
          }),
        },
      }),
    ]);
  } catch (err) {
    // Non-fatal — don't block sign-up if welcome message fails
    console.error("[sendWelcomeMessage] error:", err);
  }
}
