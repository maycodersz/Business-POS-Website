import { getRequiredUser } from "@/lib/auth/require-user";

export type AvailableSaleBatch = {
  id: string;
  quantity_available: number;
  landed_unit_cost: number | null;
  purchase_date: string;
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

export type SaleRow = {
  id: string;
  sale_date: string;
  customer_name: string | null;
  platform: string | null;
  notes: string | null;
  created_at: string;
  sale_items: Array<{
    id: string;
    quantity_sold: number;
    selling_price: number;
    unit_cogs: number;
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
    purchase_batches: {
      id: string;
      quantity_available: number;
      suppliers: {
        id: string;
        name: string;
      } | null;
    } | null;
  }>;
  expenses?: Array<{
    id: string;
    expense_date: string;
    category: string;
    amount: number;
  }>;
};

export async function getAvailableSaleBatches() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("purchase_batches")
    .select(
      `
        id,
        quantity_available,
        landed_unit_cost,
        purchase_date,
        products(id, name),
        product_variants(id, variant_name),
        suppliers(id, name)
      `,
    )
    .eq("owner_id", user.id)
    .gt("quantity_available", 0)
    .order("purchase_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as AvailableSaleBatch[];
}

export async function getSales() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
        id,
        sale_date,
        customer_name,
        platform,
        notes,
        created_at,
        sale_items(
          id,
          quantity_sold,
          selling_price,
          unit_cogs,
          revenue,
          cogs,
          gross_profit,
          products(id, name),
          product_variants(id, variant_name),
          purchase_batches(id, quantity_available, suppliers(id, name))
        )
      `,
    )
    .eq("owner_id", user.id)
    .order("sale_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as SaleRow[];
}

export async function getSaleDetail(saleId: string) {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("sales")
    .select(
      `
        id,
        sale_date,
        customer_name,
        platform,
        notes,
        created_at,
        sale_items(
          id,
          quantity_sold,
          selling_price,
          unit_cogs,
          revenue,
          cogs,
          gross_profit,
          products(id, name),
          product_variants(id, variant_name),
          purchase_batches(id, quantity_available, suppliers(id, name))
        ),
        expenses(
          id,
          expense_date,
          category,
          amount
        )
      `,
    )
    .eq("id", saleId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as SaleRow | null;
}
