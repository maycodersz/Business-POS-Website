import { getRequiredUser } from "@/lib/auth/require-user";

export type InventoryMovementRow = {
  id: string;
  movement_type: string;
  quantity_change: number;
  notes: string | null;
  created_at: string;
  purchase_batch_id: string | null;
  products: {
    id: string;
    name: string;
  } | null;
  product_variants: {
    id: string;
    variant_name: string;
  } | null;
};

export async function getInventoryMovements() {
  const { supabase, user } = await getRequiredUser();
  const { data, error } = await supabase
    .from("inventory_movements")
    .select(
      `
        id,
        movement_type,
        quantity_change,
        notes,
        created_at,
        purchase_batch_id,
        products(id, name),
        product_variants(id, variant_name)
      `,
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    throw new Error(error.message);
  }

  return data as InventoryMovementRow[];
}
