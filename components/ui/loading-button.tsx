"use client";

import * as React from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { cn } from "@/lib/utils";

export function LoadingButton({
  loading,
  loadingLabel = "Loading",
  children,
  className,
  disabled,
  ...props
}: ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
}) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      aria-busy={loading ? "true" : undefined}
      className={cn(loading ? "cursor-wait" : "", className)}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <InlineSpinner label={loadingLabel} className="text-inherit" />
          <span className="text-sm font-medium">{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
}

