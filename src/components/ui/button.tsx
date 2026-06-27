import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-700",
  secondary:
    "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950 active:bg-slate-200 active:text-slate-950",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, className, variant = "primary", ...props },
    ref,
  ) {
    return (
      <button
        className={cn(
          "inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-10",
          variants[variant],
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
