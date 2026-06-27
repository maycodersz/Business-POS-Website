import Link from "next/link";
import { ClipboardList, Eye } from "lucide-react";

import { actionLinkClassName } from "@/components/ui/action-styles";
import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { SaleEditForm } from "@/features/sales/sale-edit-form";
import type { SaleRow } from "@/features/sales/queries";

type SalesViewProps = {
  sales: SaleRow[];
};

function formatMoney(value: number | null) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value ?? 0);
}

function firstItem(sale: SaleRow) {
  return sale.sale_items[0] ?? null;
}

export function SalesView({
  sales,
}: SalesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Sales
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Log sales from available inventory batches. Each sale copies landed
          COGS and decreases stock in one database transaction.
        </p>
      </div>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Sales history
            </h2>
          </div>
          {sales.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ClipboardList}
                title="No sales logged yet"
                description="When you sell a product, add a sale here to update inventory and profit."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {sales.map((sale) => {
                const item = firstItem(sale);

                return (
                  <article key={sale.id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">
                          {item?.products?.name ?? "Unknown product"}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item?.product_variants?.variant_name ??
                            "No variant"}{" "}
                          {sale.platform ? `via ${sale.platform}` : ""}
                        </p>
                        {sale.customer_name ? (
                          <p className="mt-2 text-sm text-slate-500">
                            Customer: {sale.customer_name}
                          </p>
                        ) : null}
                      </div>
                      <div className="text-sm text-slate-500">
                        {sale.sale_date}
                      </div>
                    </div>

                    <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Qty</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {item?.quantity_sold ?? 0}
                        </dd>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Revenue</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(item?.revenue ?? null)}
                        </dd>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">COGS</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(item?.cogs ?? null)}
                        </dd>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Gross profit</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(item?.gross_profit ?? null)}
                        </dd>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <dt className="text-slate-500">Supplier</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {item?.purchase_batches?.suppliers?.name ?? "-"}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/sales/${sale.id}`}
                        className={actionLinkClassName}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                        View
                      </Link>
                      <ActionDisclosure label="Edit sale">
                        <SaleEditForm sale={sale} />
                      </ActionDisclosure>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
