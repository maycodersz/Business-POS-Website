import {
  Boxes,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
} from "lucide-react";

import { MetricCard } from "@/components/ui/responsive-primitives";
import type { DashboardSummary } from "@/features/dashboard/summary";

type DashboardMobileOverviewProps = {
  formatMoney: (value: number) => string;
  rangeLabel: string;
  summary: DashboardSummary;
};

export function DashboardMobileOverview({
  formatMoney,
  rangeLabel,
  summary,
}: DashboardMobileOverviewProps) {
  return (
    <section className="space-y-3 lg:hidden">
      <div className="rounded-lg bg-slate-950 p-4 text-white shadow-sm">
        <p className="text-xs font-medium uppercase text-slate-300">
          Business health
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-slate-300">Net profit</p>
            <p className="mt-1 break-words text-2xl font-semibold leading-tight">
              {formatMoney(summary.netProfit)}
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 text-xs font-medium text-slate-200">
            {rangeLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          accent="blue"
          icon={CircleDollarSign}
          label="Revenue"
          value={formatMoney(summary.totalRevenue)}
        />
        <MetricCard
          accent="red"
          icon={CreditCard}
          label="Expenses"
          value={formatMoney(summary.totalExpenses)}
        />
        <MetricCard
          accent="emerald"
          icon={ReceiptText}
          label="Gross profit"
          value={formatMoney(summary.grossProfit)}
        />
        <MetricCard
          accent="slate"
          icon={Boxes}
          label="Inventory"
          value={formatMoney(summary.inventoryValue)}
        />
      </div>
    </section>
  );
}

