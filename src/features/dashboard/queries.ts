import {
  buildDailyDashboardSeries,
  normalizeDashboardRange,
  pickInventoryAlerts,
  summarizeDashboard,
  summarizeExpenseCategories,
  type DashboardRangeKey,
} from "@/features/dashboard/summary";
import { getRequiredUser } from "@/lib/auth/require-user";

type DashboardSale = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  platform: string | null;
  created_at: string;
  sale_items: Array<{
    quantity_sold: number;
    revenue: number | null;
    cogs: number | null;
    gross_profit: number | null;
    products: {
      name: string;
    } | null;
    product_variants: {
      variant_name: string;
    } | null;
  }>;
};

type DashboardExpense = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  related_sale_id: string | null;
  created_at: string;
};

type DashboardPurchase = {
  id: string;
  purchase_date: string;
  quantity: number;
  quantity_available: number;
  total_purchase_cost: number | null;
  landed_unit_cost: number | null;
  created_at: string;
  products: {
    name: string;
  } | null;
  product_variants: {
    variant_name: string;
  } | null;
  suppliers: {
    name: string;
  } | null;
};

export type DashboardInventoryAlert = DashboardPurchase;

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

type DateRangeQuery<T> = {
  gte(column: string, value: string): T;
  lte(column: string, value: string): T;
};

function applyDateRange<T extends DateRangeQuery<T>>(
  query: T,
  column: string,
  startDate: string | null,
  endDate: string,
) {
  const withEnd = query.lte(column, endDate);
  return startDate ? withEnd.gte(column, startDate) : withEnd;
}

function flattenSaleItems(sales: DashboardSale[]) {
  return sales.flatMap((sale) =>
    sale.sale_items.map((item) => ({
      sale_date: sale.sale_date,
      revenue: item.revenue,
      cogs: item.cogs,
      gross_profit: item.gross_profit,
    })),
  );
}

export async function getDashboardData(rangeKey?: DashboardRangeKey | string) {
  const range = normalizeDashboardRange(rangeKey, todayInputValue());
  const { supabase, user } = await getRequiredUser();

  const salesBaseQuery = supabase
    .from("sales")
    .select(
      `
        id,
        sale_date,
        customer_name,
        platform,
        created_at,
        sale_items(
          quantity_sold,
          revenue,
          cogs,
          gross_profit,
          products(name),
          product_variants(variant_name)
        )
      `,
    )
    .eq("owner_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });
  const expensesBaseQuery = supabase
    .from("expenses")
    .select("id, expense_date, category, amount, related_sale_id, created_at")
    .eq("owner_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  const purchasesBaseQuery = supabase
    .from("purchase_batches")
    .select(
      `
        id,
        purchase_date,
        quantity,
        quantity_available,
        total_purchase_cost,
        landed_unit_cost,
        created_at,
        products(name),
        product_variants(variant_name),
        suppliers(name)
      `,
    )
    .eq("owner_id", user.id)
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  const recentSalesBaseQuery = supabase
    .from("sales")
    .select(
      `
        id,
        sale_date,
        customer_name,
        platform,
        created_at,
        sale_items(
          quantity_sold,
          revenue,
          cogs,
          gross_profit,
          products(name),
          product_variants(variant_name)
        )
      `,
    )
    .eq("owner_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });
  const recentExpensesBaseQuery = supabase
    .from("expenses")
    .select("id, expense_date, category, amount, related_sale_id, created_at")
    .eq("owner_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  const [
    salesResult,
    recentSalesResult,
    expensesResult,
    recentExpensesResult,
    recentPurchasesResult,
    inventoryBatchesResult,
  ] = await Promise.all([
    applyDateRange(
      salesBaseQuery,
      "sale_date",
      range.startDate,
      range.endDate,
    ),
    applyDateRange(
      recentSalesBaseQuery,
      "sale_date",
      range.startDate,
      range.endDate,
    ).limit(5),
    applyDateRange(
      expensesBaseQuery,
      "expense_date",
      range.startDate,
      range.endDate,
    ),
    applyDateRange(
      recentExpensesBaseQuery,
      "expense_date",
      range.startDate,
      range.endDate,
    ).limit(5),
    applyDateRange(
      purchasesBaseQuery,
      "purchase_date",
      range.startDate,
      range.endDate,
    ).limit(5),
    supabase
      .from("purchase_batches")
      .select(
        `
          id,
          purchase_date,
          quantity,
          quantity_available,
          total_purchase_cost,
          landed_unit_cost,
          created_at,
          products(name),
          product_variants(variant_name),
          suppliers(name)
        `,
      )
      .eq("owner_id", user.id)
      .order("quantity_available", { ascending: true })
      .order("purchase_date", { ascending: true }),
  ]);

  if (salesResult.error) {
    throw new Error(salesResult.error.message);
  }

  if (expensesResult.error) {
    throw new Error(expensesResult.error.message);
  }

  if (recentSalesResult.error) {
    throw new Error(recentSalesResult.error.message);
  }

  if (recentExpensesResult.error) {
    throw new Error(recentExpensesResult.error.message);
  }

  if (recentPurchasesResult.error) {
    throw new Error(recentPurchasesResult.error.message);
  }

  if (inventoryBatchesResult.error) {
    throw new Error(inventoryBatchesResult.error.message);
  }

  const sales = salesResult.data as DashboardSale[];
  const recentSales = recentSalesResult.data as DashboardSale[];
  const expenses = expensesResult.data as DashboardExpense[];
  const recentExpenses = recentExpensesResult.data as DashboardExpense[];
  const recentPurchases = recentPurchasesResult.data as DashboardPurchase[];
  const inventoryBatches = inventoryBatchesResult.data as DashboardPurchase[];
  const saleItems = flattenSaleItems(sales);
  const inventoryAlerts = pickInventoryAlerts(
    inventoryBatches,
    range.endDate,
  );

  return {
    range,
    summary: summarizeDashboard({
      saleItems,
      expenses,
      batches: inventoryBatches,
      referenceDate: range.endDate,
    }),
    dailySeries: buildDailyDashboardSeries({
      range,
      saleItems,
      expenses,
    }),
    expenseCategories: summarizeExpenseCategories(expenses),
    recentPurchases,
    recentSales,
    recentExpenses,
    inventoryAlerts: {
      lowStock: inventoryAlerts.lowStock.slice(0, 5),
      deadStock: inventoryAlerts.deadStock.slice(0, 5),
    },
  };
}
