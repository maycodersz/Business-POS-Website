"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  addActions,
  addHref,
  currentAddAction,
} from "@/components/layout/add-item-button";
import {
  mobileAddNavigationItem,
  mobileMoreNavigationItem,
  mobileMoreNavigationItems,
  mobileNavigationItems,
} from "@/constants/navigation";
import { cn } from "@/lib/utils/cn";

function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menu, setMenu] = useState<"add" | "more" | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const currentAction = currentAddAction(pathname);
  const primaryItems = [
    mobileNavigationItems[0],
    mobileNavigationItems[1],
    mobileAddNavigationItem,
    mobileNavigationItems[2],
    mobileMoreNavigationItem,
  ] as const;

  useBodyLock(menu !== null);

  useEffect(() => {
    if (menu) {
      closeButtonRef.current?.focus();
    }
  }, [menu]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenu(null);
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur md:hidden">
        {primaryItems.map((item) => {
          const isAction = item.href === "#add" || item.href === "#more";
          const itemPath = item.href.split("?")[0];
          const isActive = !isAction && pathname === itemPath;
          const Icon = item.icon;

          if (item.href === "#add") {
            return (
              <button
                aria-expanded={menu === "add"}
                className="flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium text-slate-950 transition active:bg-slate-100"
                key={item.href}
                onClick={() => setMenu((current) => current === "add" ? null : "add")}
                type="button"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition active:scale-95 active:bg-slate-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>{item.label}</span>
              </button>
            );
          }

          if (item.href === "#more") {
            return (
              <button
                aria-expanded={menu === "more"}
                className={cn(
                  "flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium transition active:bg-slate-100",
                  menu === "more" ? "text-slate-950" : "text-slate-500",
                )}
                key={item.href}
                onClick={() => setMenu((current) => current === "more" ? null : "more")}
                type="button"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-16 touch-manipulation flex-col items-center justify-center gap-1 text-xs font-medium transition active:bg-slate-100",
                isActive ? "text-slate-950" : "text-slate-500",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {menu ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/35 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-20 md:hidden"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              setMenu(null);
            }
          }}
          role="presentation"
        >
          <div className="mx-auto max-w-sm rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {menu === "add" ? "Add item" : "More pages"}
                </p>
                {menu === "add" ? (
                  <p className="text-xs text-slate-500">
                    Current page default: {currentAction.label}
                  </p>
                ) : null}
              </div>
              <button
                aria-label="Close menu"
                className="flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 active:bg-slate-200"
                onClick={() => setMenu(null)}
                ref={closeButtonRef}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-2">
              {menu === "add"
                ? addActions.map((action) => (
                    <Link
                      className="flex touch-manipulation items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-50 active:bg-slate-100"
                      href={addHref(pathname, searchParams, action)}
                      key={action.kind}
                      onClick={() => setMenu(null)}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <Plus className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {action.label}
                    </Link>
                  ))
                : mobileMoreNavigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        className="flex touch-manipulation items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-50 active:bg-slate-100"
                        href={item.href}
                        key={item.href}
                        onClick={() => setMenu(null)}
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
