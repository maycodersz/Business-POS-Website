import type { getReportsData } from "@/features/reports/queries";

export type ReportExportType =
  | "profit-loss"
  | "sales"
  | "inventory"
  | "expenses"
  | "product-performance"
  | "supplier-price-history"
  | "dead-stock";

type ReportsData = Awaited<ReturnType<typeof getReportsData>>;

type CsvRow = Record<string, number | string | null | undefined>;

export const reportExportLabels: Record<ReportExportType, string> = {
  "profit-loss": "Profit and loss",
  sales: "Sales report",
  inventory: "Inventory valuation",
  expenses: "Expense report",
  "product-performance": "Product performance",
  "supplier-price-history": "Supplier price history",
  "dead-stock": "Dead stock",
};

export const reportExportTypes = Object.keys(
  reportExportLabels,
) as ReportExportType[];

function productLabel(value: {
  products?: { name: string } | null;
  product_variants?: { variant_name: string } | null;
}) {
  return `${value.products?.name ?? "Unknown product"} - ${
    value.product_variants?.variant_name ?? "No variant"
  }`;
}

function csvValue(value: number | string | null | undefined) {
  const normalized = value ?? "";
  const text = String(normalized);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function rowsToCsv(rows: CsvRow[]) {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0] ?? {});
  return [
    headers.map(csvValue).join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\r\n");
}

function reportRows(type: ReportExportType, reports: ReportsData): CsvRow[] {
  if (type === "profit-loss") {
    return [
      {
        range: reports.range.label,
        revenue: reports.profitAndLoss.totalRevenue,
        cogs: reports.profitAndLoss.totalCogs,
        gross_profit: reports.profitAndLoss.grossProfit,
        expenses: reports.profitAndLoss.totalExpenses,
        net_profit: reports.profitAndLoss.netProfit,
        inventory_value: reports.profitAndLoss.inventoryValue,
      },
    ];
  }

  if (type === "sales") {
    return reports.sales.flatMap((sale) =>
      sale.sale_items.map((item) => ({
        date: sale.sale_date,
        customer: sale.customer_name,
        platform: sale.platform,
        product: item.products?.name ?? "Unknown product",
        variant: item.product_variants?.variant_name ?? "No variant",
        quantity: item.quantity_sold,
        unit_price: item.selling_price,
        revenue: item.revenue,
        cogs: item.cogs,
        gross_profit: item.gross_profit,
      })),
    );
  }

  if (type === "inventory") {
    return reports.inventory.map((batch) => ({
      product: batch.products?.name ?? "Unknown product",
      variant: batch.product_variants?.variant_name ?? "No variant",
      supplier: batch.suppliers?.name ?? "Unknown supplier",
      quantity: batch.quantity,
      available: batch.quantity_available,
      unit_price: batch.unit_price,
      landed_unit_cost: batch.landed_unit_cost,
      inventory_value: batch.quantity_available * (batch.landed_unit_cost ?? 0),
      purchase_date: batch.purchase_date,
    }));
  }

  if (type === "expenses") {
    return reports.expenses.map((expense) => ({
      date: expense.expense_date,
      category: expense.category,
      amount: expense.amount,
      related_sale_id: expense.related_sale_id,
    }));
  }

  if (type === "product-performance") {
    return reports.productPerformance.map((row) => ({
      product: row.productName,
      variant: row.variantName ?? "No variant",
      quantity_sold: row.quantitySold,
      revenue: row.revenue,
      gross_profit: row.grossProfit,
    }));
  }

  if (type === "supplier-price-history") {
    return reports.supplierPriceHistory.map((row) => ({
      supplier: row.supplierName,
      product: row.productName,
      variant: row.variantName ?? "No variant",
      purchases: row.purchases,
      min_unit_price: row.minUnitPrice,
      max_unit_price: row.maxUnitPrice,
      latest_unit_price: row.latestUnitPrice,
      latest_landed_unit_cost: row.latestLandedUnitCost,
      latest_purchase_date: row.latestPurchaseDate,
    }));
  }

  return reports.deadStock.map((batch) => ({
    item: productLabel(batch),
    supplier: batch.suppliers?.name ?? "Unknown supplier",
    quantity: batch.quantity,
    available: batch.quantity_available,
    landed_unit_cost: batch.landed_unit_cost,
    inventory_value: batch.quantity_available * (batch.landed_unit_cost ?? 0),
    purchase_date: batch.purchase_date,
  }));
}

export function buildReportCsv(type: ReportExportType, reports: ReportsData) {
  return rowsToCsv(reportRows(type, reports));
}

export function isReportExportType(value: string): value is ReportExportType {
  return reportExportTypes.includes(value as ReportExportType);
}

export function reportExportFilename(type: ReportExportType, rangeKey: string) {
  return `resellops-${type}-${rangeKey}.csv`;
}
