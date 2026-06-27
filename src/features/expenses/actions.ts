"use server";

import { revalidatePath } from "next/cache";

import {
  normalizeExpenseForm,
  normalizeExpenseUpdateForm,
} from "@/features/expenses/validation";
import { getRequiredUser } from "@/lib/auth/require-user";
import { friendlySupabaseError } from "@/lib/supabase/error-message";

export type ExpenseActionState = {
  ok?: boolean;
  message?: string;
};

export async function createExpenseAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = normalizeExpenseForm(formData);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { supabase, user } = await getRequiredUser();

  if (parsed.data.related_sale_id) {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id")
      .eq("id", parsed.data.related_sale_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (saleError) {
      return { message: friendlySupabaseError(saleError, "Sale could not be loaded.") };
    }

    if (!sale) {
      return { message: "Select one of your sales or leave related sale empty." };
    }
  }

  const { error } = await supabase.from("expenses").insert({
    owner_id: user.id,
    expense_date: parsed.data.expense_date,
    category: parsed.data.category,
    amount: parsed.data.amount,
    related_sale_id: parsed.data.related_sale_id,
  });

  if (error) {
    return { message: friendlySupabaseError(error, "Expense could not be saved.") };
  }

  revalidatePath("/expenses");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  if (parsed.data.related_sale_id) {
    revalidatePath(`/sales/${parsed.data.related_sale_id}`);
  }

  return { ok: true, message: "Expense saved." };
}

export async function updateExpenseAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const parsed = normalizeExpenseUpdateForm(formData);

  if (!parsed.success) {
    return { message: parsed.message };
  }

  const { supabase, user } = await getRequiredUser();

  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("id, related_sale_id")
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (expenseError) {
    return {
      message: friendlySupabaseError(
        expenseError,
        "Expense could not be loaded.",
      ),
    };
  }

  if (!expense) {
    return { message: "Expense not found." };
  }

  if (parsed.data.related_sale_id) {
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id")
      .eq("id", parsed.data.related_sale_id)
      .eq("owner_id", user.id)
      .maybeSingle();

    if (saleError) {
      return { message: friendlySupabaseError(saleError, "Sale could not be loaded.") };
    }

    if (!sale) {
      return { message: "Select one of your sales or leave related sale empty." };
    }
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      expense_date: parsed.data.expense_date,
      category: parsed.data.category,
      amount: parsed.data.amount,
      related_sale_id: parsed.data.related_sale_id,
    })
    .eq("id", parsed.data.id)
    .eq("owner_id", user.id);

  if (error) {
    return { message: friendlySupabaseError(error, "Expense could not be updated.") };
  }

  revalidatePath("/expenses");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  if (expense.related_sale_id) {
    revalidatePath(`/sales/${expense.related_sale_id}`);
  }
  if (parsed.data.related_sale_id) {
    revalidatePath(`/sales/${parsed.data.related_sale_id}`);
  }

  return { ok: true, message: "Expense updated." };
}

export async function deleteExpenseAction(
  _previousState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  const expenseId = String(formData.get("id") ?? "");

  if (!expenseId) {
    return { message: "Expense is required." };
  }

  const { supabase, user } = await getRequiredUser();
  const { data: expense, error: expenseError } = await supabase
    .from("expenses")
    .select("id, related_sale_id")
    .eq("id", expenseId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (expenseError) {
    return {
      message: friendlySupabaseError(
        expenseError,
        "Expense could not be loaded.",
      ),
    };
  }

  if (!expense) {
    return { message: "Expense not found." };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("owner_id", user.id);

  if (error) {
    return { message: friendlySupabaseError(error, "Expense could not be deleted.") };
  }

  revalidatePath("/expenses");
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  if (expense.related_sale_id) {
    revalidatePath(`/sales/${expense.related_sale_id}`);
  }

  return { ok: true, message: "Expense deleted." };
}
