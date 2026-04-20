"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gavel,
  Users,
  ShoppingBag,
  LayoutGrid,
  MessageSquare,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/explore", label: "Carmunity", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/merch", label: "Merch", icon: ShoppingBag },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  const hideNav =
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/community-guidelines" ||
    pathname.startsWith("/auth");

  if (hideNav) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex justify-around gap-0.5 py-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1.5 text-[10px] font-medium transition sm:text-xs ${
                isActive
                  ? "text-primary"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
