"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  activeRangeIndex,
  buildRangeHref,
  type RangeSliderItem,
} from "@/components/ui/range-slider-utils";
import { cn } from "@/lib/utils/cn";

type RangeSliderNavProps = {
  activeKey: string;
  items: RangeSliderItem[];
  pathname: string;
};

export function RangeSliderNav({
  activeKey,
  items,
  pathname,
}: RangeSliderNavProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const visibleKey = isPending && pendingKey ? pendingKey : activeKey;
  const activeIndex = activeRangeIndex(items, visibleKey);

  useEffect(() => {
    for (const item of items) {
      router.prefetch(buildRangeHref(pathname, item.key));
    }
  }, [items, pathname, router]);

  return (
    <div
      aria-label="Date range"
      className="relative grid w-full overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-sm sm:w-auto"
      role="tablist"
      style={{
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
      }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1 top-1 rounded bg-white shadow-sm ring-1 ring-slate-200 transition-transform duration-300 ease-out",
          isPending ? "bg-slate-50" : "bg-white",
        )}
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
          width: `${100 / items.length}%`,
        }}
      />
      {items.map((item) => {
        const active = visibleKey === item.key;
        return (
          <button
            aria-selected={active}
            className={cn(
              "relative z-10 h-10 touch-manipulation rounded px-3 text-center text-sm font-medium transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
              active
                ? "text-slate-950"
                : "text-slate-500 hover:text-slate-950 active:bg-slate-100",
            )}
            key={item.key}
            onClick={() => {
              setPendingKey(item.key);
              startTransition(() => {
                router.push(buildRangeHref(pathname, item.key), {
                  scroll: false,
                });
              });
            }}
            onMouseEnter={() => router.prefetch(buildRangeHref(pathname, item.key))}
            onTouchStart={() => router.prefetch(buildRangeHref(pathname, item.key))}
            role="tab"
            type="button"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
