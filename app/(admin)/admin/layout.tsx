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
      <div className="border-b border-border bg-background">
        <div className="carasta-container py-4 md:py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Internal tools</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            Admin
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Auctions, moderation, and platform analytics.
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
