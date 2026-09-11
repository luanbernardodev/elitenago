import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoaded?: boolean;
}

export function Skeleton({
  className,
  isLoaded = false,
  children,
  ...props
}: SkeletonProps) {
  if (isLoaded) return <>{children}</>;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/5 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
