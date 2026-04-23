/**
 * Phase 1B — shared shell navigation class fragments.
 * Light-first; primary (blue-violet) for active “app rail” affordances; no copper chrome.
 */

export const shellFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Header marketing links (desktop) */
export const shellHeaderMarketingLinkBase =
  `rounded-full px-3 py-2 text-[13px] font-medium transition ${shellFocusRing}`;
export const shellHeaderMarketingInactive =
  "text-muted-foreground hover:bg-primary/12 hover:text-primary";
export const shellHeaderMarketingActive = "bg-muted text-foreground";

/** Header app rail (Carmunity, Discussions, …) */
export const shellHeaderAppLinkBase =
  `carmunity-nav-link rounded-full px-3 py-2 text-[13px] font-medium transition ${shellFocusRing}`;
export const shellHeaderAppInactive =
  "text-muted-foreground hover:bg-primary/12 hover:text-primary";
export const shellHeaderAppActive = "bg-primary/15 text-primary";

/** Desktop sidebar rows */
export const shellSidebarRowBase =
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${shellFocusRing}`;
export const shellSidebarInactive =
  "text-muted-foreground hover:bg-primary/12 hover:text-primary";
export const shellSidebarActive = "bg-primary/15 text-primary";

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
  "text-muted-foreground hover:bg-primary/12 hover:text-primary";
export const shellMobileActive = "bg-primary/10 text-primary";
