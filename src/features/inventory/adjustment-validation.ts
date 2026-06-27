import { z } from "zod";

type AdjustmentBatchInput = {
  id: string;
  quantity: number;
  quantity_available: number;
};

const optionalNotesSchema = z
  .string()
  .trim()
  .transform((value) => (value.length === 0 ? null : value));

export const inventoryAdjustmentFormSchema = z.object({
  purchase_batch_id: z.uuid("Batch is required."),
  quantity_delta: z.coerce
    .number({ error: "Adjustment is required." })
    .int("Adjustment must be a whole number.")
    .refine((value) => value !== 0, "Adjustment cannot be zero."),
  notes: optionalNotesSchema,
});

export type InventoryAdjustmentFormData = z.infer<
  typeof inventoryAdjustmentFormSchema
> & {
  resulting_quantity_available: number;
};

export type InventoryAdjustmentFormResult =
  | {
      success: true;
      data: InventoryAdjustmentFormData;
    }
  | {
      success: false;
      message: string;
    };

function getRequiredString(formData: FormData, field: string) {
  return String(formData.get(field) ?? "");
}

export function normalizeInventoryAdjustmentForm(
  formData: FormData,
  batch: AdjustmentBatchInput | null,
): InventoryAdjustmentFormResult {
  const parsed = inventoryAdjustmentFormSchema.safeParse({
    purchase_batch_id: getRequiredString(formData, "purchase_batch_id"),
    quantity_delta: getRequiredString(formData, "quantity_delta"),
    notes: getRequiredString(formData, "notes"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid adjustment.",
    };
  }

  if (!batch || batch.id !== parsed.data.purchase_batch_id) {
    return { success: false, message: "Select an inventory batch." };
  }

  const resultingQuantity =
    batch.quantity_available + parsed.data.quantity_delta;

  if (resultingQuantity < 0) {
    return { success: false, message: "Adjustment cannot make stock negative." };
  }

  if (resultingQuantity > batch.quantity) {
    return {
      success: false,
      message: "Adjustment cannot exceed purchased quantity.",
    };
  }

  return {
    success: true,
    data: {
      ...parsed.data,
      resulting_quantity_available: resultingQuantity,
    },
  };
}
