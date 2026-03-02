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
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
        <div className="carasta-container py-4">
          <h1 className="font-display text-xl font-semibold uppercase tracking-[0.15em] text-[#00E5FF]">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Auction management, user moderation, platform analytics
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}
