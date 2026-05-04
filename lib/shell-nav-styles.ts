/**
 * Phase 1B — shared shell navigation class fragments.
 * Light-first; primary (blue-violet) for active “app rail” affordances; no copper chrome.
 */

export const shellFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Header marketing links (desktop) */
export const shellHeaderMarketingLinkBase =
  `rounded-full px-3 py-2 text-[13px] font-semibold tracking-tight transition duration-200 ${shellFocusRing}`;
export const shellHeaderMarketingInactive =
  "ring-1 ring-inset ring-border/45 text-muted-foreground hover:bg-primary/[0.11] hover:text-primary hover:shadow-sm hover:ring-primary/25 motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0";
export const shellHeaderMarketingActive =
  "bg-gradient-to-b from-primary/[0.16] to-primary/[0.09] text-primary shadow-sm ring-2 ring-inset ring-primary/35";

/** Header app rail (Carmunity, Discussions, …) — dense top nav */
export const shellHeaderAppLinkBase =
  `carmunity-nav-link rounded-full px-2.5 py-1.5 text-[12px] font-semibold tracking-tight transition duration-200 sm:px-3 sm:py-2 sm:text-[13px] ${shellFocusRing}`;
export const shellHeaderAppInactive =
  "ring-1 ring-inset ring-border/45 text-muted-foreground hover:bg-primary/[0.11] hover:text-primary hover:shadow-sm hover:ring-primary/25 motion-safe:hover:-translate-y-px motion-reduce:hover:translate-y-0";
export const shellHeaderAppActive =
  "bg-gradient-to-b from-primary/[0.17] to-primary/[0.09] text-primary shadow-md ring-2 ring-inset ring-primary/35";

/** Desktop sidebar rows */
export const shellSidebarRowBase =
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${shellFocusRing}`;
export const shellSidebarInactive =
  "text-muted-foreground hover:bg-primary/[0.11] hover:text-primary";
export const shellSidebarActive =
  "bg-gradient-to-r from-primary/[0.14] to-primary/[0.08] text-primary ring-2 ring-inset ring-primary/30 font-semibold shadow-sm";

/** Sidebar nested items (listings, marketing) */
export const shellSidebarSubRowBase =
  `flex items-center gap-2 rounded-lg py-2 pl-9 pr-3 text-xs font-medium transition ${shellFocusRing}`;
export const shellSidebarSubInactive =
  "text-muted-foreground hover:bg-primary/10 hover:text-primary";
export const shellSidebarSubActive = "bg-primary/12 text-primary";

/** Mobile bottom nav */
export const shellMobileItemBase =
  `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium transition sm:text-xs ${shellFocusRing}`;
export const shellMobileInactive =
  "text-muted-foreground hover:bg-primary/[0.11] hover:text-primary";
export const shellMobileActive =
  "bg-gradient-to-b from-primary/[0.14] to-primary/[0.08] text-primary shadow-sm ring-1 ring-inset ring-primary/25";
