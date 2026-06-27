import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export function PageHeader({
  actions,
  children,
  description,
  title,
}: {
  actions?: ReactNode;
  children?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function SectionCard({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5",
        className,
      )}
    >
      {title ? (
        <div className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-950">
          {title}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricCard({
  accent = "emerald",
  helper,
  icon: Icon,
  label,
  value,
}: {
  accent?: "emerald" | "blue" | "red" | "amber" | "slate";
  helper?: string;
  icon?: LucideIcon;
  label: string;
  value: string;
}) {
  const accentClasses = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition motion-safe:animate-[fade-in_220ms_ease-out] sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase text-slate-500 sm:text-sm sm:normal-case">
            {label}
          </p>
          <p className="mt-2 break-words text-xl font-semibold leading-tight text-slate-950 sm:text-2xl">
            {value}
          </p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
              accentClasses[accent],
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {helper ? (
        <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500 sm:text-sm">
          {helper}
        </p>
      ) : null}
    </section>
  );
}

export function MobileRecordCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md bg-slate-50 p-3 transition active:bg-slate-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
