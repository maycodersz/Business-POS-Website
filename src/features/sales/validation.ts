import { z } from "zod";

import {
  calculateCOGS,
  calculateGrossProfit,
  calculateSaleRevenue,
} from "@/lib/calculations/inventory";
import { expenseCategories } from "@/features/expenses/validation";

type SaleBatchInput = {
  id: string;
  quantity_available: number;
  landed_unit_cost: number | null;
};

type SaleUpdateCapacityInput = {
  quantity_sold: number;
  batch_quantity_available: number;
  unit_cogs: number;
};

const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

const optionalExpenseCategorySchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(z.enum(expenseCategories).nullable());

const optionalExpenseAmountSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .transform((value) => (value === null ? null : Number(value)))
  .refine(
    (value) => value === null || Number.isFinite(value),
    "Enter a valid expense amount.",
  )
  .refine(
    (value) => value === null || Number.isInteger(value),
    "Expense amount must be a whole number.",
  )
  .refine(
    (value) => value === null || value > 0,
    "Expense amount must be greater than 0.",
  );

export const saleFormSchema = z.object({
  purchase_batch_id: z.uuid("Batch is required."),
  quantity_sold: z.coerce
    .number({ error: "Quantity sold is required." })
    .int("Quantity sold must be a whole number.")
    .positive("Quantity sold must be greater than 0."),
  selling_price: z.coerce
    .number({ error: "Selling price is required." })
    .finite("Enter a valid selling price.")
    .int("Selling price must be a whole number.")
    .refine((value) => value >= 0, "Selling price cannot be negative."),
  sale_date: z.iso.date("Sale date is required."),
  customer_name: optionalTextSchema,
  platform: optionalTextSchema,
  notes: optionalTextSchema,
  sale_expense_category: optionalExpenseCategorySchema,
  sale_expense_amount: optionalExpenseAmountSchema,
}).refine(
  (data) =>
    (data.sale_expense_category === null && data.sale_expense_amount === null) ||
    (data.sale_expense_category !== null && data.sale_expense_amount !== null),
  {
    message: "Choose an expense category and enter an amount, or leave both blank.",
    path: ["sale_expense_amount"],
  },
);

export const saleUpdateFormSchema = z.object({
  sale_id: z.uuid("Sale is required."),
  quantity_sold: z.coerce
    .number({ error: "Quantity sold is required." })
    .int("Quantity sold must be a whole number.")
    .positive("Quantity sold must be greater than 0."),
  selling_price: z.coerce
    .number({ error: "Selling price is required." })
    .finite("Enter a valid selling price.")
    .int("Selling price must be a whole number.")
    .refine((value) => value >= 0, "Selling price cannot be negative."),
  sale_date: z.iso.date("Sale date is required."),
  customer_name: optionalTextSchema,
  platform: optionalTextSchema,
  notes: optionalTextSchema,
});

export type SaleFormData = z.infer<typeof saleFormSchema> & {
  unit_cogs: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
};

export type SaleUpdateFormData = z.infer<typeof saleUpdateFormSchema> & {
  unit_cogs: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
};

export type SaleFormResult =
  | {
      success: true;
      data: SaleFormData;
    }
  | {
      success: false;
      message: string;
    };

export type SaleUpdateFormResult =
  | {
      success: true;
      data: SaleUpdateFormData;
    }
  | {
      success: false;
      message: string;
    };

function getRequiredString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

export function normalizeSaleForm(
  formData: FormData,
  batch: SaleBatchInput | null,
): SaleFormResult {
  const parsed = saleFormSchema.safeParse({
    purchase_batch_id: getRequiredString(formData, "purchase_batch_id"),
    quantity_sold: getRequiredString(formData, "quantity_sold"),
    selling_price: getRequiredString(formData, "selling_price"),
    sale_date: getRequiredString(formData, "sale_date"),
    customer_name: getRequiredString(formData, "customer_name"),
    platform: getRequiredString(formData, "platform"),
    notes: getRequiredString(formData, "notes"),
    sale_expense_category: getRequiredString(formData, "sale_expense_category"),
    sale_expense_amount: getRequiredString(formData, "sale_expense_amount"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid sale.",
    };
  }

  if (!batch || batch.id !== parsed.data.purchase_batch_id) {
    return { success: false, message: "Select an available batch." };
  }

  if (parsed.data.quantity_sold > batch.quantity_available) {
    return { success: false, message: "Cannot sell more than available stock." };
  }

  const unitCogs = batch.landed_unit_cost ?? 0;
  const revenue = calculateSaleRevenue(
    parsed.data.quantity_sold,
    parsed.data.selling_price,
  );
  const cogs = calculateCOGS(parsed.data.quantity_sold, unitCogs);

  return {
    success: true,
    data: {
      ...parsed.data,
      unit_cogs: unitCogs,
      revenue,
      cogs,
      gross_profit: calculateGrossProfit(revenue, cogs),
    },
  };
}

export function normalizeSaleUpdateForm(
  formData: FormData,
  capacity: SaleUpdateCapacityInput | null,
): SaleUpdateFormResult {
  const parsed = saleUpdateFormSchema.safeParse({
    sale_id: getRequiredString(formData, "sale_id"),
    quantity_sold: getRequiredString(formData, "quantity_sold"),
    selling_price: getRequiredString(formData, "selling_price"),
    sale_date: getRequiredString(formData, "sale_date"),
    customer_name: getRequiredString(formData, "customer_name"),
    platform: getRequiredString(formData, "platform"),
    notes: getRequiredString(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid sale.",
    };
  }

  if (!capacity) {
    return { success: false, message: "Sale not found." };
  }

  const maxQuantity =
    capacity.quantity_sold + capacity.batch_quantity_available;

  if (parsed.data.quantity_sold > maxQuantity) {
    return { success: false, message: "Cannot sell more than available stock." };
  }

  const revenue = calculateSaleRevenue(
    parsed.data.quantity_sold,
    parsed.data.selling_price,
  );
  const cogs = calculateCOGS(parsed.data.quantity_sold, capacity.unit_cogs);

  return {
    success: true,
    data: {
      ...parsed.data,
      unit_cogs: capacity.unit_cogs,
      revenue,
      cogs,
      gross_profit: calculateGrossProfit(revenue, cogs),
    },
  };
}
