"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Gavel,
  LayoutGrid,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const navLinks = [
  { href: "/auctions", label: "Auctions" },
  { href: "/explore", label: "Community" },
  { href: "/sell", label: "Sell" },
];

export function Nav() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-foreground"
        >
          CARASTA
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-2xl bg-muted" />
          ) : session ? (
            <>
              <Link href="/sell" className="hidden md:inline-flex">
                <Button size="sm" variant="performance">
                  <PlusCircle className="mr-1.5 h-4 w-4" />
                  Sell
                </Button>
              </Link>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user?.image ?? undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-xs">
                        {(session.user?.name ?? session.user?.email ?? "U")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link
                      href={
                        (session.user as any)?.handle
                          ? `/u/${(session.user as any).handle}`
                          : "/settings"
                      }
                      onClick={() => setOpen(false)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" onClick={() => setOpen(false)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/api/auth/signout"
                      onClick={() => setOpen(false)}
                      className="text-muted-foreground"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button size="sm" variant="performance" asChild>
                <Link href="/auth/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="border-t border-border/50 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
