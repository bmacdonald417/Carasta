"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Gavel, Users, Car, LayoutGrid } from "lucide-react";

const navItems = [
  { href: "/", label: "Showroom", icon: LayoutGrid },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/explore", label: "Community", icon: Users },
  { href: "/merch", label: "Merch", icon: Car },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  const hideNav =
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname.startsWith("/auth");

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl lg:hidden">
      <div className="flex justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? "text-[#ff3b5c]"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
