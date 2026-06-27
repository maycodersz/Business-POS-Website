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
  created_at: string;
  sales: ExpenseSaleOption | null;
};

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

export async function getExpenses() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
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

  if (error) {
    throw new Error(error.message);
  }

  return data as ExpenseRow[];
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
