import { z } from "zod";

import {
  calculateLandedUnitCost,
  calculateTotalItemCost,
  calculateTotalPurchaseCost,
} from "@/lib/calculations/inventory";

const optionalUuidSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value))
  .pipe(z.uuid().nullable());

const optionalNotesSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

const optionalNameSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

const numericField = (message: string) =>
  z.coerce
    .number({
      error: "Enter a valid number.",
    })
    .finite("Enter a valid number.")
    .refine((value) => value >= 0, message);

export const purchaseFormSchema = z
  .object({
    product_id: optionalUuidSchema,
    new_product_name: optionalNameSchema,
    variant_id: optionalUuidSchema,
    new_variant_name: optionalNameSchema,
    supplier_id: optionalUuidSchema,
    new_supplier_name: optionalNameSchema,
    quantity: z.coerce
      .number({ error: "Quantity is required." })
      .int("Quantity must be a whole number.")
      .positive("Quantity must be greater than 0."),
    unit_price: numericField("Unit price cannot be negative."),
    shipping_fee: numericField("Shipping fee cannot be negative.").default(0),
    other_fee: numericField("Other fee cannot be negative.").default(0),
    purchase_date: z.iso.date("Purchase date is required."),
    notes: optionalNotesSchema,
  })
  .refine(
    (value) => Boolean(value.product_id || value.new_product_name),
    "Select a product or enter a new product name.",
  )
  .refine(
    (value) => Boolean(value.supplier_id || value.new_supplier_name),
    "Select a supplier or enter a new supplier name.",
  );

export type PurchaseFormData = z.infer<typeof purchaseFormSchema> & {
  quantity_available: number;
  total_item_cost: number;
  total_purchase_cost: number;
  landed_unit_cost: number;
};

export const purchaseUpdateFormSchema = z.object({
  id: z.uuid("Purchase is required."),
  quantity: z.coerce
    .number({ error: "Quantity is required." })
    .int("Quantity must be a whole number.")
    .positive("Quantity must be greater than 0."),
  unit_price: numericField("Unit price cannot be negative."),
  shipping_fee: numericField("Shipping fee cannot be negative.").default(0),
  other_fee: numericField("Other fee cannot be negative.").default(0),
  purchase_date: z.iso.date("Purchase date is required."),
  notes: optionalNotesSchema,
});

export type PurchaseUpdateFormData = z.infer<typeof purchaseUpdateFormSchema> & {
  quantity_available: number;
  total_item_cost: number;
  total_purchase_cost: number;
  landed_unit_cost: number;
};

export type PurchaseFormResult =
  | {
      success: true;
      data: PurchaseFormData;
    }
  | {
      success: false;
      message: string;
    };

export type PurchaseUpdateFormResult =
  | {
      success: true;
      data: PurchaseUpdateFormData;
    }
  | {
      success: false;
      message: string;
    };

function getRequiredString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

function getOptionalNumberString(formData: FormData, field: string) {
  const value = getRequiredString(formData, field);
  return value.trim().length === 0 ? "0" : value;
}

export function normalizePurchaseForm(formData: FormData): PurchaseFormResult {
  const parsed = purchaseFormSchema.safeParse({
    product_id: getRequiredString(formData, "product_id"),
    new_product_name: getRequiredString(formData, "new_product_name"),
    variant_id: getRequiredString(formData, "variant_id"),
    new_variant_name: getRequiredString(formData, "new_variant_name"),
    supplier_id: getRequiredString(formData, "supplier_id"),
    new_supplier_name: getRequiredString(formData, "new_supplier_name"),
    quantity: getRequiredString(formData, "quantity"),
    unit_price: getRequiredString(formData, "unit_price"),
    shipping_fee: getOptionalNumberString(formData, "shipping_fee"),
    other_fee: getOptionalNumberString(formData, "other_fee"),
    purchase_date: getRequiredString(formData, "purchase_date"),
    notes: getRequiredString(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid purchase.",
    };
  }

  const totalItemCost = calculateTotalItemCost(
    parsed.data.quantity,
    parsed.data.unit_price,
  );
  const totalPurchaseCost = calculateTotalPurchaseCost(
    parsed.data.quantity,
    parsed.data.unit_price,
    parsed.data.shipping_fee,
    parsed.data.other_fee,
  );

  return {
    success: true,
    data: {
      ...parsed.data,
      quantity_available: parsed.data.quantity,
      total_item_cost: totalItemCost,
      total_purchase_cost: totalPurchaseCost,
      landed_unit_cost: calculateLandedUnitCost(
        parsed.data.quantity,
        parsed.data.unit_price,
        parsed.data.shipping_fee,
        parsed.data.other_fee,
      ),
    },
  };
}

export function normalizePurchaseUpdateForm(
  formData: FormData,
): PurchaseUpdateFormResult {
  const parsed = purchaseUpdateFormSchema.safeParse({
    id: getRequiredString(formData, "id"),
    quantity: getRequiredString(formData, "quantity"),
    unit_price: getRequiredString(formData, "unit_price"),
    shipping_fee: getOptionalNumberString(formData, "shipping_fee"),
    other_fee: getOptionalNumberString(formData, "other_fee"),
    purchase_date: getRequiredString(formData, "purchase_date"),
    notes: getRequiredString(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid purchase.",
    };
  }

  const totalItemCost = calculateTotalItemCost(
    parsed.data.quantity,
    parsed.data.unit_price,
  );
  const totalPurchaseCost = calculateTotalPurchaseCost(
    parsed.data.quantity,
    parsed.data.unit_price,
    parsed.data.shipping_fee,
    parsed.data.other_fee,
  );

  return {
    success: true,
    data: {
      ...parsed.data,
      quantity_available: parsed.data.quantity,
      total_item_cost: totalItemCost,
      total_purchase_cost: totalPurchaseCost,
      landed_unit_cost: calculateLandedUnitCost(
        parsed.data.quantity,
        parsed.data.unit_price,
        parsed.data.shipping_fee,
        parsed.data.other_fee,
      ),
    },
  };
}
