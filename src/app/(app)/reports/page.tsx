import Link from "next/link";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  CreditCard,
  Download,
  PackageSearch,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { RangeSliderNav } from "@/components/ui/range-slider-nav";
import { actionLinkClassName } from "@/components/ui/action-styles";
import { StatCard } from "@/components/ui/stat-card";
import { AddModal } from "@/features/add-modal/add-modal";
import type { ReportExportType } from "@/features/reports/csv";
import { getReportsData } from "@/features/reports/queries";
import type { DashboardRangeKey } from "@/features/dashboard/summary";
import { formatMoney } from "@/lib/formatters/money";

type ReportsPageProps = {
  searchParams: Promise<{
    add?: string;
    range?: string;
  }>;
};

const ranges: Array<{ key: DashboardRangeKey; label: string }> = [
  { key: "1d", label: "1D" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "90d", label: "90D" },
  { key: "all", label: "All" },
];

function productLabel(value: {
  products?: { name: string } | null;
  product_variants?: { variant_name: string } | null;
}) {
  return `${value.products?.name ?? "Unknown product"} - ${
    value.product_variants?.variant_name ?? "No variant"
  }`;
}

function categoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function purchaseExpenseLabel(expense: {
  purchase_batches?: {
    purchase_date: string;
    products?: { name: string } | null;
    product_variants?: { variant_name: string } | null;
    suppliers?: { name: string } | null;
  } | null;
}) {
  const purchase = expense.purchase_batches;

  if (!purchase) {
    return "Related purchase";
  }

  return `${purchase.purchase_date} - ${
    purchase.products?.name ?? "Unknown product"
  } - ${purchase.product_variants?.variant_name ?? "No variant"} by ${
    purchase.suppliers?.name ?? "Unknown supplier"
  }`;
}

