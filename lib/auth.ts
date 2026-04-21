import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "./db";
import { getReviewModeDemoHandle, isReviewModeEnabled } from "@/lib/review-mode";

export const authOptions: NextAuthOptions = {
  adapter: require("@auth/prisma-adapter").PrismaAdapter(prisma) as any,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/sign-in" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.passwordHash) return null;
        const ok = await compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl ?? user.image,
          handle: user.handle,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.handle = (user as any).handle;
        token.role = (user as any).role;
      }
      if (token.id && (!token.handle || !token.role)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { handle: true, role: true },
        });
        if (dbUser) {
          token.handle = dbUser.handle;
          token.role = dbUser.role;
        }
      }
      if (trigger === "update" && session) {
        token.handle = (session as any).handle;
        token.name = (session as any).name;
        token.picture = (session as any).image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
        (session.user as any).role = token.role;
        (session.user as any).marketingEnabled =
          process.env.MARKETING_ENABLED === "true";
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!existing) return;
        if (existing.handle) return;
        const handle =
          user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") +
          Math.random().toString(36).slice(2, 6);
        const uniqueHandle = await ensureUniqueHandle(handle);
        await prisma.user.update({
          where: { id: existing.id },
          data: { handle: uniqueHandle },
        });
      }
    },
  },
};

export async function getSession() {
  const { getServerSession } = await import("next-auth");
  const session = await getServerSession(authOptions);
  if (session) return session;

  if (!isReviewModeEnabled()) return session;

  const reviewUser = await prisma.user.findFirst({
    where: { handle: getReviewModeDemoHandle() },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      avatarUrl: true,
      handle: true,
      role: true,
    },
  });
  if (!reviewUser) return null;

  return {
    user: {
      id: reviewUser.id,
      email: reviewUser.email,
      name: reviewUser.name,
      image: reviewUser.avatarUrl ?? reviewUser.image,
      handle: reviewUser.handle,
      role: reviewUser.role,
      marketingEnabled: process.env.MARKETING_ENABLED === "true",
    } as any,
    expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  } as any;
}

async function ensureUniqueHandle(base: string): Promise<string> {
  let handle = base;
  let n = 0;
  while (true) {
    const exists = await prisma.user.findUnique({ where: { handle } });
    if (!exists) return handle;
    handle = `${base}${++n}`;
  }
}
