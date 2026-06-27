"use server";

import { revalidatePath } from "next/cache";

import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";
import { supplierFormSchema } from "@/features/suppliers/validation";

export type SupplierActionState = {
  ok?: boolean;
  message?: string;
};

function parseSupplierForm(formData: FormData) {
  return supplierFormSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    facebook_link: String(formData.get("facebook_link") ?? ""),
    messenger_link: String(formData.get("messenger_link") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  });
}

export async function createSupplierAction(
  _previousState: SupplierActionState,
  formData: FormData,
): Promise<SupplierActionState> {
  const parsed = parseSupplierForm(formData);

  if (!parsed.success) {
    return { message: parsed.error.issues[0]?.message ?? "Invalid supplier." };
  }

  const { supabase, user } = await getRequiredUser();
  const { error } = await supabase.from("suppliers").insert({
    owner_id: user.id,
    name: parsed.data.name,
    facebook_link: parsed.data.facebook_link,
    messenger_link: parsed.data.messenger_link,
    notes: parsed.data.notes,
  });

  if (error) {
    return {
      message: friendlySupabaseError(error, "Supplier could not be saved."),
    };
  }

  revalidatePath("/suppliers");
  return { ok: true, message: "Supplier saved." };
}

export async function updateSupplierAction(
  _previousState: SupplierActionState,
  formData: FormData,
): Promise<SupplierActionState> {
  const parsed = parseSupplierForm(formData);

  if (!parsed.success || !parsed.data.id) {
    return { message: parsed.error?.issues[0]?.message ?? "Invalid supplier." };
  }

  const { supabase, user } = await getRequiredUser();
  const { error } = await supabase
    .from("suppliers")
    .update({
      name: parsed.data.name,
      facebook_link: parsed.data.facebook_link,
      messenger_link: parsed.data.messenger_link,
      notes: parsed.data.notes,
    })
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) {
    return {
      message: friendlySupabaseError(error, "Supplier could not be updated."),
    };
  }

  revalidatePath("/suppliers");
  return { ok: true, message: "Supplier updated." };
}

export async function deleteSupplierAction(
  _previousState: SupplierActionState,
  formData: FormData,
): Promise<SupplierActionState> {
  const supplierId = String(formData.get("id") ?? "");

  if (!supplierId) {
    return { message: "Supplier is required." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", supplierId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (supplierError) {
    return {
      message: friendlySupabaseError(
        supplierError,
        "Supplier could not be loaded.",
      ),
    };
  }

  if (!supplier) {
    return { message: "Supplier not found." };
  }

  const { error } = await supabase
    .from("suppliers")
    .delete()
    .eq("id", supplierId)
    .eq("owner_id", user.id);

  if (error) {
    return {
      message: friendlySupabaseError(error, "Supplier could not be deleted."),
    };
  }

  revalidatePath("/suppliers");
  revalidatePath("/purchases");
  revalidatePath("/inventory");
  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/sales");

  return { ok: true, message: "Supplier deleted." };
}
