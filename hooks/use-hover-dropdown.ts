import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps a dropdown/popover open on hover with a delayed close so the pointer can
 * travel from trigger to portaled content without flicker. Click still toggles via Radix.
 */
export function useHoverDropdown(closeDelayMs = 220) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  const cancelClose = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    timerRef.current = window.setTimeout(() => {
      setOpen(false);
      timerRef.current = null;
    }, closeDelayMs);
  }, [cancelClose, closeDelayMs]);

  const openNow = useCallback(() => {
    cancelClose();
    setOpen(true);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);

  return { open, setOpen, openNow, scheduleClose, cancelClose };
}
