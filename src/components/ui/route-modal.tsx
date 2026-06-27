"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type PointerEvent,
  type ReactNode,
} from "react";

import { buildModalCloseHref } from "@/components/ui/route-modal-utils";

type RouteModalProps = {
  children: ReactNode;
  title: string;
};

export function RouteModal({ children, title }: RouteModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const closeHref = buildModalCloseHref(pathname, searchParams.toString());

  const closeModal = useCallback(() => {
    router.replace(closeHref, { scroll: false });
  }, [closeHref, router]);

  function closeOnBackdrop(event: PointerEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [closeModal]);

  return (
    <div
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 sm:py-10"
      onPointerDown={closeOnBackdrop}
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950" id={titleId}>
            {title}
          </h2>
          <button
            aria-label="Close"
            className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98] active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            onClick={closeModal}
            ref={closeButtonRef}
            type="button"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
