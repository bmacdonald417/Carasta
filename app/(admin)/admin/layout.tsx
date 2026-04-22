import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/auth/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card shadow-e1">
        <div className="carasta-container py-4 md:py-5">
          <h1 className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            Admin
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal tools — auctions, moderation, and platform analytics.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
