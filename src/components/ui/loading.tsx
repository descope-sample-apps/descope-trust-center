import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ className, size = "md", ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  inline?: boolean;
}

export function LoadingState({ message = "Loading...", inline = false, className, ...props }: LoadingStateProps) {
  if (inline) {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <LoadingSpinner size="sm" />
        <span className="text-sm text-muted-foreground">{message}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)} {...props}>
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}