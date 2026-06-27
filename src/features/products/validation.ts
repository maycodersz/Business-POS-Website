import { z } from "zod";

const optionalVariantNamesSchema = z
  .array(z.string())
  .default([])
  .transform((values) =>
    Array.from(
      new Set(
        values
          .map((value) => value.trim())
          .filter((value) => value.length > 0),
      ),
    ),
  );

export const productFormSchema = z.object({
  id: z.uuid().optional(),
  name: z.string().trim().min(1, "Product name is required."),
  description: z
    .string()
    .trim()
    .transform((value) => (value.length === 0 ? null : value)),
  initial_variant_names: optionalVariantNamesSchema,
});

export const variantFormSchema = z.object({
  product_id: z.uuid("Product is required."),
  variant_name: z.string().trim().min(1, "Variant name is required."),
});
