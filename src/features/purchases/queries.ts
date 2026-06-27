import { getRequiredUser } from "@/lib/auth/require-user";

export type PurchaseProductOption = {
  id: string;
  name: string;
  product_variants: Array<{
    id: string;
    variant_name: string;
  }>;
};

export type PurchaseSupplierOption = {
  id: string;
  name: string;
};

export type PurchaseBatchRow = {
  id: string;
  quantity: number;
  quantity_available: number;
  unit_price: number;
  shipping_fee: number;
  other_fee: number;
  total_item_cost: number | null;
  total_purchase_cost: number | null;
  landed_unit_cost: number | null;
  purchase_date: string;
  notes: string | null;
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
  expenses: Array<{
    id: string;
    expense_date: string;
    category: string;
    amount: number;
    related_purchase_batch_id: string | null;
    created_at: string;
  }>;
};

type PurchaseBatchWithoutExpenses = Omit<PurchaseBatchRow, "expenses">;

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

async function attachPurchaseExpenses({
  purchases,
  supabase,
  userId,
}: {
  purchases: PurchaseBatchWithoutExpenses[];
  supabase: Awaited<ReturnType<typeof getRequiredUser>>["supabase"];
  userId: string;
}): Promise<PurchaseBatchRow[]> {
  const purchaseIds = purchases.map((purchase) => purchase.id);

  if (purchaseIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
        id,
        expense_date,
        category,
        amount,
        related_purchase_batch_id,
        created_at
      `,
    )
    .eq("owner_id", userId)
    .in("related_purchase_batch_id", purchaseIds)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingPurchaseExpenseLinkError(error)) {
      return purchases.map((purchase) => ({
        ...purchase,
        expenses: [],
      }));
    }

    throw new Error(error.message);
  }

  const expensesByPurchaseId = new Map<
    string,
    PurchaseBatchRow["expenses"]
  >();

  for (const expense of data as PurchaseBatchRow["expenses"]) {
    if (!expense.related_purchase_batch_id) {
      continue;
    }

    const current = expensesByPurchaseId.get(expense.related_purchase_batch_id) ?? [];
    current.push(expense);
    expensesByPurchaseId.set(expense.related_purchase_batch_id, current);
  }

  return purchases.map((purchase) => ({
    ...purchase,
    expenses: expensesByPurchaseId.get(purchase.id) ?? [],
  }));
}

export async function getPurchaseFormOptions() {
  const { supabase, user } = await getRequiredUser();

  const [productsResult, suppliersResult] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, product_variants(id, variant_name)")
      .eq("owner_id", user.id)
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("suppliers")
      .select("id, name")
      .eq("owner_id", user.id)
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    throw new Error(productsResult.error.message);
  }

  if (suppliersResult.error) {
    throw new Error(suppliersResult.error.message);
  }

  return {
    products: productsResult.data as PurchaseProductOption[],
    suppliers: suppliersResult.data as PurchaseSupplierOption[],
  };
}

export async function getPurchases() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("purchase_batches")
    .select(
      `
        id,
        quantity,
        quantity_available,
        unit_price,
        shipping_fee,
        other_fee,
        total_item_cost,
        total_purchase_cost,
        landed_unit_cost,
        purchase_date,
        notes,
        created_at,
        products(id, name),
        product_variants(id, variant_name),
        suppliers(id, name)
      `,
    )
    .eq("owner_id", user.id)
    .order("purchase_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return attachPurchaseExpenses({
    purchases: data as PurchaseBatchWithoutExpenses[],
    supabase,
    userId: user.id,
  });
}

export async function getInventoryBatches() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("purchase_batches")
    .select(
      `
        id,
        quantity,
        quantity_available,
        unit_price,
        shipping_fee,
        other_fee,
        total_item_cost,
        total_purchase_cost,
        landed_unit_cost,
        purchase_date,
        notes,
        created_at,
        products(id, name),
        product_variants(id, variant_name),
        suppliers(id, name)
      `,
    )
    .eq("owner_id", user.id)
    .order("quantity_available", { ascending: false })
    .order("purchase_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return attachPurchaseExpenses({
    purchases: data as PurchaseBatchWithoutExpenses[],
    supabase,
    userId: user.id,
  });
}
