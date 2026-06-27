import { getRequiredUser } from "@/lib/auth/require-user";

export type ExpenseSaleOption = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  platform: string | null;
  sale_items: Array<{
    quantity_sold: number;
    products: {
      name: string;
    } | null;
    product_variants: {
      variant_name: string;
    } | null;
  }>;
};

export type ExpenseRow = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  related_sale_id: string | null;
  related_purchase_batch_id: string | null;
  created_at: string;
  sales: ExpenseSaleOption | null;
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

type ExpenseWithoutPurchase = Omit<ExpenseRow, "purchase_batches">;

const saleSelect = `
  id,
  sale_date,
  customer_name,
  platform,
  sale_items(
    quantity_sold,
    products(name),
    product_variants(variant_name)
  )
`;

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

async function attachPurchaseSummaries({
  expenses,
  supabase,
  userId,
}: {
  expenses: ExpenseWithoutPurchase[];
  supabase: Awaited<ReturnType<typeof getRequiredUser>>["supabase"];
  userId: string;
}): Promise<ExpenseRow[]> {
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
    .eq("owner_id", userId)
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
  })) as ExpenseRow[];
}

export async function getExpenses() {
  const { supabase, user } = await getRequiredUser();
  const query = supabase
    .from("expenses")
    .select(
      `
        id,
        expense_date,
        category,
        amount,
        related_sale_id,
        related_purchase_batch_id,
        created_at,
        sales(${saleSelect})
      `,
    )
    .eq("owner_id", user.id)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });
  const { data, error } = await query;

  if (error) {
    if (!isMissingPurchaseExpenseLinkError(error)) {
      throw new Error(error.message);
    }

    const fallback = await supabase
      .from("expenses")
      .select(
        `
          id,
          expense_date,
          category,
          amount,
          related_sale_id,
          created_at,
          sales(${saleSelect})
        `,
      )
      .eq("owner_id", user.id)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw new Error(fallback.error.message);
    }

    return (fallback.data as Array<Omit<ExpenseWithoutPurchase, "related_purchase_batch_id">>).map(
      (expense) => ({
        ...expense,
        related_purchase_batch_id: null,
        purchase_batches: null,
      }),
    );
  }

  return attachPurchaseSummaries({
    expenses: data as ExpenseWithoutPurchase[],
    supabase,
    userId: user.id,
  });
}

export async function getExpenseSaleOptions() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("sales")
    .select(saleSelect)
    .eq("owner_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as ExpenseSaleOption[];
}
