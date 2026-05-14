import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, type = "text", ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[6px] border border-[#E5E7EB] bg-white px-[var(--Spacing-2,8px)] text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);