function ReportPanel({
  children,
  exportType,
  icon: Icon,
  rangeKey,
  title,
}: {
  children: React.ReactNode;
  exportType: ReportExportType;
  icon: typeof BarChart3;
  rangeKey: DashboardRangeKey;
  title: string;
}) {
  const csvExportHref = `/reports/export?type=${exportType}&range=${rangeKey}`;
  const pdfExportHref = `/reports/export?type=${exportType}&range=${rangeKey}&format=pdf`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-slate-500" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            className={actionLinkClassName}
            href={csvExportHref}
            prefetch={false}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </Link>
          <Link
            className={actionLinkClassName}
            href={pdfExportHref}
            prefetch={false}
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export PDF
          </Link>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyReport({ label }: { label: string }) {
  return <p className="text-sm text-slate-500">No {label} in this range.</p>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const { add, range: rangeParam } = await searchParams;
  const reports = await getReportsData(rangeParam);
  const summaryStats = [
    {
      label: "Total Revenue",
      value: formatMoney(reports.profitAndLoss.totalRevenue),
      helper: reports.range.label,
      icon: TrendingUp,
    },
    {
      label: "Total Expenses",
      value: formatMoney(reports.profitAndLoss.totalExpenses),
      helper: "Operating expenses.",
      icon: CreditCard,
    },
    {
      label: "Net Profit",
      value: formatMoney(reports.profitAndLoss.netProfit),
      helper: "Gross profit minus expenses.",
      icon: ReceiptText,
    },
    {
      label: "Inventory Value",
      value: formatMoney(reports.profitAndLoss.inventoryValue),
      helper: "Current unsold stock value.",
      icon: Boxes,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Reports
          </h1>
          <p className="mt-2 text-sm text-slate-500">{reports.range.label}</p>
        </div>

        <RangeSliderNav
          activeKey={reports.range.key}
          items={ranges}
          pathname="/reports"
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <ReportPanel
        exportType="profit-loss"
        icon={ReceiptText}
        rangeKey={reports.range.key}
        title="Profit and loss"
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-md bg-slate-50 p-3">
            <dt className="text-slate-500">Revenue</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(reports.profitAndLoss.totalRevenue)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <dt className="text-slate-500">COGS</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(reports.profitAndLoss.totalCogs)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <dt className="text-slate-500">Gross profit</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(reports.profitAndLoss.grossProfit)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <dt className="text-slate-500">Expenses</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(reports.profitAndLoss.totalExpenses)}
            </dd>
          </div>
          <div className="rounded-md bg-slate-50 p-3">
            <dt className="text-slate-500">Net profit</dt>
            <dd className="mt-1 font-semibold text-slate-950">
              {formatMoney(reports.profitAndLoss.netProfit)}
            </dd>
          </div>
        </dl>
      </ReportPanel>

      <ReportPanel
        exportType="sales"
        icon={ClipboardList}
        rangeKey={reports.range.key}
        title="Sales report"
      >
        {reports.sales.length === 0 ? (
          <EmptyReport label="sales" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.sales.flatMap((sale) =>
                sale.sale_items.map((item) => (
                  <div key={item.id} className="rounded-md bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {productLabel(item)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {sale.sale_date}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-950">
                        {formatMoney(item.gross_profit)}
                      </span>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <dt className="text-slate-500">Qty</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {item.quantity_sold}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">Revenue</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(item.revenue)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">COGS</dt>
                        <dd className="mt-1 font-semibold text-slate-950">
                          {formatMoney(item.cogs)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                )),
              )}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Date</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Item</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Qty</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Revenue</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">COGS</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Gross profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.sales.flatMap((sale) =>
                  sale.sale_items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                        {sale.sale_date}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-950">
                        {productLabel(item)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {item.quantity_sold}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {formatMoney(item.revenue)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                        {formatMoney(item.cogs)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                        {formatMoney(item.gross_profit)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <ReportPanel
        exportType="inventory"
        icon={Boxes}
        rangeKey={reports.range.key}
        title="Inventory valuation"
      >
        {reports.inventory.length === 0 ? (
          <EmptyReport label="inventory batches" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.inventory.map((batch) => (
                <div key={batch.id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {productLabel(batch)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {batch.purchase_date}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(
                        batch.quantity_available * (batch.landed_unit_cost ?? 0),
                      )}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-slate-500">Available</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {batch.quantity_available} / {batch.quantity}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Landed unit</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(batch.landed_unit_cost)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Item</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Available</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Landed unit</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Value</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Purchase date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.inventory.map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">
                      {productLabel(batch)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {batch.quantity_available} / {batch.quantity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {formatMoney(batch.landed_unit_cost)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                      {formatMoney(
                        batch.quantity_available * (batch.landed_unit_cost ?? 0),
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {batch.purchase_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <ReportPanel
        exportType="expenses"
        icon={CreditCard}
        rangeKey={reports.range.key}
        title="Expense report"
      >
        {reports.expenses.length === 0 ? (
          <EmptyReport label="expenses" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.expenses.map((expense) => (
                <div key={expense.id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {categoryLabel(expense.category)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {expense.expense_date}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(expense.amount)}
                    </span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    {expense.related_sale_id ? (
                      <Link
                        href={`/sales/${expense.related_sale_id}`}
                        className="font-medium text-slate-950 hover:underline"
                      >
                        View related sale
                      </Link>
                    ) : expense.related_purchase_batch_id ? (
                      purchaseExpenseLabel(expense)
                    ) : (
                      "No related sale or purchase"
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Date</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Category</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Amount</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Related record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {expense.expense_date}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-950">
                      {categoryLabel(expense.category)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                      {formatMoney(expense.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {expense.related_sale_id ? (
                        <Link
                          href={`/sales/${expense.related_sale_id}`}
                          className="font-medium text-slate-950 hover:underline"
                        >
                          View sale
                        </Link>
                      ) : expense.related_purchase_batch_id ? (
                        purchaseExpenseLabel(expense)
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <ReportPanel
        exportType="product-performance"
        icon={BarChart3}
        rangeKey={reports.range.key}
        title="Product performance"
      >
        {reports.productPerformance.length === 0 ? (
          <EmptyReport label="sold products" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.productPerformance.map((row) => (
                <div
                  key={`${row.productId}:${row.variantId ?? "none"}`}
                  className="rounded-md bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {row.productName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.variantName ?? "No variant"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(row.grossProfit)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-slate-500">Qty sold</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {row.quantitySold}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Revenue</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(row.revenue)}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Product</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Variant</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Qty sold</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Revenue</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Gross profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.productPerformance.map((row) => (
                  <tr key={`${row.productId}:${row.variantId ?? "none"}`}>
                    <td className="px-3 py-3 font-medium text-slate-950">
                      {row.productName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {row.variantName ?? "No variant"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {row.quantitySold}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {formatMoney(row.revenue)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                      {formatMoney(row.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <ReportPanel
        exportType="supplier-price-history"
        icon={ShoppingBag}
        rangeKey={reports.range.key}
        title="Supplier price history"
      >
        {reports.supplierPriceHistory.length === 0 ? (
          <EmptyReport label="supplier purchases" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.supplierPriceHistory.map((row) => (
                <div
                  key={`${row.supplierId}:${row.productId}:${
                    row.variantId ?? "none"
                  }`}
                  className="rounded-md bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {row.supplierName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.productName} - {row.variantName ?? "No variant"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(row.latestLandedUnitCost)}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-slate-500">Purchases</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {row.purchases}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Min</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(row.minUnitPrice)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Max</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {formatMoney(row.maxUnitPrice)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs text-slate-500">
                    Latest {row.latestPurchaseDate}
                  </p>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Supplier</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Product</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Purchases</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Min unit</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Max unit</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Latest landed</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Latest date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.supplierPriceHistory.map((row) => (
                  <tr
                    key={`${row.supplierId}:${row.productId}:${
                      row.variantId ?? "none"
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-950">
                      {row.supplierName}
                    </td>
                    <td className="px-3 py-3 text-slate-700">
                      {row.productName} - {row.variantName ?? "No variant"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {row.purchases}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {formatMoney(row.minUnitPrice)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {formatMoney(row.maxUnitPrice)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                      {formatMoney(row.latestLandedUnitCost)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {row.latestPurchaseDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <ReportPanel
        exportType="dead-stock"
        icon={PackageSearch}
        rangeKey={reports.range.key}
        title="Dead stock"
      >
        {reports.deadStock.length === 0 ? (
          <EmptyReport label="dead-stock batches" />
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {reports.deadStock.map((batch) => (
                <div key={batch.id} className="rounded-md bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {productLabel(batch)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {batch.suppliers?.name ?? "Unknown supplier"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-950">
                      {formatMoney(
                        batch.quantity_available * (batch.landed_unit_cost ?? 0),
                      )}
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="text-slate-500">Available</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {batch.quantity_available}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Purchase date</dt>
                      <dd className="mt-1 font-semibold text-slate-950">
                        {batch.purchase_date}
                      </dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Item</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Supplier</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Available</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Value</th>
                  <th className="whitespace-nowrap px-3 py-2 font-medium">Purchase date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reports.deadStock.map((batch) => (
                  <tr key={batch.id}>
                    <td className="px-3 py-3 font-medium text-slate-950">
                      {productLabel(batch)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {batch.suppliers?.name ?? "Unknown supplier"}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                      {batch.quantity_available}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-semibold text-slate-950">
                      {formatMoney(
                        batch.quantity_available * (batch.landed_unit_cost ?? 0),
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {batch.purchase_date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </ReportPanel>

      <AddModal add={add} defaultKind="purchase" />
    </div>
  );
}
