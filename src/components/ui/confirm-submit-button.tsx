"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type ConfirmSubmitButtonProps = {
  children: ReactNode;
  message: string;
  variant?: "primary" | "secondary" | "ghost";
};

export function ConfirmSubmitButton({
  children,
  message,
  variant = "ghost",
}: ConfirmSubmitButtonProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

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
        type="button"
        variant={variant}
        onClick={(event) => {
          formRef.current = event.currentTarget.form;
          setOpen(true);
        }}
      >
        {children}
      </Button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
          role="presentation"
        >
          <div
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
            role="dialog"
          >
            <p className="text-sm font-semibold text-slate-950" id={titleId}>
              Confirm action
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
                ref={cancelButtonRef}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  const form = formRef.current;
                  setOpen(false);
                  form?.requestSubmit();
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
