import {
  normalizeDashboardRange,
  type DashboardRangeKey,
} from "@/features/dashboard/summary";
import {
  buildProductPerformanceReport,
  buildSupplierPriceHistoryReport,
  pickDeadStockReportRows,
  summarizeProfitAndLossReport,
} from "@/features/reports/summary";
import { getRequiredUser } from "@/lib/auth/require-user";
import { appDateInputValue } from "@/lib/dates/local-date";

export type ReportSale = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  platform: string | null;
  created_at: string;
  sale_items: Array<{
    id: string;
    quantity_sold: number;
    selling_price: number;
    revenue: number | null;
    cogs: number | null;
    gross_profit: number | null;
    products: {
      id: string;
      name: string;
    } | null;
    product_variants: {
      id: string;
      variant_name: string;
    } | null;
  }>;
};

export type ReportExpense = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  related_sale_id: string | null;
  related_purchase_batch_id: string | null;
  created_at: string;
  purchase_batches: {
    id: string;
    purchase_date: string;
    products: {
      name: string;
    } | null;
    product_variants: {
      variant_name: string;
    } | null;
    suppliers: {
      name: string;
    } | null;
  } | null;
};

type ReportExpenseWithoutPurchase = Omit<ReportExpense, "purchase_batches">;

export type ReportPurchase = {
  id: string;
  purchase_date: string;
  quantity: number;
  quantity_available: number;
  unit_price: number;
  total_purchase_cost: number | null;
  landed_unit_cost: number | null;
  created_at: string;
  products: {
    id: string;
    name: string;
  } | null;
  product_variants: {
    id: string;
    variant_name: string;
  } | null;
  suppliers: {
    id: string;
    name: string;
  } | null;
};

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

function isMissingPurchaseExpenseLinkError(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "PGRST200" ||
    error.code === "PGRST204" ||
    error.message?.includes("relationship") === true ||
    error.message?.includes("related_purchase_batch_id") === true ||
    error.message?.includes("schema cache") === true
  );
}

function flattenSaleItems(sales: ReportSale[]) {
  return sales.flatMap((sale) =>
    sale.sale_items.map((item) => ({
      productId: item.products?.id ?? "unknown",
      productName: item.products?.name ?? "Unknown product",
      variantId: item.product_variants?.id ?? null,
      variantName: item.product_variants?.variant_name ?? null,
      quantitySold: item.quantity_sold,
      revenue: item.revenue,
      cogs: item.cogs,
      gross_profit: item.gross_profit,
      grossProfit: item.gross_profit,
    })),
  );
}

function inventoryValue(purchases: ReportPurchase[]) {
  return purchases.reduce(
    (total, purchase) =>
      total + purchase.quantity_available * (purchase.landed_unit_cost ?? 0),
    0,
  );
}

