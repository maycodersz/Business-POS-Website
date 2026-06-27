import { cn } from "@/lib/utils/cn";

export const actionLinkClassName = cn(
  "inline-flex h-11 touch-manipulation items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition",
  "hover:bg-slate-50 active:scale-[0.98] active:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:h-10",
);

