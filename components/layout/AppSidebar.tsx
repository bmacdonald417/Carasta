"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Gavel,
  Users,
  Car,
  ShoppingBag,
  PlusCircle,
  LayoutGrid,
} from "lucide-react";

const mainNav = [
  { href: "/", label: "Showroom", icon: LayoutGrid },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/explore", label: "Community", icon: Users },
  { href: "/sell", label: "Sell", icon: PlusCircle },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-neutral-200 bg-white lg:block">
      <nav className="sticky top-20 space-y-1 p-4">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#1b238e] text-white"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
        <div className="my-4 border-t border-neutral-200" />
        <Link
          href={
            session?.user
              ? `/u/${(session.user as any)?.handle}/garage`
              : "/auth/sign-in"
          }
        >
          <motion.div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.includes("/garage")
                ? "bg-[#1b238e] text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Car className="h-5 w-5 shrink-0" />
            Garage
          </motion.div>
        </Link>
        <Link href="/merch">
          <motion.div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/merch")
                ? "bg-[#1b238e] text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" />
            Merch Store
          </motion.div>
        </Link>
      </nav>
    </aside>
  );
}
