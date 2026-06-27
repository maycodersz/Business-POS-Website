"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 flex flex-1 flex-col gap-1">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
