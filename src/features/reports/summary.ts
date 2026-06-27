import { calculateNetProfit } from "@/lib/calculations/inventory";

type ReportSaleItem = {
  revenue: number | null;
  cogs: number | null;
  gross_profit: number | null;
};

type ReportExpense = {
  amount: number;
};

type ProfitAndLossInput = {
  saleItems: ReportSaleItem[];
  expenses: ReportExpense[];
  inventoryValue: number;
};

export type ProfitAndLossReport = {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  inventoryValue: number;
};

export type ProductPerformanceInput = {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantitySold: number;
  revenue: number | null;
  grossProfit: number | null;
};

export type ProductPerformanceRow = {
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantitySold: number;
  revenue: number;
  grossProfit: number;
};

export type SupplierPriceHistoryInput = {
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  purchaseDate: string;
  unitPrice: number;
  landedUnitCost: number | null;
};

export type SupplierPriceHistoryRow = {
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  purchases: number;
  minUnitPrice: number;
  maxUnitPrice: number;
  latestUnitPrice: number;
  latestLandedUnitCost: number | null;
  latestPurchaseDate: string;
};

export type DeadStockInput = {
  id: string;
  quantity: number;
  quantityAvailable: number;
  purchaseDate: string;
};

function sumNumbers(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateToInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function subtractDays(value: string, days: number) {
  const date = dateFromInput(value);
  date.setUTCDate(date.getUTCDate() - days);
  return dateToInputValue(date);
}

export function summarizeProfitAndLossReport({
  saleItems,
  expenses,
  inventoryValue,
}: ProfitAndLossInput): ProfitAndLossReport {
  const totalRevenue = sumNumbers(saleItems.map((item) => item.revenue ?? 0));
  const totalCogs = sumNumbers(saleItems.map((item) => item.cogs ?? 0));
  const grossProfit = sumNumbers(
    saleItems.map((item) => item.gross_profit ?? 0),
  );
  const totalExpenses = sumNumbers(expenses.map((expense) => expense.amount));

  return {
    totalRevenue,
    totalCogs,
    grossProfit,
    totalExpenses,
    netProfit: calculateNetProfit(grossProfit, totalExpenses),
    inventoryValue,
  };
}

export function buildProductPerformanceReport(
  rows: ProductPerformanceInput[],
): ProductPerformanceRow[] {
  const grouped = new Map<string, ProductPerformanceRow>();

  for (const row of rows) {
    const key = `${row.productId}:${row.variantId ?? "none"}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.quantitySold += row.quantitySold;
      existing.revenue += row.revenue ?? 0;
      existing.grossProfit += row.grossProfit ?? 0;
      continue;
    }

    grouped.set(key, {
      productId: row.productId,
      productName: row.productName,
      variantId: row.variantId,
      variantName: row.variantName,
      quantitySold: row.quantitySold,
      revenue: row.revenue ?? 0,
      grossProfit: row.grossProfit ?? 0,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => {
    if (right.grossProfit !== left.grossProfit) {
      return right.grossProfit - left.grossProfit;
    }

    return right.revenue - left.revenue;
  });
}

export function buildSupplierPriceHistoryReport(
  rows: SupplierPriceHistoryInput[],
): SupplierPriceHistoryRow[] {
  const grouped = new Map<string, SupplierPriceHistoryRow>();

  for (const row of rows) {
    const key = `${row.supplierId}:${row.productId}:${row.variantId ?? "none"}`;
    const existing = grouped.get(key);

    if (existing) {
      existing.purchases += 1;
      existing.minUnitPrice = Math.min(existing.minUnitPrice, row.unitPrice);
      existing.maxUnitPrice = Math.max(existing.maxUnitPrice, row.unitPrice);

      if (row.purchaseDate >= existing.latestPurchaseDate) {
        existing.latestUnitPrice = row.unitPrice;
        existing.latestLandedUnitCost = row.landedUnitCost;
        existing.latestPurchaseDate = row.purchaseDate;
      }
      continue;
    }

    grouped.set(key, {
      supplierId: row.supplierId,
      supplierName: row.supplierName,
      productId: row.productId,
      productName: row.productName,
      variantId: row.variantId,
      variantName: row.variantName,
      purchases: 1,
      minUnitPrice: row.unitPrice,
      maxUnitPrice: row.unitPrice,
      latestUnitPrice: row.unitPrice,
      latestLandedUnitCost: row.landedUnitCost,
      latestPurchaseDate: row.purchaseDate,
    });
  }

  return Array.from(grouped.values()).sort((left, right) => {
    const productCompare = left.productName.localeCompare(right.productName);
    if (productCompare !== 0) {
      return productCompare;
    }

    return left.supplierName.localeCompare(right.supplierName);
  });
}

export function pickDeadStockReportRows<T extends DeadStockInput>(
  rows: T[],
  referenceDate = dateToInputValue(new Date()),
): T[] {
  const deadStockBefore = subtractDays(referenceDate, 30);

  return rows.filter(
    (row) =>
      row.quantityAvailable > 0 &&
      row.quantityAvailable === row.quantity &&
      row.purchaseDate <= deadStockBefore,
  );
}
