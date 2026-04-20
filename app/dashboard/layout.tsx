import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") {
    redirect("/");
  }
  return <>{children}</>;
}
