"use client";

import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  isFullScreen?: boolean;
}

export default function LoadingSpinner({ className, isFullScreen = true }: LoadingSpinnerProps) {
  if (!isFullScreen) {
     return <Loader className={cn("animate-spin text-corporate-primary", className)} />;
  }

  return (
    <div
      className="
        fixed inset-0 
        z-50 
        flex items-center justify-center 
        bg-white/70 dark:bg-neutral-950/70 
        backdrop-blur-sm
      "
    >
      <Loader className={cn("h-12 w-12 animate-spin text-corporate-primary", className)} />
    </div>
  );
}
