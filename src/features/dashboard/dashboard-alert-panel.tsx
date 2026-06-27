import { AlertTriangle, PackageSearch } from "lucide-react";

import { MobileRecordCard, SectionCard } from "@/components/ui/responsive-primitives";
import type { DashboardInventoryAlert } from "@/features/dashboard/queries";

type DashboardAlertPanelProps = {
  deadStock: DashboardInventoryAlert[];
  itemName: (item: DashboardInventoryAlert | null | undefined) => string;
  lowStock: DashboardInventoryAlert[];
};

export function DashboardAlertPanel({
  deadStock,
  itemName,
  lowStock,
}: DashboardAlertPanelProps) {
  return (
    <SectionCard
      title={
        <>
          <PackageSearch className="h-5 w-5 text-amber-700" aria-hidden="true" />
          Inventory alerts
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-950">Low stock</h3>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
              {lowStock.length}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-slate-500">No low-stock batches.</p>
            ) : (
              lowStock.map((batch) => (
                <MobileRecordCard key={batch.id}>
                  <p className="text-sm font-medium text-slate-950">
                    {itemName(batch)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {batch.quantity_available} available
                  </p>
                </MobileRecordCard>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <AlertTriangle className="h-4 w-4 text-amber-700" aria-hidden="true" />
              Dead stock
            </h3>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
              {deadStock.length}
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {deadStock.length === 0 ? (
              <p className="text-sm text-slate-500">No dead-stock batches.</p>
            ) : (
              deadStock.map((batch) => (
                <MobileRecordCard key={batch.id}>
                  <p className="text-sm font-medium text-slate-950">
                    {itemName(batch)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Since {batch.purchase_date}
                  </p>
                </MobileRecordCard>
              ))
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

