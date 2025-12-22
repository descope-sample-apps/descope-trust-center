import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [box-shadow:inset_0_0_0_1px_var(--color-primary,theme(colors.primary))] hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-white [box-shadow:inset_0_0_0_1px_var(--color-destructive,theme(colors.destructive))] hover:bg-destructive/90",
        outline: "border-border bg-background [box-shadow:inset_0_0_0_1px_var(--color-border,theme(colors.border))] hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 [box-shadow:inset_0_0_0_1px_theme(colors.green.200)] hover:bg-green-200",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 [box-shadow:inset_0_0_0_1px_theme(colors.yellow.200)] hover:bg-yellow-200",
        info:
          "border-transparent bg-blue-100 text-blue-800 [box-shadow:inset_0_0_0_1px_theme(colors.blue.200)] hover:bg-blue-200",
      },
      size: {
        default: "h-5 px-2.5 py-0.5 text-xs",
        sm: "h-4 px-2 py-0.5 text-xs",
        lg: "h-6 px-3 py-0.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };