"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type ActionDisclosureProps = {
  children: ReactNode;
  label: string;
};

export function ActionDisclosure({ children, label }: ActionDisclosureProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <Button
        aria-expanded={open}
        type="button"
        variant="secondary"
        onClick={() => setOpen((current) => !current)}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
      {open ? (
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 sm:py-10"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
          role="dialog"
        >
          <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <h2
                className="text-base font-semibold text-slate-950"
                id={titleId}
              >
                {label}
              </h2>
              <button
                aria-label="Close"
                className="inline-flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 active:scale-[0.98] active:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
                type="button"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
