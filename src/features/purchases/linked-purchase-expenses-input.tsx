"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { expenseCategories } from "@/features/expenses/validation";
import { Input } from "@/components/ui/input";

export type LinkedPurchaseExpenseInput = {
  amount: string;
  category: string;
  key: string;
};

type LinkedPurchaseExpensesInputProps = {
  initialExpenses?: LinkedPurchaseExpenseInput[];
};

const fieldClass =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-100 sm:h-10 sm:text-sm";

function expenseRowKey() {
  return `expense-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyExpenseRow(): LinkedPurchaseExpenseInput {
  return {
    amount: "",
    category: "",
    key: expenseRowKey(),
  };
}

export function LinkedPurchaseExpensesInput({
  initialExpenses,
}: LinkedPurchaseExpensesInputProps) {
  const [expenseRows, setExpenseRows] = useState(() =>
    initialExpenses && initialExpenses.length > 0
      ? initialExpenses
      : [],
  );

  return (
    <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-950">
          Linked expenses
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Save extra costs for this purchase as expense records.
        </p>
      </div>

      {expenseRows.length === 0 ? (
        <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-500">
          No linked expenses added.
        </p>
      ) : (
        <div className="space-y-3">
          {expenseRows.map((row, index) => (
            <div
              className="grid gap-3 rounded-md bg-white p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
              key={row.key}
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Expense category
                </label>
                <select
                  className={fieldClass}
                  name="purchase_expense_category"
                  value={row.category}
                  onChange={(event) => {
                    const nextRows = [...expenseRows];
                    nextRows[index] = {
                      ...nextRows[index],
                      category: event.target.value,
                    };
                    setExpenseRows(nextRows);
                  }}
                >
                  <option value="">Select category</option>
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Amount
                </label>
                <Input
                  min={1}
                  name="purchase_expense_amount"
                  placeholder="0"
                  step={1}
                  type="number"
                  value={row.amount}
                  onChange={(event) => {
                    const nextRows = [...expenseRows];
                    nextRows[index] = {
                      ...nextRows[index],
                      amount: event.target.value,
                    };
                    setExpenseRows(nextRows);
                  }}
                />
              </div>

              <div className="flex items-end">
                <button
                  aria-label="Remove linked expense"
                  className="inline-flex h-11 w-full touch-manipulation items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 active:bg-slate-200 sm:h-10 sm:w-10 sm:px-0"
                  type="button"
                  onClick={() =>
                    setExpenseRows((rows) =>
                      rows.filter((expenseRow) => expenseRow.key !== row.key),
                    )
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  <span className="sm:sr-only">Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        className="inline-flex h-10 touch-manipulation items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 active:bg-slate-200"
        type="button"
        onClick={() => setExpenseRows((rows) => [...rows, emptyExpenseRow()])}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add expense
      </button>
    </div>
  );
}
