"use server";

import { revalidatePath } from "next/cache";

import { normalizeInventoryAdjustmentForm } from "@/features/inventory/adjustment-validation";
import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";

export type InventoryAdjustmentActionState = {
  ok?: boolean;
  message?: string;
};

export async function adjustInventoryAction(
  _previousState: InventoryAdjustmentActionState,
  formData: FormData,
): Promise<InventoryAdjustmentActionState> {
  const purchaseBatchId = String(formData.get("purchase_batch_id") ?? "");
  const { supabase, user } = await getRequiredUser();

  const { data: batch, error: batchError } = await supabase
    .from("purchase_batches")
    .select("id, quantity, quantity_available")
    .eq("id", purchaseBatchId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (batchError) {
    return { message: friendlySupabaseError(batchError, "Batch could not be loaded.") };
  }

  const parsed = normalizeInventoryAdjustmentForm(formData, batch);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { error } = await supabase.rpc("adjust_inventory_batch", {
    p_purchase_batch_id: parsed.data.purchase_batch_id,
    p_quantity_delta: parsed.data.quantity_delta,
    p_notes: parsed.data.notes,
  });

  if (error) {
    return {
      message: friendlySupabaseError(
        error,
        "Inventory adjustment could not be saved.",
      ),
    };
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/products");

  return { ok: true, message: "Inventory adjusted and movement logged." };
}
