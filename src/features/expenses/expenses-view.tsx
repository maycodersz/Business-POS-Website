import Link from "next/link";
import { CreditCard, ExternalLink } from "lucide-react";

import { actionLinkClassName } from "@/components/ui/action-styles";
import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { ExpenseEditForm } from "@/features/expenses/expense-edit-form";
import type {
  ExpenseRow,
  ExpenseSaleOption,
} from "@/features/expenses/queries";
import { formatMoney } from "@/lib/formatters/money";

type ExpensesViewProps = {
  expenses: ExpenseRow[];
  sales: ExpenseSaleOption[];
};

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function saleSummary(sale: ExpenseSaleOption | null) {
  if (!sale) {
    return "No related sale";
  }

  const item = sale.sale_items[0] ?? null;
  const product = item?.products?.name ?? "Unknown product";
  const variant = item?.product_variants?.variant_name ?? "No variant";

  return `${sale.sale_date} - ${product} - ${variant}`;
}

function purchaseSummary(expense: ExpenseRow) {
  const purchase = expense.purchase_batches;

  if (!purchase) {
    return "No related sale or purchase";
  }

  const product = purchase.products?.name ?? "Unknown product";
  const variant = purchase.product_variants?.variant_name ?? "No variant";
  const supplier = purchase.suppliers?.name ?? "Unknown supplier";

  return `${purchase.purchase_date} - ${product} - ${variant} by ${supplier}`;
}

function relatedSummary(expense: ExpenseRow) {
  if (expense.related_sale_id) {
    return saleSummary(expense.sales);
  }

  if (expense.related_purchase_batch_id) {
    return purchaseSummary(expense);
  }

  return "No related sale or purchase";
}

export function ExpensesView({
  expenses,
  sales,
}: ExpensesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Expenses
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Track shipping, packaging, refund, labour, and other expenses. Link an
          expense to a sale when it should reduce that sale&apos;s net profit.
        </p>
      </div>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Expense history
            </h2>
          </div>
          {expenses.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={CreditCard}
                title="No expenses yet"
                description="Add shipping, packaging, refund, labour, or other expenses to track net profit."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {expenses.map((expense) => (
                <article key={expense.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">
                        {categoryLabel(expense.category)}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {relatedSummary(expense)}
                      </p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {expense.expense_date}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <dl className="grid flex-1 gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Amount</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(expense.amount)}
                        </dd>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Category</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {categoryLabel(expense.category)}
                        </dd>
                      </div>
                    </dl>

                    {expense.related_sale_id ? (
                      <Link
                        href={`/sales/${expense.related_sale_id}`}
                        className={actionLinkClassName}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        Sale
                      </Link>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionDisclosure label="Edit expense">
                      <ExpenseEditForm expense={expense} sales={sales} />
                    </ActionDisclosure>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
