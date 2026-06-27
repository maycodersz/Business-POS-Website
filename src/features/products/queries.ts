import { getRequiredUser } from "@/lib/auth/require-user";
import type { PurchaseBatchRow } from "@/features/purchases/queries";

export type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  product_variants: Array<{
    id: string;
    variant_name: string;
    created_at: string;
  }>;
  purchase_batches: ProductPurchaseBatch[];
};

export type ProductPurchaseBatch = Omit<PurchaseBatchRow, "products">;

export async function getProducts(search?: string) {
  const { supabase, user } = await getRequiredUser();
  let query = supabase
    .from("products")
    .select(
      "id, name, description, status, created_at, product_variants(id, variant_name, created_at)",
    )
    .eq("owner_id", user.id)
    .order("name", { ascending: true });

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getProductDetail(productId: string) {
  const { supabase, user } = await getRequiredUser();

  const [productResult, batchesResult] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, status, created_at, product_variants(id, variant_name, created_at)",
      )
      .eq("id", productId)
      .eq("owner_id", user.id)
      .maybeSingle(),
    supabase
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
          product_variants(id, variant_name),
          suppliers(id, name)
        `,
      )
      .eq("product_id", productId)
      .eq("owner_id", user.id)
      .order("purchase_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (productResult.error) {
    throw new Error(productResult.error.message);
  }

  if (batchesResult.error) {
    throw new Error(batchesResult.error.message);
  }

  if (!productResult.data) {
    return null;
  }

  return {
    ...productResult.data,
    purchase_batches: batchesResult.data as ProductPurchaseBatch[],
  } as ProductDetail;
}
