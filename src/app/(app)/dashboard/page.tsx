import Link from "next/link";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { RangeSliderNav } from "@/components/ui/range-slider-nav";
import { MetricCard, PageHeader } from "@/components/ui/responsive-primitives";
import { StatCard } from "@/components/ui/stat-card";
import { AddModal } from "@/features/add-modal/add-modal";
import { DashboardActivityTabs } from "@/features/dashboard/dashboard-activity-tabs";
import { DashboardAlertPanel } from "@/features/dashboard/dashboard-alert-panel";
import { DashboardCharts } from "@/features/dashboard/dashboard-charts";
import { DashboardMobileOverview } from "@/features/dashboard/dashboard-mobile-overview";
import { getDashboardData } from "@/features/dashboard/queries";
import type { DashboardRangeKey } from "@/features/dashboard/summary";

type DashboardPageProps = {
  searchParams: Promise<{
    add?: string;
    range?: string;
  }>;
};

const ranges: Array<{ key: DashboardRangeKey; label: string }> = [
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-PH", {
    currency: "PHP",
    style: "currency",
  }).format(value);
}

function itemName(
  item:
    | {
        products: { name: string } | null;
        product_variants: { variant_name: string } | null;
      }
    | null
    | undefined,
) {
  if (!item) {
    return "Unknown product";
  }

  const variant = item.product_variants?.variant_name ?? "No variant";
  return `${item.products?.name ?? "Unknown product"} - ${variant}`;
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const { add, range: rangeParam } = await searchParams;
  const dashboard = await getDashboardData(rangeParam);
  const stats = [
    {
      label: "Total Revenue",
      value: formatMoney(dashboard.summary.totalRevenue),
      helper: dashboard.range.label,
      icon: CircleDollarSign,
    },
    {
      label: "Total COGS",
      value: formatMoney(dashboard.summary.totalCogs),
      helper: "Inventory cost from sold items.",
      icon: ClipboardList,
    },
    {
      label: "Gross Profit",
      value: formatMoney(dashboard.summary.grossProfit),
      helper: "Revenue minus COGS.",
      icon: TrendingUp,
    },
    {
      label: "Total Expenses",
      value: formatMoney(dashboard.summary.totalExpenses),
      helper: "Operating expenses in range.",
      icon: CreditCard,
    },
    {
      label: "Net Profit",
      value: formatMoney(dashboard.summary.netProfit),
      helper: "Gross profit minus expenses.",
      icon: ReceiptText,
    },
    {
      label: "Inventory Value",
      value: formatMoney(dashboard.summary.inventoryValue),
      helper: "Current unsold stock value.",
      icon: Boxes,
    },
    {
      label: "Inventory Cash Spent",
      value: formatMoney(dashboard.summary.inventoryCashSpent),
      helper: "Total purchase batch cost.",
      icon: ShoppingBag,
    },
    {
      label: "Unsold Quantity",
      value: String(dashboard.summary.unsoldStock),
      helper: "Units still available.",
      icon: PackageSearch,
    },
    {
      label: "Low Stock Count",
      value: String(dashboard.summary.lowStockCount),
      helper: "Batches with 1-2 units left.",
      icon: AlertTriangle,
    },
    {
      label: "Dead Stock Count",
      value: String(dashboard.summary.deadStockCount),
      helper: "Unsold batches older than 30 days.",
      icon: AlertTriangle,
    },
  ] as const;
  const secondaryMobileStats = [
    {
      label: "COGS",
      value: formatMoney(dashboard.summary.totalCogs),
      icon: ClipboardList,
    },
    {
      label: "Cash spent",
      value: formatMoney(dashboard.summary.inventoryCashSpent),
      icon: ShoppingBag,
    },
    {
      label: "Unsold",
      value: String(dashboard.summary.unsoldStock),
      icon: PackageSearch,
    },
    {
      label: "Low stock",
      value: String(dashboard.summary.lowStockCount),
      icon: AlertTriangle,
    },
    {
      label: "Dead stock",
      value: String(dashboard.summary.deadStockCount),
      icon: AlertTriangle,
    },
  ] as const;
  const mobileActivity = {
    purchases: dashboard.recentPurchases.map((purchase) => ({
      amount: formatMoney(purchase.total_purchase_cost ?? 0),
      id: purchase.id,
      meta: `${purchase.suppliers?.name ?? "Unknown supplier"} - ${
        purchase.purchase_date
      }`,
      title: itemName(purchase),
    })),
    sales: dashboard.recentSales.map((sale) => {
      const item = sale.sale_items[0] ?? null;

      return {
        amount: formatMoney(item?.revenue ?? 0),
        href: `/sales/${sale.id}`,
        id: sale.id,
        meta: `${sale.customer_name ?? sale.platform ?? "Sale"} - ${
          sale.sale_date
        }`,
        title: itemName(item),
      };
    }),
    expenses: dashboard.recentExpenses.map((expense) => ({
      amount: formatMoney(expense.amount),
      id: expense.id,
      meta: expense.expense_date,
      title: categoryLabel(expense.category),
    })),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        actions={
          <RangeSliderNav
            activeKey={dashboard.range.key}
            items={ranges}
            pathname="/dashboard"
          />
        }
        description={dashboard.range.label}
        title="Dashboard"
      />

      <DashboardMobileOverview
        formatMoney={formatMoney}
        rangeLabel={dashboard.range.label}
        summary={dashboard.summary}
      />

      <section className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:hidden">
        {secondaryMobileStats.map((stat) => (
          <div className="min-w-[9.5rem] snap-start" key={stat.label}>
            <MetricCard
              accent="slate"
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
            />
          </div>
        ))}
      </section>

      <section className="hidden gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <DashboardCharts
        dailySeries={dashboard.dailySeries}
        expenseCategories={dashboard.expenseCategories}
      />

      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardAlertPanel
          deadStock={dashboard.inventoryAlerts.deadStock}
          itemName={itemName}
          lowStock={dashboard.inventoryAlerts.lowStock}
        />

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Expense breakdown
            </h2>
          </div>
          <div className="mt-5 divide-y divide-slate-200">
            {dashboard.expenseCategories.map((expense) => (
              <div
                key={expense.category}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium text-slate-700">
                  {categoryLabel(expense.category)}
                </span>
                <span className="font-semibold text-slate-950">
                  {formatMoney(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <DashboardActivityTabs
        expenses={mobileActivity.expenses}
        purchases={mobileActivity.purchases}
        sales={mobileActivity.sales}
      />

      <section className="hidden gap-4 lg:grid xl:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Recent purchases
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentPurchases.length === 0 ? (
              <p className="text-sm text-slate-500">No purchases in range.</p>
            ) : (
              dashboard.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    {itemName(purchase)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {purchase.suppliers?.name ?? "Unknown supplier"} -{" "}
                    {purchase.purchase_date}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatMoney(purchase.total_purchase_cost ?? 0)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Recent sales
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentSales.length === 0 ? (
              <p className="text-sm text-slate-500">No sales in range.</p>
            ) : (
              dashboard.recentSales.map((sale) => {
                const item = sale.sale_items[0] ?? null;
                return (
                  <Link
                    key={sale.id}
                    href={`/sales/${sale.id}`}
                    className="block touch-manipulation rounded-md bg-slate-50 p-3 transition hover:bg-slate-100 active:bg-slate-200"
                  >
                    <p className="text-sm font-medium text-slate-950">
                      {itemName(item)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {sale.customer_name ?? sale.platform ?? "Sale"} -{" "}
                      {sale.sale_date}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {formatMoney(item?.revenue ?? 0)}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">
              Recent expenses
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard.recentExpenses.length === 0 ? (
              <p className="text-sm text-slate-500">No expenses in range.</p>
            ) : (
              dashboard.recentExpenses.map((expense) => (
                <div key={expense.id} className="rounded-md bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-950">
                    {categoryLabel(expense.category)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {expense.expense_date}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {formatMoney(expense.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <AddModal add={add} defaultKind="purchase" />
    </div>
  );
}
