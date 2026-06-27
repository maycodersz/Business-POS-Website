"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";
import {
  productFormSchema,
  variantFormSchema,
} from "@/features/products/validation";

export type ProductActionState = {
  ok?: boolean;
  message?: string;
};

function parseProductForm(formData: FormData) {
  const initialVariantNames = formData
    .getAll("initial_variant_names")
    .map((value) => String(value));

  return productFormSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    initial_variant_names: initialVariantNames,
  });
}

export async function createProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid product." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      owner_id: user.id,
      name: parsed.data.name,
      description: parsed.data.description,
    })
    .select("id")
    .single();

  if (error) {
    return { message: friendlySupabaseError(error, "Product could not be saved.") };
  }

  if (parsed.data.initial_variant_names.length > 0) {
    const { error: variantError } = await supabase
      .from("product_variants")
      .insert(
        parsed.data.initial_variant_names.map((variantName) => ({
          owner_id: user.id,
          product_id: product.id,
          variant_name: variantName,
        })),
      );

    if (variantError) {
      await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .eq("owner_id", user.id);

      return {
        message: friendlySupabaseError(
          variantError,
          "Variant could not be saved.",
        ),
      };
    }
  }

  revalidatePath("/products");
  return { ok: true, message: "Product saved." };
}

export async function updateProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);

  if (!parsed.success || !parsed.data.id) {
    return { message: parsed.error?.issues[0]?.message ?? "Invalid product." };
  }

  const { supabase, user } = await getRequiredUser();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
    })
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) {
    return { message: friendlySupabaseError(error, "Product could not be updated.") };
  }

  revalidatePath("/products");
  return { ok: true, message: "Product updated." };
}

export async function archiveProductAction(formData: FormData) {
  const productId = String(formData.get("id") ?? "");
  const { supabase, user } = await getRequiredUser();

  if (!productId) {
    return;
  }

  await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", productId)
    .eq("owner_id", user.id);

  revalidatePath("/products");
}

export async function restoreProductAction(formData: FormData) {
  const productId = String(formData.get("id") ?? "");
  const { supabase, user } = await getRequiredUser();

  if (!productId) {
    return;
  }

  await supabase
    .from("products")
    .update({ status: "active" })
    .eq("id", productId)
    .eq("owner_id", user.id);

  revalidatePath("/products");
  revalidatePath("/purchases");
}

export async function deleteProductAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const productId = String(formData.get("id") ?? "");

  if (!productId) {
    return { message: "Product is required." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (productError) {
    return {
      message: friendlySupabaseError(
        productError,
        "Product could not be loaded.",
      ),
    };
  }

  if (!product) {
    return { message: "Product not found." };
  }

  if (product.status !== "archived") {
    return { message: "Archive this product before deleting it." };
  }

  const { data: saleItems, error: saleItemsError } = await supabase
    .from("sale_items")
    .select("sale_id")
    .eq("product_id", productId)
    .eq("owner_id", user.id);

  if (saleItemsError) {
    return {
      message: friendlySupabaseError(
        saleItemsError,
        "Product sales could not be checked.",
      ),
    };
  }

  const saleIds = Array.from(
    new Set((saleItems ?? []).map((item) => item.sale_id)),
  );

  const { error: movementDeleteError } = await supabase
    .from("inventory_movements")
    .delete()
    .eq("product_id", productId)
    .eq("owner_id", user.id);

  if (movementDeleteError) {
    return {
      message: friendlySupabaseError(
        movementDeleteError,
        "Product inventory history could not be deleted.",
      ),
    };
  }

  if (saleIds.length > 0) {
    const { error: salesDeleteError } = await supabase
      .from("sales")
      .delete()
      .eq("owner_id", user.id)
      .in("id", saleIds);

    if (salesDeleteError) {
      return {
        message: friendlySupabaseError(
          salesDeleteError,
          "Product sales could not be deleted.",
        ),
      };
    }
  }

  const { error: purchaseDeleteError } = await supabase
    .from("purchase_batches")
    .delete()
    .eq("product_id", productId)
    .eq("owner_id", user.id);

  if (purchaseDeleteError) {
    return {
      message: friendlySupabaseError(
        purchaseDeleteError,
        "Product purchases could not be deleted.",
      ),
    };
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("owner_id", user.id)
    .eq("status", "archived");

  if (error) {
    return {
      message: friendlySupabaseError(error, "Product could not be deleted."),
    };
  }

  revalidatePath("/products");
  revalidatePath("/purchases");
  revalidatePath("/sales");
  revalidatePath("/expenses");
  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/reports");

  return { ok: true, message: "Product deleted." };
}

export async function addVariantAction(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = variantFormSchema.safeParse({
    product_id: String(formData.get("product_id") ?? ""),
    variant_name: String(formData.get("variant_name") ?? ""),
  });

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid variant." };
  }

  const { supabase, user } = await getRequiredUser();
  const { error } = await supabase.from("product_variants").insert({
    owner_id: user.id,
    product_id: parsed.data.product_id,
    variant_name: parsed.data.variant_name,
  });

  if (error) {
    return {
      message: friendlySupabaseError(error, "Variant could not be added."),
    };
  }

  revalidatePath("/products");
  return { ok: true, message: "Variant added." };
}
