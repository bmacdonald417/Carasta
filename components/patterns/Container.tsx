import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  /** Max width variant. carasta-container is 1280px by default. */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
};

const maxWidthClasses: Record<NonNullable<ContainerProps["maxWidth"]>, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export function Container({
  children,
  className,
  maxWidth,
}: ContainerProps) {
  return (
    <div
      className={cn(
        "carasta-container",
        maxWidth && maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
