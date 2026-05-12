import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[16px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 font-heading leading-normal",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground shadow-panel hover:bg-accent/90",
        secondary: "bg-surface-subtle text-foreground hover:bg-surface-muted",
        outline: "border border-border bg-surface text-foreground hover:bg-surface-subtle",
        ghost: "text-muted-foreground hover:bg-surface-subtle hover:text-foreground",
      },
      size: {
        sm: "h-9 px-3.5",
        default: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
});
