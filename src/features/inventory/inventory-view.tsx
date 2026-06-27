import Link from "next/link";
import { Boxes, History, ShoppingCart } from "lucide-react";

import { actionLinkClassName } from "@/components/ui/action-styles";
import { EmptyState } from "@/components/ui/empty-state";
import { InventoryAdjustmentForm } from "@/features/inventory/inventory-adjustment-form";
import type { InventoryMovementRow } from "@/features/inventory/queries";
import type { PurchaseBatchRow } from "@/features/purchases/queries";

type InventoryViewProps = {
  batches: PurchaseBatchRow[];
  movements: InventoryMovementRow[];
};

function formatMoney(value: number | null) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value ?? 0);
}

function movementLabel(type: string) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function InventoryView({ batches, movements }: InventoryViewProps) {
  const totalAvailable = batches.reduce(
    (sum, batch) => sum + batch.quantity_available,
    0,
  );
  const inventoryValue = batches.reduce(
    (sum, batch) =>
      sum + batch.quantity_available * (batch.landed_unit_cost ?? 0),
    0,
  );
  const activeBatches = batches.filter((batch) => batch.quantity_available > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          Inventory
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review current stock by purchase batch so supplier and cost
          differences stay visible.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available units</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {totalAvailable}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inventory value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(inventoryValue)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active batches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {activeBatches.length}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Batch inventory
          </h2>
        </div>
        {batches.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Boxes}
              title="No inventory yet"
              description="Add your first purchase to create inventory."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {batches.map((batch) => {
              const batchValue =
                batch.quantity_available * (batch.landed_unit_cost ?? 0);

              return (
                <article key={batch.id} className="p-5">
                  <div>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-950">
                            {batch.products?.name ?? "Unknown product"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {batch.product_variants?.variant_name ??
                              "No variant"}{" "}
                            by {batch.suppliers?.name ?? "Unknown supplier"}
                          </p>
                        </div>
                        <span
                          className={
                            batch.quantity_available > 0
                              ? "w-fit rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                              : "w-fit rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                          }
                        >
                          {batch.quantity_available > 0
                            ? "available"
                            : "sold out"}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {batch.quantity_available > 0 ? (
                          <Link
                            href={`/inventory?add=sale&batch=${batch.id}`}
                            className={actionLinkClassName}
                          >
                            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                            Add sales
                          </Link>
                        ) : null}
                        <InventoryAdjustmentForm
                          batchId={batch.id}
                          maxDecrease={batch.quantity_available}
                          maxIncrease={batch.quantity - batch.quantity_available}
                        />
                      </div>

                      <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-md bg-slate-50 p-3">
                          <dt className="text-slate-500">Available</dt>
                          <dd className="mt-1 font-semibold text-slate-950">
                            {batch.quantity_available} / {batch.quantity}
                          </dd>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <dt className="text-slate-500">Landed unit</dt>
                          <dd className="mt-1 font-semibold text-slate-950">
                            {formatMoney(batch.landed_unit_cost)}
                          </dd>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <dt className="text-slate-500">Batch value</dt>
                          <dd className="mt-1 font-semibold text-slate-950">
                            {formatMoney(batchValue)}
                          </dd>
                        </div>
                        <div className="rounded-md bg-slate-50 p-3">
                          <dt className="text-slate-500">Purchase date</dt>
                          <dd className="mt-1 font-semibold text-slate-950">
                            {batch.purchase_date}
                          </dd>
                        </div>
                      </dl>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
          <History className="h-5 w-5 text-slate-500" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">
            Inventory movement audit
          </h2>
        </div>
        {movements.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={History}
              title="No inventory movements yet"
              description="Purchases, sales, and manual adjustments will appear here."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {movements.map((movement) => (
              <article key={movement.id} className="p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {movement.products?.name ?? "Unknown product"}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {movement.product_variants?.variant_name ?? "No variant"} -{" "}
                      {movementLabel(movement.movement_type)}
                    </p>
                    {movement.notes ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {movement.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-left sm:text-right">
                    <p
                      className={
                        movement.quantity_change >= 0
                          ? "text-sm font-semibold text-emerald-700"
                          : "text-sm font-semibold text-red-700"
                      }
                    >
                      {movement.quantity_change > 0 ? "+" : ""}
                      {movement.quantity_change}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(movement.created_at).toLocaleString("en-PH")}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
