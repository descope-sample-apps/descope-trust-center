import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
  className?: string;
}

const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ children, className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "absolute top-0 left-0 z-50 -translate-y-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium rounded-md transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
);
SkipLink.displayName = "SkipLink";

export { SkipLink };