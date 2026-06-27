import { z } from "zod";

export const expenseCategories = [
  "shipping",
  "packaging",
  "refund",
  "labour",
] as const;

const optionalSaleSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(z.uuid().nullable());

export const expenseFormSchema = z.object({
  expense_date: z.iso.date("Expense date is required."),
  category: z.enum(expenseCategories, {
    error: "Select a valid expense category.",
  }),
  amount: z.coerce
    .number({ error: "Amount is required." })
    .finite("Enter a valid amount.")
    .positive("Amount must be greater than 0."),
  related_sale_id: optionalSaleSchema,
});

export type ExpenseFormData = z.infer<typeof expenseFormSchema>;
export const expenseUpdateFormSchema = expenseFormSchema.extend({
  id: z.uuid("Expense is required."),
});

export type ExpenseUpdateFormData = z.infer<typeof expenseUpdateFormSchema>;

export type ExpenseFormResult =
  | {
      success: true;
      data: ExpenseFormData;
    }
  | {
      success: false;
      message: string;
    };

export type ExpenseUpdateFormResult =
  | {
      success: true;
      data: ExpenseUpdateFormData;
    }
  | {
      success: false;
      message: string;
    };

function getRequiredString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

export function normalizeExpenseForm(formData: FormData): ExpenseFormResult {
  const parsed = expenseFormSchema.safeParse({
    expense_date: getRequiredString(formData, "expense_date"),
    category: getRequiredString(formData, "category"),
    amount: getRequiredString(formData, "amount"),
    related_sale_id: getRequiredString(formData, "related_sale_id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid expense.",
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}

export function normalizeExpenseUpdateForm(
  formData: FormData,
): ExpenseUpdateFormResult {
  const parsed = expenseUpdateFormSchema.safeParse({
    id: getRequiredString(formData, "id"),
    expense_date: getRequiredString(formData, "expense_date"),
    category: getRequiredString(formData, "category"),
    amount: getRequiredString(formData, "amount"),
    related_sale_id: getRequiredString(formData, "related_sale_id"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid expense.",
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
