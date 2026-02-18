"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur-lg lg:hidden">
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
                  ? "text-[#1b238e]"
                  : "text-neutral-500 hover:text-neutral-900"
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
