"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { addActions } from "@/components/layout/add-item-button";

const baseRoutes = [
  "/dashboard",
  "/inventory",
  "/products",
  "/purchases",
  "/sales",
  "/expenses",
  "/suppliers",
  "/reports",
];

const rangeKeys = ["7d", "30d", "90d", "all"];

function withAdd(pathname: string, searchParams: string, kind: string) {
  const params = new URLSearchParams(searchParams);
  params.set("add", kind);
  return `${pathname}?${params.toString()}`;
}

export function AppPrefetcher() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let idleId: number | undefined;

    function prefetchRoutes() {
      for (const route of baseRoutes) {
        router.prefetch(route);
      }

      for (const range of rangeKeys) {
        router.prefetch(`/dashboard?range=${range}`);
        router.prefetch(`/reports?range=${range}`);
      }

      const currentSearch = searchParams.toString();
      for (const action of addActions) {
        router.prefetch(withAdd(pathname, currentSearch, action.kind));
      }
    }

    const timeout = window.setTimeout(() => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(prefetchRoutes, {
          timeout: 2000,
        });
        return;
      }

      prefetchRoutes();
    }, 1200);

    return () => {
      window.clearTimeout(timeout);
      if (idleId !== undefined) {
        window.cancelIdleCallback(idleId);
      }
    };
  }, [pathname, router, searchParams]);

  return null;
}
