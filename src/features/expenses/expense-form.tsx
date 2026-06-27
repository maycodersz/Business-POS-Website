"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import {
  createExpenseAction,
  type ExpenseActionState,
} from "@/features/expenses/actions";
import type { ExpenseSaleOption } from "@/features/expenses/queries";
import { expenseCategories } from "@/features/expenses/validation";
import { ActionFeedback } from "@/components/ui/action-feedback";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

type ExpenseFormProps = {
  sales: ExpenseSaleOption[];
};

const initialState: ExpenseActionState = {};

const fieldClass =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:h-10 sm:text-sm";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function saleLabel(sale: ExpenseSaleOption) {
  const item = sale.sale_items[0] ?? null;
  const product = item?.products?.name ?? "Unknown product";
  const variant = item?.product_variants?.variant_name ?? "No variant";
  const customer = sale.customer_name ? ` - ${sale.customer_name}` : "";

  return `${sale.sale_date} - ${product} - ${variant}${customer}`;
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function ExpenseForm({ sales }: ExpenseFormProps) {
  const [state, formAction] = useActionState(createExpenseAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Expense date
        </label>
        <Input
          defaultValue={todayInputValue()}
          name="expense_date"
          required
          type="date"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Category
        </label>
        <select name="category" required className={fieldClass}>
          <option value="">Select category</option>
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
        <Input min={0} name="amount" placeholder="0" required step="0.01" type="number" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Related sale
        </label>
        <select name="related_sale_id" className={fieldClass}>
          <option value="">No related sale</option>
          {sales.map((sale) => (
            <option key={sale.id} value={sale.id}>
              {saleLabel(sale)}
            </option>
          ))}
        </select>
      </div>

      <ActionFeedback ok={state.ok} message={state.message} />

      <SubmitButton>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add expense
      </SubmitButton>
    </form>
  );
}
