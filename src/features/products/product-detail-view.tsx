import Link from "next/link";
import { ArrowLeft, Boxes } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import type { ProductDetail } from "@/features/products/queries";
import { summarizeProductInventory } from "@/features/products/summary";

type ProductDetailViewProps = {
  product: ProductDetail;
};

function formatMoney(value: number | null) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value ?? 0);
}

export function ProductDetailView({ product }: ProductDetailViewProps) {
  const summary = summarizeProductInventory(product.purchase_batches);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Products
        </Link>
        <div className="mt-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                {product.name}
              </h1>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
                {product.status}
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {product.description || "No product description yet."}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Available stock</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.totalAvailableQuantity}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inventory value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(summary.inventoryValue)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average landed cost</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {formatMoney(summary.averageLandedCost)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active batches</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {summary.activeBatchCount}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">Variants</h2>
        </div>
        {product.product_variants.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No variants yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 p-5">
            {product.product_variants.map((variant) => (
              <span
                key={variant.id}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700"
              >
                {variant.variant_name}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            Purchase batches
          </h2>
        </div>
        {product.purchase_batches.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Boxes}
              title="No purchase batches yet"
              description="Add a purchase for this product to start building inventory history."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {product.purchase_batches.map((batch) => {
              const batchValue =
                batch.quantity_available * (batch.landed_unit_cost ?? 0);

              return (
                <article key={batch.id} className="p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">
                        {batch.product_variants?.variant_name ?? "No variant"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {batch.suppliers?.name ?? "Unknown supplier"}
                      </p>
                      {batch.notes ? (
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {batch.notes}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={
                        batch.quantity_available > 0
                          ? "rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700"
                          : "rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                      }
                    >
                      {batch.quantity_available > 0 ? "available" : "sold out"}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Quantity</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {batch.quantity_available} / {batch.quantity}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Unit price</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(batch.unit_price)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Landed unit</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(batch.landed_unit_cost)}
                      </dd>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <dt className="text-slate-500">Current value</dt>
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
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
