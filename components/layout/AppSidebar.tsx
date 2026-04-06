"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { hoverScale, tapScale } from "@/lib/motion";
import {
  Gavel,
  Users,
  Car,
  ShoppingBag,
  PlusCircle,
  LayoutGrid,
  ListOrdered,
  Megaphone,
} from "lucide-react";

const mainNav = [
  { href: "/", label: "Showroom", icon: LayoutGrid },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/explore", label: "Community", icon: Users },
  { href: "/sell", label: "Sell", icon: PlusCircle },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const handle = (session?.user as { handle?: string } | undefined)?.handle;
  const marketingEnabled = Boolean(
    (session?.user as { marketingEnabled?: boolean } | undefined)
      ?.marketingEnabled
  );

  return (
    <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[#0a0a0f]/50 backdrop-blur-sm lg:block">
      <nav className="sticky top-20 space-y-1 p-4">
        {mainNav.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          if (href === "/sell") {
            const listingsHref = handle ? `/u/${handle}/listings` : null;
            const marketingHref =
              handle && marketingEnabled ? `/u/${handle}/marketing` : null;
            const listingsActive =
              listingsHref != null && pathname.startsWith(listingsHref);
            const marketingActive =
              marketingHref != null && pathname.startsWith(marketingHref);
            return (
              <div key={href} className="space-y-0.5">
                <Link href={href}>
                  <motion.div
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive && !listingsActive && !marketingActive
                        ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-lg shadow-[#ff3b5c]/20"
                        : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                    }`}
                    whileHover={hoverScale}
                    whileTap={tapScale}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {label}
                  </motion.div>
                </Link>
                {listingsHref && (
                  <Link href={listingsHref}>
                    <motion.div
                      className={`flex items-center gap-2 rounded-lg py-2 pl-9 pr-3 text-xs font-medium transition ${
                        listingsActive
                          ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-md shadow-[#ff3b5c]/15"
                          : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
                      }`}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <ListOrdered className="h-4 w-4 shrink-0 opacity-80" />
                      My listings
                    </motion.div>
                  </Link>
                )}
                {marketingHref && (
                  <Link href={marketingHref}>
                    <motion.div
                      className={`flex items-center gap-2 rounded-lg py-2 pl-9 pr-3 text-xs font-medium transition ${
                        marketingActive
                          ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-md shadow-[#ff3b5c]/15"
                          : "text-neutral-500 hover:bg-white/5 hover:text-neutral-200"
                      }`}
                      whileHover={hoverScale}
                      whileTap={tapScale}
                    >
                      <Megaphone className="h-4 w-4 shrink-0 opacity-80" />
                      Marketing
                    </motion.div>
                  </Link>
                )}
              </div>
            );
          }
          return (
            <Link key={href} href={href}>
              <motion.div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-lg shadow-[#ff3b5c]/20"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                }`}
                whileHover={hoverScale}
                whileTap={tapScale}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </motion.div>
            </Link>
          );
        })}
        <div className="my-4 border-t border-white/10" />
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
                ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-lg shadow-[#ff3b5c]/20"
                : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
            }`}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <Car className="h-5 w-5 shrink-0" />
            Garage
          </motion.div>
        </Link>
        <Link href="/merch">
          <motion.div
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              pathname.startsWith("/merch")
                ? "bg-[#ff3b5c]/90 text-[#0a0a0f] shadow-lg shadow-[#ff3b5c]/20"
                : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
            }`}
            whileHover={hoverScale}
            whileTap={tapScale}
          >
            <ShoppingBag className="h-5 w-5 shrink-0" />
            Merch Store
          </motion.div>
        </Link>
      </nav>
    </aside>
  );
}
