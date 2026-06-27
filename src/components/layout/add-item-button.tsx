"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import type { AddKind } from "@/features/add-modal/types";

export type AddAction = {
  kind: AddKind;
  label: string;
};

export const addActions: AddAction[] = [
  { kind: "product", label: "Add product" },
  { kind: "purchase", label: "Add purchase" },
  { kind: "sale", label: "Add sales" },
  { kind: "expense", label: "Add expense" },
  { kind: "supplier", label: "Add supplier" },
];

const addRouteBySection: Array<[string, AddAction]> = [
  ["/products", addActions[0]],
  ["/purchases", addActions[1]],
  ["/sales", addActions[2]],
  ["/expenses", addActions[3]],
  ["/suppliers", addActions[4]],
  ["/inventory", addActions[1]],
];

export function currentAddAction(pathname: string) {
  return (
    addRouteBySection.find(([section]) => pathname.startsWith(section))?.[1] ??
    addActions[1]
  );
}

export function addHref(
  pathname: string,
  searchParams: { toString(): string },
  action: AddAction,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("add", action.kind);

  return `${pathname}?${params.toString()}`;
}

export function AddItemButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const action = currentAddAction(pathname);

  return (
    <Link
      className="hidden h-10 touch-manipulation items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 active:scale-[0.98] active:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 xl:inline-flex"
      href={addHref(pathname, searchParams, action)}
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </Link>
  );
}

export function FloatingAddItemButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentAction = currentAddAction(pathname);

  return (
    <div className="fixed bottom-20 right-4 z-40 xl:hidden">
      <details className="group">
        <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full bg-slate-950 text-white shadow-lg transition hover:bg-slate-800 active:scale-95 active:bg-slate-700 group-open:bg-slate-800">
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Open add actions</span>
        </summary>
        <div className="absolute bottom-14 right-0 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          {addActions.map((action) => (
            <Link
              key={action.kind}
              className="flex touch-manipulation items-center gap-3 border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-950 transition last:border-b-0 hover:bg-slate-50 active:bg-slate-100"
              href={addHref(pathname, searchParams, action)}
            >
              <Plus
                className={
                  action.kind === currentAction.kind
                    ? "h-4 w-4 text-slate-950"
                    : "h-4 w-4 text-slate-500"
                }
                aria-hidden="true"
              />
              {action.label}
            </Link>
          ))}
        </div>
      </details>
    </div>
  );
}
