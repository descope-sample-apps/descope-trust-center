import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 sm:h-9 px-4 py-2 has-[>svg]:px-3 min-h-[44px]",
        sm: "h-9 sm:h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 min-h-[40px]",
        lg: "h-11 sm:h-10 rounded-md px-6 has-[>svg]:px-4 min-h-[48px]",
        icon: "size-10 sm:size-9 min-h-[44px] min-w-[44px]",
        "icon-sm": "size-9 sm:size-8 min-h-[40px] min-w-[40px]",
        "icon-lg": "size-11 sm:size-10 min-h-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  disabled,
  loading,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  "aria-pressed": ariaPressed,
  "aria-expanded": ariaExpanded,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp 
      data-slot="button" 
      className={cn(buttonVariants({ variant, size, className }))} 
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      aria-busy={loading}
      {...props} 
    />
  );
}

export { Button, buttonVariants };
