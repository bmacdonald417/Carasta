import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      handle?: string;
      role?: "USER" | "ADMIN";
      /** Mirrors `MARKETING_ENABLED` env — seller marketing routes and nav. */
      marketingEnabled?: boolean;
    };
  }
}