export async function getReportsData(rangeKey?: DashboardRangeKey | string) {
  const range = normalizeDashboardRange(rangeKey, appDateInputValue());
  const { supabase, user } = await getRequiredUser();

  async function attachPurchaseSummaries(
    expenses: ReportExpenseWithoutPurchase[],
  ): Promise<ReportExpense[]> {
    const purchaseIds = Array.from(
      new Set(
        expenses
          .map((expense) => expense.related_purchase_batch_id)
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (purchaseIds.length === 0) {
      return expenses.map((expense) => ({
        ...expense,
        purchase_batches: null,
      }));
    }

    const { data, error } = await supabase
      .from("purchase_batches")
      .select(
        `
          id,
          purchase_date,
          products(name),
          product_variants(variant_name),
          suppliers(name)
        `,
      )
      .eq("owner_id", user.id)
      .in("id", purchaseIds);

    if (error) {
      throw new Error(error.message);
    }

    const purchaseById = new Map(
      data.map((purchase) => [purchase.id, purchase]),
    );

    return expenses.map((expense) => ({
      ...expense,
      purchase_batches: expense.related_purchase_batch_id
        ? (purchaseById.get(expense.related_purchase_batch_id) ?? null)
        : null,
    })) as ReportExpense[];
  }

  async function fetchExpenses() {
    const baseQuery = supabase
      .from("expenses")
      .select(
        `
          id,
          expense_date,
          category,
          amount,
          related_sale_id,
          related_purchase_batch_id,
          created_at
        `,
      )
      .eq("owner_id", user.id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });
    const result = await applyDateRange(
      baseQuery,
      "expense_date",
      range.startDate,
      range.endDate,
    );

    if (!result.error) {
      return attachPurchaseSummaries(result.data as ReportExpenseWithoutPurchase[]);
    }

    if (!isMissingPurchaseExpenseLinkError(result.error)) {
      throw new Error(result.error.message);
    }

    const fallbackBaseQuery = supabase
      .from("expenses")
      .select(
        `
          id,
          expense_date,
          category,
          amount,
          related_sale_id,
          created_at
        `,
      )
      .eq("owner_id", user.id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });
    const fallback = await applyDateRange(
      fallbackBaseQuery,
      "expense_date",
      range.startDate,
      range.endDate,
    );

    if (fallback.error) {
      throw new Error(fallback.error.message);
    }

    return (
      fallback.data as Array<
        Omit<ReportExpenseWithoutPurchase, "related_purchase_batch_id">
      >
    ).map((expense) => ({
      ...expense,
      related_purchase_batch_id: null,
      purchase_batches: null,
    }));
  }

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
          id,
          quantity_sold,
          selling_price,
          revenue,
          cogs,
          gross_profit,
          products(id, name),
          product_variants(id, variant_name)
        )
      `,
    )
    .eq("owner_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  const purchasesBaseQuery = supabase
    .from("purchase_batches")
    .select(
      `
        id,
        purchase_date,
        quantity,
        quantity_available,
        unit_price,
        total_purchase_cost,
        landed_unit_cost,
        created_at,
        products(id, name),
        product_variants(id, variant_name),
        suppliers(id, name)
      `,
    )
    .eq("owner_id", user.id)
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  const [
    salesResult,
    expensesResult,
    purchasesResult,
    inventoryResult,
  ] = await Promise.all([
    applyDateRange(
      salesBaseQuery,
      "sale_date",
      range.startDate,
      range.endDate,
    ),
    fetchExpenses(),
    applyDateRange(
      purchasesBaseQuery,
      "purchase_date",
      range.startDate,
      range.endDate,
    ),
    supabase
      .from("purchase_batches")
      .select(
        `
          id,
          purchase_date,
          quantity,
          quantity_available,
          unit_price,
          total_purchase_cost,
          landed_unit_cost,
          created_at,
          products(id, name),
          product_variants(id, variant_name),
          suppliers(id, name)
        `,
      )
      .eq("owner_id", user.id)
      .order("purchase_date", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  if (salesResult.error) {
    throw new Error(salesResult.error.message);
  }

  if (purchasesResult.error) {
    throw new Error(purchasesResult.error.message);
  }

  if (inventoryResult.error) {
    throw new Error(inventoryResult.error.message);
  }

  const sales = salesResult.data as ReportSale[];
  const expenses = expensesResult;
  const purchases = purchasesResult.data as ReportPurchase[];
  const inventory = inventoryResult.data as ReportPurchase[];
  const saleItems = flattenSaleItems(sales);
  const currentInventoryValue = inventoryValue(inventory);

  return {
    range,
    profitAndLoss: summarizeProfitAndLossReport({
      saleItems,
      expenses,
      inventoryValue: currentInventoryValue,
    }),
    sales,
    expenses,
    inventory,
    productPerformance: buildProductPerformanceReport(saleItems),
    supplierPriceHistory: buildSupplierPriceHistoryReport(
      purchases.map((purchase) => ({
        supplierId: purchase.suppliers?.id ?? "unknown",
        supplierName: purchase.suppliers?.name ?? "Unknown supplier",
        productId: purchase.products?.id ?? "unknown",
        productName: purchase.products?.name ?? "Unknown product",
        variantId: purchase.product_variants?.id ?? null,
        variantName: purchase.product_variants?.variant_name ?? null,
        purchaseDate: purchase.purchase_date,
        unitPrice: purchase.unit_price,
        landedUnitCost: purchase.landed_unit_cost,
      })),
    ),
    deadStock: pickDeadStockReportRows(
      inventory.map((purchase) => ({
        ...purchase,
        quantityAvailable: purchase.quantity_available,
        purchaseDate: purchase.purchase_date,
      })),
      range.endDate,
    ),
  };
}
