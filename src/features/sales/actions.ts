"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";
import {
  normalizeSaleForm,
  normalizeSaleUpdateForm,
} from "@/features/sales/validation";

export type SaleActionState = {
  ok?: boolean;
  message?: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

type SaleItemMutationContext = {
  id: string;
  purchase_batch_id: string;
  product_id: string;
  variant_id: string | null;
  quantity_sold: number;
  unit_cogs: number;
  purchase_batches:
    | {
        id: string;
        quantity_available: number;
      }
    | {
        id: string;
        quantity_available: number;
      }[]
    | null;
};

function isMissingRpcError(error: SupabaseErrorLike) {
  return (
    error.code === "PGRST202" ||
    error.message?.includes("Could not find the function") === true
  );
}

function relatedBatch(item: SaleItemMutationContext) {
  return Array.isArray(item.purchase_batches)
    ? item.purchase_batches[0]
    : item.purchase_batches;
}

function revalidateSaleMutationPaths(saleId: string) {
  revalidatePath("/sales");
  revalidatePath(`/sales/${saleId}`);
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/products");
}

export async function createSaleAction(
  _previousState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const purchaseBatchId = String(formData.get("purchase_batch_id") ?? "");
  const { supabase, user } = await getRequiredUser();

  const { data: batch, error: batchError } = await supabase
    .from("purchase_batches")
    .select("id, quantity_available, landed_unit_cost")
    .eq("id", purchaseBatchId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (batchError) {
    return { message: friendlySupabaseError(batchError, "Batch could not be loaded.") };
  }

  const parsed = normalizeSaleForm(formData, batch);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { error } = await supabase.rpc("create_sale_from_batch", {
    p_purchase_batch_id: parsed.data.purchase_batch_id,
    p_quantity_sold: parsed.data.quantity_sold,
    p_selling_price: parsed.data.selling_price,
    p_sale_date: parsed.data.sale_date,
    p_customer_name: parsed.data.customer_name,
    p_platform: parsed.data.platform,
    p_notes: parsed.data.notes,
  });

  if (error) {
    return { message: friendlySupabaseError(error, "Sale could not be saved.") };
  }

  revalidatePath("/sales");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/products");

  return { ok: true, message: "Sale saved and inventory updated." };
}

export async function updateSaleAction(
  _previousState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const saleId = String(formData.get("sale_id") ?? "");
  const { supabase, user } = await getRequiredUser();

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .select(
      `
        id,
        sale_items(
          id,
          purchase_batch_id,
          product_id,
          variant_id,
          quantity_sold,
          unit_cogs,
          purchase_batches(id, quantity_available)
        )
      `,
    )
    .eq("id", saleId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (saleError) {
    return { message: friendlySupabaseError(saleError, "Sale could not be loaded.") };
  }

  const item = (sale?.sale_items[0] ?? null) as SaleItemMutationContext | null;
  const batch = item ? relatedBatch(item) : null;
  const capacity = item
    ? {
        quantity_sold: item.quantity_sold,
        batch_quantity_available: batch?.quantity_available ?? 0,
        unit_cogs: item.unit_cogs,
      }
    : null;

  const parsed = normalizeSaleUpdateForm(formData, capacity);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { error } = await supabase.rpc("update_sale_from_batch", {
    p_sale_id: parsed.data.sale_id,
    p_quantity_sold: parsed.data.quantity_sold,
    p_selling_price: parsed.data.selling_price,
    p_sale_date: parsed.data.sale_date,
    p_customer_name: parsed.data.customer_name,
    p_platform: parsed.data.platform,
    p_notes: parsed.data.notes,
  });

  if (error) {
    if (!isMissingRpcError(error) || !item || !batch) {
      return { message: friendlySupabaseError(error, "Sale could not be updated.") };
    }

    const quantityDelta = parsed.data.quantity_sold - item.quantity_sold;
    const nextQuantityAvailable = batch.quantity_available - quantityDelta;

    if (nextQuantityAvailable < 0) {
      return { message: "Not enough stock." };
    }

    const { error: saleUpdateError } = await supabase
      .from("sales")
      .update({
        sale_date: parsed.data.sale_date,
        customer_name: parsed.data.customer_name,
        platform: parsed.data.platform,
        notes: parsed.data.notes,
      })
      .eq("id", parsed.data.sale_id)
      .eq("owner_id", user.id);

    if (saleUpdateError) {
      return {
        message: friendlySupabaseError(
          saleUpdateError,
          "Sale could not be updated.",
        ),
      };
    }

    const { error: itemUpdateError } = await supabase
      .from("sale_items")
      .update({
        quantity_sold: parsed.data.quantity_sold,
        selling_price: parsed.data.selling_price,
      })
      .eq("id", item.id)
      .eq("owner_id", user.id);

    if (itemUpdateError) {
      return {
        message: friendlySupabaseError(
          itemUpdateError,
          "Sale item could not be updated.",
        ),
      };
    }

    if (quantityDelta !== 0) {
      const { error: batchUpdateError } = await supabase
        .from("purchase_batches")
        .update({ quantity_available: nextQuantityAvailable })
        .eq("id", item.purchase_batch_id)
        .eq("owner_id", user.id);

      if (batchUpdateError) {
        return {
          message: friendlySupabaseError(
            batchUpdateError,
            "Inventory could not be updated.",
          ),
        };
      }

      const { error: movementError } = await supabase
        .from("inventory_movements")
        .insert({
          owner_id: user.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          purchase_batch_id: item.purchase_batch_id,
          movement_type: "sale",
          quantity_change: -quantityDelta,
          reference_type: "sale_edit",
          reference_id: parsed.data.sale_id,
          notes: parsed.data.notes,
        });

      if (movementError) {
        return {
          message: friendlySupabaseError(
            movementError,
            "Inventory movement could not be saved.",
          ),
        };
      }
    }
  }

  revalidateSaleMutationPaths(parsed.data.sale_id);

  return { ok: true, message: "Sale updated and inventory adjusted." };
}

export async function deleteSaleAction(
  _previousState: SaleActionState,
  formData: FormData,
): Promise<SaleActionState> {
  const saleId = String(formData.get("sale_id") ?? "");

  if (!saleId) {
    return { message: "Sale is required." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: sale, error: saleLookupError } = await supabase
    .from("sales")
    .select(
      `
        id,
        sale_items(
          id,
          purchase_batch_id,
          product_id,
          variant_id,
          quantity_sold,
          purchase_batches(id, quantity_available)
        )
      `,
    )
    .eq("id", saleId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (saleLookupError) {
    return {
      message: friendlySupabaseError(saleLookupError, "Sale could not be loaded."),
    };
  }

  if (!sale) {
    return { message: "Sale not found." };
  }

  const item = (sale.sale_items[0] ?? null) as SaleItemMutationContext | null;
  const batch = item ? relatedBatch(item) : null;

  const { error } = await supabase.rpc("delete_sale_and_restore_inventory", {
    p_sale_id: saleId,
  });

  if (error) {
    if (!isMissingRpcError(error) || !item || !batch) {
      return { message: friendlySupabaseError(error, "Sale could not be deleted.") };
    }

    const { error: batchUpdateError } = await supabase
      .from("purchase_batches")
      .update({
        quantity_available: batch.quantity_available + item.quantity_sold,
      })
      .eq("id", item.purchase_batch_id)
      .eq("owner_id", user.id);

    if (batchUpdateError) {
      return {
        message: friendlySupabaseError(
          batchUpdateError,
          "Inventory could not be restored.",
        ),
      };
    }

    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        owner_id: user.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        purchase_batch_id: item.purchase_batch_id,
        movement_type: "refund_return",
        quantity_change: item.quantity_sold,
        reference_type: "sale_delete",
        reference_id: saleId,
        notes: "Sale deleted; stock restored.",
      });

    if (movementError) {
      return {
        message: friendlySupabaseError(
          movementError,
          "Inventory movement could not be saved.",
        ),
      };
    }

    const { error: deleteError } = await supabase
      .from("sales")
      .delete()
      .eq("id", saleId)
      .eq("owner_id", user.id);

    if (deleteError) {
      return {
        message: friendlySupabaseError(deleteError, "Sale could not be deleted."),
      };
    }
  }

  revalidateSaleMutationPaths(saleId);

  return { ok: true, message: "Sale deleted and stock restored." };
}
