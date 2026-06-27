"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import {
  adjustInventoryAction,
  type InventoryAdjustmentActionState,
} from "@/features/inventory/actions";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type InventoryAdjustmentFormProps = {
  batchId: string;
  maxIncrease: number;
  maxDecrease: number;
};

const initialState: InventoryAdjustmentActionState = {};

export function InventoryAdjustmentForm({
  batchId,
  maxDecrease,
  maxIncrease,
}: InventoryAdjustmentFormProps) {
  const [state, formAction] = useActionState(
    adjustInventoryAction,
    initialState,
  );
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

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
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Adjust stock
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
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Adjust stock
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Log a stock correction and add it to the movement audit.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                ref={closeButtonRef}
              >
                Close
              </Button>
            </div>

            <form action={formAction} className="mt-5 space-y-4">
              <input name="purchase_batch_id" type="hidden" value={batchId} />
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Stock adjustment
                </label>
                <Input
                  max={maxIncrease}
                  min={-maxDecrease}
                  name="quantity_delta"
                  placeholder="-1 or 1"
                  required
                  step={1}
                  type="number"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Use negative numbers for lost, damaged, or corrected-down
                  stock.
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Reason
                </label>
                <Textarea
                  className="min-h-20 sm:min-h-20"
                  name="notes"
                  placeholder="Damage, found stock, recount correction"
                />
              </div>

              <ActionFeedback ok={state.ok} message={state.message} />

              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <SubmitButton pendingLabel="Logging...">
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  Log adjustment
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
