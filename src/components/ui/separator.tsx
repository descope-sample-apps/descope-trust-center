import * as React from "react";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  }
>(
  (
    { className, orientation = "horizontal", decorative = true, ...props },
<<<<<<< HEAD
    ref
=======
    ref,
>>>>>>> origin/opencode/issue-1-task-descope-trust-center-93c
  ) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
<<<<<<< HEAD
        className
      )}
      {...props}
    />
  )
=======
        className,
      )}
      {...props}
    />
  ),
>>>>>>> origin/opencode/issue-1-task-descope-trust-center-93c
);
Separator.displayName = "Separator";

export { Separator };