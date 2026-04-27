"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ProfileQrDialog({
  profilePath,
  displayName,
  className,
}: {
  /** Canonical in-app profile route (e.g. `/u/handle`). */
  profilePath: string;
  displayName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return profilePath;
    return `${window.location.origin}${profilePath}`;
  }, [profilePath]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available (e.g. older browsers / permissions).
    }
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `carasta-${displayName.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()}-qr.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      // noop
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          title="Profile QR"
          aria-label="Open profile QR code"
          className={cn("w-9 px-0 border-border bg-muted/40 text-foreground hover:bg-muted/60", className)}
        >
          <QrCode className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm border-border bg-popover text-popover-foreground shadow-e3">
        <DialogHeader>
          <DialogTitle>Share profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Scan to view this profile on Carasta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-white p-3 shadow-e1">
              <QRCodeCanvas
                value={fullUrl}
                size={220}
                includeMargin
                level="M"
                bgColor="#FFFFFF"
                fgColor="#0B1020"
                ref={(node) => {
                  canvasRef.current = node;
                }}
              />
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{displayName}</span>
          </p>
          <p className="break-all rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            {fullUrl}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            className="w-full border-border"
            onClick={() => void copyLink()}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" aria-hidden />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" aria-hidden />
                Copy profile link
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={downloadPng}>
            <Download className="mr-2 h-4 w-4" aria-hidden />
            Download QR (PNG)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

