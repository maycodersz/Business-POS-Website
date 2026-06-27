"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";
import {
  normalizePurchaseForm,
  normalizePurchaseUpdateForm,
} from "@/features/purchases/validation";

export type PurchaseActionState = {
  ok?: boolean;
  message?: string;
};

export async function createPurchaseAction(
  _previousState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const parsed = normalizePurchaseForm(formData);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { supabase, user } = await getRequiredUser();
  let productId = parsed.data.product_id;
  let supplierId = parsed.data.supplier_id;
  let variantId = parsed.data.variant_id;

  if (productId) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("owner_id", user.id)
      .neq("status", "archived")
      .maybeSingle();

    if (productError || !product) {
      return {
        message: productError
          ? friendlySupabaseError(productError, "Product could not be loaded.")
          : "Select an active product.",
      };
    }
  } else if (parsed.data.new_product_name) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        owner_id: user.id,
        name: parsed.data.new_product_name,
      })
      .select("id")
      .single();

    if (productError) {
      return {
        message: friendlySupabaseError(productError, "Product could not be saved."),
      };
    }

    productId = product.id;
  }

  if (supplierId) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .select("id")
      .eq("id", supplierId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (supplierError || !supplier) {
      return {
        message: supplierError
          ? friendlySupabaseError(
              supplierError,
              "Supplier could not be loaded.",
            )
          : "Select a supplier.",
      };
    }
  } else if (parsed.data.new_supplier_name) {
    const { data: supplier, error: supplierError } = await supabase
      .from("suppliers")
      .insert({
        owner_id: user.id,
        name: parsed.data.new_supplier_name,
      })
      .select("id")
      .single();

    if (supplierError) {
      return {
        message: friendlySupabaseError(
          supplierError,
          "Supplier could not be saved.",
        ),
      };
    }

    supplierId = supplier.id;
  }

  if (!productId || !supplierId) {
    return { message: "Product and supplier are required." };
  }

  if (variantId) {
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id")
      .eq("id", variantId)
      .eq("product_id", productId)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (variantError || !variant) {
      return {
        message: variantError
          ? friendlySupabaseError(variantError, "Variant could not be loaded.")
          : "Select a variant for this product.",
      };
    }
  } else if (parsed.data.new_variant_name) {
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .insert({
        owner_id: user.id,
        product_id: productId,
        variant_name: parsed.data.new_variant_name,
      })
      .select("id")
      .single();

    if (variantError) {
      return {
        message: friendlySupabaseError(
          variantError,
          "Variant could not be saved.",
        ),
      };
    }

    variantId = variant.id;
  }

  const { data: batch, error: batchError } = await supabase
    .from("purchase_batches")
    .insert({
      owner_id: user.id,
      product_id: productId,
      variant_id: variantId,
      supplier_id: supplierId,
      quantity: parsed.data.quantity,
      quantity_available: parsed.data.quantity_available,
      unit_price: parsed.data.unit_price,
      shipping_fee: parsed.data.shipping_fee,
      other_fee: parsed.data.other_fee,
      purchase_date: parsed.data.purchase_date,
      notes: parsed.data.notes,
    })
    .select("id")
    .single();

  if (batchError) {
    return {
      message: friendlySupabaseError(batchError, "Purchase could not be saved."),
    };
  }

  const { error: movementError } = await supabase
    .from("inventory_movements")
    .insert({
      owner_id: user.id,
      product_id: productId,
      variant_id: variantId,
      purchase_batch_id: batch.id,
      movement_type: "purchase",
      quantity_change: parsed.data.quantity,
      notes: parsed.data.notes,
    });

  if (movementError) {
    await supabase
      .from("purchase_batches")
      .delete()
      .eq("id", batch.id)
      .eq("owner_id", user.id);

    return {
      message: friendlySupabaseError(
        movementError,
        "Inventory movement could not be saved.",
      ),
    };
  }

  revalidatePath("/purchases");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");

  return { ok: true, message: "Purchase saved and inventory updated." };
}

export async function updatePurchaseAction(
  _previousState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const parsed = normalizePurchaseUpdateForm(formData);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: batch, error: batchError } = await supabase
    .from("purchase_batches")
    .select("id, quantity, quantity_available, product_id, variant_id")
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (batchError) {
    return {
      message: friendlySupabaseError(batchError, "Purchase could not be loaded."),
    };
  }

  if (!batch) {
    return { message: "Purchase batch not found." };
  }

  if (batch.quantity_available !== batch.quantity) {
    return { message: "Purchases with sales cannot be edited." };
  }

  const quantityDelta = parsed.data.quantity - batch.quantity;

  const { error } = await supabase
    .from("purchase_batches")
    .update({
      quantity: parsed.data.quantity,
      quantity_available: parsed.data.quantity_available,
      unit_price: parsed.data.unit_price,
      shipping_fee: parsed.data.shipping_fee,
      other_fee: parsed.data.other_fee,
      purchase_date: parsed.data.purchase_date,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) {
    return {
      message: friendlySupabaseError(error, "Purchase could not be updated."),
    };
  }

  if (quantityDelta !== 0) {
    const { error: movementError } = await supabase
      .from("inventory_movements")
      .insert({
        owner_id: user.id,
        product_id: batch.product_id,
        variant_id: batch.variant_id,
        purchase_batch_id: batch.id,
        movement_type: "manual_adjustment",
        quantity_change: quantityDelta,
        reference_type: "purchase_edit",
        reference_id: batch.id,
        notes: "Purchase quantity edited.",
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

  revalidatePath("/purchases");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { ok: true, message: "Purchase updated." };
}

export async function deletePurchaseAction(
  _previousState: PurchaseActionState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const purchaseId = String(formData.get("id") ?? "");

  if (!purchaseId) {
    return { message: "Purchase is required." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: batch, error: batchError } = await supabase
    .from("purchase_batches")
    .select("id, quantity, quantity_available")
    .eq("id", purchaseId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (batchError) {
    return {
      message: friendlySupabaseError(batchError, "Purchase could not be loaded."),
    };
  }

  if (!batch) {
    return { message: "Purchase batch not found." };
  }

  if (batch.quantity_available !== batch.quantity) {
    return { message: "Purchases with sales cannot be deleted." };
  }

  const { error } = await supabase
    .from("purchase_batches")
    .delete()
    .eq("id", purchaseId)
    .eq("owner_id", user.id);

  if (error) {
    return {
      message: friendlySupabaseError(error, "Purchase could not be deleted."),
    };
  }

  revalidatePath("/purchases");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { ok: true, message: "Purchase deleted." };
}
