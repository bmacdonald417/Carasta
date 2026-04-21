"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gavel,
  Users,
  LayoutGrid,
  MessageSquare,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  shellMobileActive,
  shellMobileInactive,
  shellMobileItemBase,
} from "@/lib/shell-nav-styles";

const navItems = [
  { href: "/", label: "Home", icon: LayoutGrid },
  { href: "/explore", label: "Carmunity", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/auctions", label: "Auctions", icon: Gavel },
  { href: "/sell", label: "Sell", icon: PlusCircle },
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
              className={cn(
                shellMobileItemBase,
                isActive ? shellMobileActive : shellMobileInactive
              )}
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
