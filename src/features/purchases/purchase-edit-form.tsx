"use client";

import { useActionState } from "react";
import { Save, Trash2 } from "lucide-react";

import {
  deletePurchaseAction,
  updatePurchaseAction,
  type PurchaseActionState,
} from "@/features/purchases/actions";
import type { PurchaseBatchRow } from "@/features/purchases/queries";
import { LinkedPurchaseExpensesInput } from "@/features/purchases/linked-purchase-expenses-input";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type PurchaseEditFormProps = {
  purchase: PurchaseBatchRow;
};

const initialState: PurchaseActionState = {};

export function PurchaseEditForm({ purchase }: PurchaseEditFormProps) {
  const [updateState, updateFormAction] = useActionState(
    updatePurchaseAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deletePurchaseAction,
    initialState,
  );
  const isLocked = purchase.quantity_available !== purchase.quantity;

  if (isLocked) {
    return (
      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
        This purchase has sales attached, so it is locked from editing or
        deletion.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <form action={updateFormAction} className="space-y-5">
        <input name="id" type="hidden" value={purchase.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <Input
              defaultValue={purchase.quantity}
              min={1}
              name="quantity"
              required
              step={1}
              type="number"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Unit price
            </label>
            <Input
              defaultValue={Math.round(purchase.unit_price)}
              min={0}
              name="unit_price"
              required
              step={1}
              type="number"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Purchase date
          </label>
          <Input
            defaultValue={purchase.purchase_date}
            name="purchase_date"
            required
            type="date"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <Textarea
            defaultValue={purchase.notes ?? ""}
            name="notes"
            placeholder="Optional purchase notes"
          />
        </div>

        <LinkedPurchaseExpensesInput
          initialExpenses={purchase.expenses.map((expense) => ({
            amount: String(Math.round(expense.amount)),
            category: expense.category,
            key: expense.id,
          }))}
        />

        <ActionFeedback ok={updateState.ok} message={updateState.message} />
        <SubmitButton>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save purchase
        </SubmitButton>
      </form>

      <form action={deleteFormAction} className="border-t border-slate-200 pt-4">
        <input name="id" type="hidden" value={purchase.id} />
        <ActionFeedback ok={deleteState.ok} message={deleteState.message} />
        <div className="mt-3">
          <ConfirmSubmitButton
            message="Delete this purchase batch? This cannot be undone."
            variant="secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete purchase
          </ConfirmSubmitButton>
        </div>
      </form>
    </div>
  );
}
