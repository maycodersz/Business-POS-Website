import { ExternalLink, Truck } from "lucide-react";

import { ActionDisclosure } from "@/components/ui/action-disclosure";
import { EmptyState } from "@/components/ui/empty-state";
import { SupplierDeleteForm } from "@/features/suppliers/supplier-delete-form";
import { SupplierForm } from "@/features/suppliers/supplier-form";
import type { Tables } from "@/types/database";

type Supplier = Pick<
  Tables<"suppliers">,
  "id" | "name" | "facebook_link" | "messenger_link" | "notes" | "created_at"
>;

export function SuppliersView({
  suppliers,
}: {
  suppliers: Supplier[];
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Suppliers
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Store supplier contact links and notes before purchase tracking.
          </p>
        </div>
      </div>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-950">
              Supplier list
            </h2>
          </div>
          {suppliers.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Truck}
                title="No suppliers yet"
                description="Add suppliers here so purchases can track seller pricing over time."
              />
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {suppliers.map((supplier) => (
                <article key={supplier.id} className="p-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">
                      {supplier.name}
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                      {supplier.facebook_link ? (
                        <a
                          href={supplier.facebook_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                        >
                          Facebook
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                      {supplier.messenger_link ? (
                        <a
                          href={supplier.messenger_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900"
                        >
                          Messenger
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {supplier.notes || "No notes yet."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <ActionDisclosure label={`Edit ${supplier.name}`}>
                        <div className="rounded-md bg-white p-4">
                          <SupplierForm supplier={supplier} />
                        </div>
                      </ActionDisclosure>
                      <SupplierDeleteForm
                        supplierId={supplier.id}
                        supplierName={supplier.name}
                      />
                    </div>
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
