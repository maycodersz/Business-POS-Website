import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { SaleEditForm } from "@/features/sales/sale-edit-form";
import type { SaleRow } from "@/features/sales/queries";
import { formatMoney } from "@/lib/formatters/money";

type SaleDetailViewProps = {
  sale: SaleRow;
};

export function SaleDetailView({ sale }: SaleDetailViewProps) {
  const item = sale.sale_items[0] ?? null;
  const expenses = sale.expenses ?? [];
  const expenseTotal = expenses.reduce(
    (total, expense) => total + expense.amount,
    0,
  );
  const netProfit = (item?.gross_profit ?? 0) - expenseTotal;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/sales"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Sales
        </Link>
        <div className="mt-4">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Sale detail
          </h1>
          <p className="mt-2 text-sm text-slate-500">{sale.sale_date}</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(item?.revenue ?? null)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">COGS</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(item?.cogs ?? null)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Gross profit</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(item?.gross_profit ?? null)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(expenseTotal)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Net profit</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(netProfit)}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Sold item</h2>
        </div>
        <div className="p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md bg-slate-50 p-3">
              <dt className="text-slate-500">Product</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {item?.products?.name ?? "Unknown product"}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <dt className="text-slate-500">Variant</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {item?.product_variants?.variant_name ?? "No variant"}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <dt className="text-slate-500">Batch</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {item?.purchase_batches?.id ?? "-"}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <dt className="text-slate-500">Unit COGS</dt>
              <dd className="mt-1 font-semibold text-slate-950">
                {formatMoney(item?.unit_cogs ?? null)}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">Sale info</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Platform</dt>
            <dd className="mt-1 font-medium text-slate-950">
              {sale.platform ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Customer</dt>
            <dd className="mt-1 font-medium text-slate-950">
              {sale.customer_name ?? "-"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Notes</dt>
            <dd className="mt-1 font-medium text-slate-950">
              {sale.notes ?? "-"}
            </dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <ActionDisclosure label="Edit sale">
          <SaleEditForm sale={sale} />
        </ActionDisclosure>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Related expenses
          </h2>
        </div>
        {expenses.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No expenses are linked to this sale.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {expense.category.charAt(0).toUpperCase() +
                      expense.category.slice(1)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {expense.expense_date}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-950">
                  {formatMoney(expense.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
