import { calculateNetProfit } from "@/lib/calculations/inventory";

type SaleItemSummary = {
  revenue: number | null;
  cogs: number | null;
  gross_profit: number | null;
};

type ExpenseSummary = {
  amount: number;
};

type ExpenseCategorySummary = {
  amount: number;
  category: string;
};

type BatchSummary = {
  quantity: number;
  quantity_available: number;
  landed_unit_cost: number | null;
  total_purchase_cost: number | null;
  purchase_date: string;
};

type DashboardSummaryInput = {
  saleItems: SaleItemSummary[];
  expenses: ExpenseSummary[];
  batches: BatchSummary[];
  referenceDate?: string;
};

export type DashboardSummary = {
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  inventoryValue: number;
  inventoryCashSpent: number;
  unsoldStock: number;
  lowStockCount: number;
  deadStockCount: number;
};

export type DashboardRangeKey = "1d" | "7d" | "30d" | "90d" | "all";

export type DashboardRange = {
  key: DashboardRangeKey;
  label: string;
  startDate: string | null;
  endDate: string;
};

type DatedSaleItemSummary = SaleItemSummary & {
  sale_date: string;
};

type DatedExpenseSummary = ExpenseSummary & {
  expense_date: string;
};

export type DashboardSeriesPoint = {
  date: string;
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
};

export type ExpenseCategoryPoint = {
  category: string;
  amount: number;
};

const rangeOptions: Record<
  DashboardRangeKey,
  { days: number | null; label: string }
> = {
  "1d": { days: 1, label: "Today" },
  "7d": { days: 7, label: "Last 7 days" },
  "30d": { days: 30, label: "Last 30 days" },
  "90d": { days: 90, label: "Last 90 days" },
  all: { days: null, label: "All time" },
};

const expenseCategories = [
  "shipping",
  "packaging",
  "refund",
  "labour",
  "others",
];

function sumNumbers(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function dateToInputValue(value: Date) {
  return value.toISOString().slice(0, 10);
}

function addDays(value: string, days: number) {
  const date = dateFromInput(value);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToInputValue(date);
}

function subtractDays(value: string, days: number) {
  return addDays(value, -days);
}

function isDashboardRangeKey(value: unknown): value is DashboardRangeKey {
  return (
    value === "1d" ||
    value === "7d" ||
    value === "30d" ||
    value === "90d" ||
    value === "all"
  );
}

export function normalizeDashboardRange(
  value: unknown,
  referenceDate = dateToInputValue(new Date()),
): DashboardRange {
  const key = isDashboardRangeKey(value) ? value : "30d";
  const option = rangeOptions[key];
  const startDate = option.days ? subtractDays(referenceDate, option.days - 1) : null;

  return {
    key,
    label: option.label,
    startDate,
    endDate: referenceDate,
  };
}

export function summarizeDashboard({
  saleItems,
  expenses,
  batches,
  referenceDate = dateToInputValue(new Date()),
}: DashboardSummaryInput): DashboardSummary {
  const totalRevenue = sumNumbers(
    saleItems.map((item) => item.revenue ?? 0),
  );
  const totalCogs = sumNumbers(saleItems.map((item) => item.cogs ?? 0));
  const grossProfit = sumNumbers(
    saleItems.map((item) => item.gross_profit ?? 0),
  );
  const totalExpenses = sumNumbers(expenses.map((expense) => expense.amount));
  const inventoryValue = sumNumbers(
    batches.map(
      (batch) => batch.quantity_available * (batch.landed_unit_cost ?? 0),
    ),
  );
  const unsoldStock = sumNumbers(
    batches.map((batch) => batch.quantity_available),
  );
  const inventoryCashSpent = sumNumbers(
    batches.map((batch) => batch.total_purchase_cost ?? 0),
  );
  const alerts = pickInventoryAlerts(batches, referenceDate);

  return {
    totalRevenue,
    totalCogs,
    grossProfit,
    totalExpenses,
    netProfit: calculateNetProfit(grossProfit, totalExpenses),
    inventoryValue,
    inventoryCashSpent,
    unsoldStock,
    lowStockCount: alerts.lowStock.length,
    deadStockCount: alerts.deadStock.length,
  };
}

export function pickInventoryAlerts<T extends BatchSummary>(
  batches: T[],
  referenceDate = dateToInputValue(new Date()),
) {
  const deadStockBefore = subtractDays(referenceDate, 30);

  return {
    lowStock: batches.filter(
      (batch) => batch.quantity_available > 0 && batch.quantity_available <= 2,
    ),
    deadStock: batches.filter(
      (batch) =>
        batch.quantity_available > 0 &&
        batch.quantity_available === batch.quantity &&
        batch.purchase_date <= deadStockBefore,
    ),
  };
}

export function buildDailyDashboardSeries({
  range,
  saleItems,
  expenses,
}: {
  range: DashboardRange;
  saleItems: DatedSaleItemSummary[];
  expenses: DatedExpenseSummary[];
}): DashboardSeriesPoint[] {
  const dates =
    range.startDate === null
      ? Array.from(
          new Set([
            ...saleItems.map((item) => item.sale_date),
            ...expenses.map((expense) => expense.expense_date),
          ]),
        ).sort()
      : Array.from(
          {
            length:
              Math.floor(
                (dateFromInput(range.endDate).getTime() -
                  dateFromInput(range.startDate).getTime()) /
                  86400000,
              ) + 1,
          },
          (_, index) => addDays(range.startDate as string, index),
        );

  const points = new Map<string, DashboardSeriesPoint>();
  for (const date of dates) {
    points.set(date, {
      date,
      revenue: 0,
      expenses: 0,
      grossProfit: 0,
      netProfit: 0,
    });
  }

  for (const saleItem of saleItems) {
    const point = points.get(saleItem.sale_date);
    if (!point) {
      continue;
    }

    point.revenue += saleItem.revenue ?? 0;
    point.grossProfit += saleItem.gross_profit ?? 0;
  }

  for (const expense of expenses) {
    const point = points.get(expense.expense_date);
    if (!point) {
      continue;
    }

    point.expenses += expense.amount;
  }

  return Array.from(points.values()).map((point) => ({
    ...point,
    netProfit: calculateNetProfit(point.grossProfit, point.expenses),
  }));
}

export function summarizeExpenseCategories(
  expenses: ExpenseCategorySummary[],
): ExpenseCategoryPoint[] {
  return expenseCategories.map((category) => ({
    category,
    amount: sumNumbers(
      expenses
        .filter((expense) => expense.category === category)
        .map((expense) => expense.amount),
    ),
  }));
}
