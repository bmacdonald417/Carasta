"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Gavel,
  Users,
  MessageSquare,
  PlusCircle,
  BookOpen,
  UserRound,
} from "lucide-react";
import { profileNavActive, profileNavHref } from "@/lib/profile-nav";
import { cn } from "@/lib/utils";
import {
  shellMobileActive,
  shellMobileInactive,
  shellMobileItemBase,
} from "@/lib/shell-nav-styles";

const signedInNavBase = [
  { href: "/explore", label: "Carmunity", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/auctions", label: "Market", icon: Gavel },
  { href: "/sell", label: "Sell", icon: PlusCircle },
] as const;

const publicNavItems = [
  { href: "/explore", label: "Carmunity", icon: Users },
  { href: "/discussions", label: "Discussions", icon: MessageSquare },
  { href: "/auctions", label: "Market", icon: Gavel },
  { href: "/resources", label: "Resources", icon: BookOpen },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const sessionHandle = (session?.user as { handle?: string } | undefined)?.handle;
  const profileHref = profileNavHref(sessionHandle);

  const hideNav =
    pathname === "/contact" ||
    pathname === "/terms" ||
    pathname === "/privacy" ||
    pathname === "/community-guidelines" ||
    pathname.startsWith("/auth");

  const marketingShell =
    pathname === "/" ||
    pathname === "/how-it-works" ||
    pathname === "/why-carasta" ||
    pathname.startsWith("/resources") ||
    pathname === "/contact";

  if (hideNav) return null;
  // Keep the public/marketing experience deliberate: use the header, not an app-bottom shell.
  if (!session?.user && marketingShell) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex justify-around gap-0.5 py-1.5">
        {(session?.user
          ? [
              ...signedInNavBase.map((i) => ({ ...i, profile: false as const })),
              { href: profileHref, label: "Profile", icon: UserRound, profile: true as const },
            ]
          : publicNavItems.map((i) => ({ ...i, profile: false as const }))
        ).map(({ href, label, icon: Icon, profile }) => {
          const isActive = profile
            ? profileNavActive(pathname, sessionHandle)
            : href === "/resources"
              ? pathname.startsWith("/resources")
              : pathname.startsWith(href);
          return (
            <Link
              key={`${label}-${href}`}
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
