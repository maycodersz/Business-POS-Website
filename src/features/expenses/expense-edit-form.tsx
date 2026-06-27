"use client";

import { useActionState } from "react";
import { Save, Trash2 } from "lucide-react";

import {
  deleteExpenseAction,
  updateExpenseAction,
  type ExpenseActionState,
} from "@/features/expenses/actions";
import type {
  ExpenseRow,
  ExpenseSaleOption,
} from "@/features/expenses/queries";
import { expenseCategories } from "@/features/expenses/validation";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

type ExpenseEditFormProps = {
  expense: ExpenseRow;
  sales: ExpenseSaleOption[];
};

const initialState: ExpenseActionState = {};

const fieldClass =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:h-10 sm:text-sm";

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function saleLabel(sale: ExpenseSaleOption) {
  const item = sale.sale_items[0] ?? null;
  const product = item?.products?.name ?? "Unknown product";
  const variant = item?.product_variants?.variant_name ?? "No variant";
  const customer = sale.customer_name ? ` - ${sale.customer_name}` : "";

  return `${sale.sale_date} - ${product} - ${variant}${customer}`;
}

export function ExpenseEditForm({ expense, sales }: ExpenseEditFormProps) {
  const [updateState, updateFormAction] = useActionState(
    updateExpenseAction,
    initialState,
  );
  const [deleteState, deleteFormAction] = useActionState(
    deleteExpenseAction,
    initialState,
  );

  return (
    <div className="space-y-5">
      <form action={updateFormAction} className="space-y-5">
        <input name="id" type="hidden" value={expense.id} />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Expense date
          </label>
          <Input
            defaultValue={expense.expense_date}
            name="expense_date"
            required
            type="date"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            name="category"
            required
            className={fieldClass}
            defaultValue={expense.category}
          >
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Amount
          </label>
          <Input
            defaultValue={Math.round(expense.amount)}
            min={1}
            name="amount"
            required
            step={1}
            type="number"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Related sale
          </label>
          <select
            name="related_sale_id"
            className={fieldClass}
            defaultValue={expense.related_sale_id ?? ""}
          >
            <option value="">No related sale</option>
            {sales.map((sale) => (
              <option key={sale.id} value={sale.id}>
                {saleLabel(sale)}
              </option>
            ))}
          </select>
        </div>

        <ActionFeedback ok={updateState.ok} message={updateState.message} />
        <SubmitButton>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save expense
        </SubmitButton>
      </form>

      <form action={deleteFormAction} className="border-t border-slate-200 pt-4">
        <input name="id" type="hidden" value={expense.id} />
        <ActionFeedback ok={deleteState.ok} message={deleteState.message} />
        <div className="mt-3">
          <ConfirmSubmitButton
            message="Delete this expense? This cannot be undone."
            variant="secondary"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete expense
          </ConfirmSubmitButton>
        </div>
      </form>
    </div>
  );
}
