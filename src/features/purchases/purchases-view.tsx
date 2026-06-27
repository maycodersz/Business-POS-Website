import { ShoppingBag } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { PurchaseEditForm } from "@/features/purchases/purchase-edit-form";
import type { PurchaseBatchRow } from "@/features/purchases/queries";

type PurchasesViewProps = {
  purchases: PurchaseBatchRow[];
};

function formatMoney(value: number | null) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value ?? 0);
}

export function PurchasesView({ purchases }: PurchasesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Purchases
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Log product purchases as separate inventory batches with landed unit
          cost.
        </p>
      </div>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Purchase batches
            </h2>
          </div>
          {purchases.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={ShoppingBag}
                title="No purchases yet"
                description="Add a purchase to create the first inventory batch."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {purchases.map((purchase) => (
                <article key={purchase.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">
                        {purchase.products?.name ?? "Unknown product"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {purchase.product_variants?.variant_name ??
                          "No variant"}{" "}
                        by {purchase.suppliers?.name ?? "Unknown supplier"}
                      </p>
                      {purchase.notes ? (
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {purchase.notes}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm text-slate-500">
                      {purchase.purchase_date}
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Quantity</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {purchase.quantity_available} / {purchase.quantity}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Unit price</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(purchase.unit_price)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Total cost</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(purchase.total_purchase_cost)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Landed unit</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(purchase.landed_unit_cost)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionDisclosure label="Edit purchase">
                      <PurchaseEditForm purchase={purchase} />
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
