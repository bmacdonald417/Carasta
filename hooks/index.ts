/**
 * Shared React hooks.
 * Add useSessionUser, useToast, etc. as needed.
 */

import { useEffect, useState } from "react";

/** Returns true only after mount. Use to avoid hydration mismatch for time-dependent UI. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
